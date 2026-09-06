# Letter Tracer — Plan

A mobile-first PWA where a toddler traces letters and numbers with a finger.
Thin dashed stroke guides teach correct letter formation, a flashing arrow shows
where the next stroke starts and which way it goes, and a celebration fires on
completion. The bottom of the screen shows a colorful picture of a word starting
with that letter.

**Repo:** https://github.com/mckoss/letter-tracer
**Stack:** SvelteKit 2 + Svelte 5 (runes) + TypeScript, `adapter-static`, Vite 8,
Vitest. Node pinned to LTS 24.20.0 (`.nvmrc`).

## Decisions locked

| Question     | Decision                                                               |
| ------------ | ---------------------------------------------------------------------- |
| Word artwork | Hand-authored SVG, **Poster** style (see below)                        |
| Letterforms  | Simple block print (Zaner-Bloser style manuscript)                     |
| Letter order | Alphabetical **and** easy-first, as a toggle                           |
| Navigation   | Grid picker of the whole set, plus a "Play all" that auto-advances     |
| Stroke order | Taught, not enforced — see _Stroke order_ below                        |
| Hosting      | GitHub Pages via Actions, `adapter-static`, base path `/letter-tracer` |
| Audio        | Silent in v1. Structure the code so a toggle can be added later.       |
| Persistence  | `localStorage` only. No accounts, no network, no analytics.            |

## Screens

1. **Splash** — animated, ≤5s, tap to skip. A pencil draws a big `A`, letters
   tumble in, title lands. Never blocks a returning user for long.
2. **Home** — three big cards: `ABC` (capitals), `abc` (lowercase), `123`
   (numbers). Today's star count + play streak badge.
3. **Trace** — portrait layout:
   - top ~12%: back button, per-letter stroke dots, star counter
   - middle ~68%: the tracing stage
   - bottom 20%: word illustration + the word itself
4. **Progress** (later) — calendar heatmap of stars per day.

## Core design: glyph stroke data

Every glyph is just an **ordered list of SVG path `d` strings**, one per stroke,
written in the order and direction a child should form them. No hand-computed
geometry: the browser's `SVGGeometryElement.getTotalLength()` /
`getPointAtLength()` give us exact arc-length parametrization, start points and
initial tangents for free.

Shared normalized box, `viewBox="0 0 100 140"`, matching a handwriting guide:

```
y =  10  cap / ascender line
y =  60  midline (x-height)
y = 110  baseline
y = 138  descender
```

All 62 glyphs (`A–Z`, `a–z`, `0–9`) are authored in `src/lib/glyphs/data.ts` and
verified against a rendered contact sheet that draws each one with numbered
start dots and a direction arrow per stroke.

A stroke shorter than `DOT_LENGTH` (the tittle on `i` and `j`) is a dot: it
renders as a round cap and completes on a tap rather than a drag.

## Stroke order

Correct stroke order is the thing actually being taught, so the app teaches it
without ever blocking a child who ignores it.

**The arrow.** A flashing arrow marks the start point of the next stroke in the
canonical order and points along that stroke's initial tangent. Both come from
path geometry (`getPointAtLength(0)` and a sample a few units in), so no glyph
carries arrow data of its own. The arrow hides while a stroke is in progress and
reappears on the next remaining stroke. It sits on the lowest-numbered
_incomplete_ stroke, so it keeps giving useful guidance even after a child has
worked out of order.

**Out of order is still valid.** The engine treats the strokes of a glyph as a
set of candidates rather than a fixed sequence. On `pointerdown` it arms
whichever incomplete stroke has a start point nearest the finger, so any stroke
can be drawn at any time. Tracing a stroke backwards — starting from its end
point — is likewise accepted.

**Two-tier celebration.** Completing every stroke always finishes the letter.

|                                                  | Celebration                              | Stars |
| ------------------------------------------------ | ---------------------------------------- | ----- |
| Every stroke in the taught order _and_ direction | Full: confetti, rainbow fill, bounce     | 2     |
| Right shape, wrong order or direction            | Quieter: a gentle fill and a single star | 1     |

No child ever loses a letter or a star for bad order; the difference is only in
how much the app cheers. _(Assumption, easily changed: 2 stars vs 1.)_

## Core design: the tracing engine

Per armed stroke:

1. Measure the path, sample ~1 point per 2 user units into `pts[]`.
2. `pointerdown` must land within `startRadius` of some incomplete stroke's
   start (or end) point to arm it. Otherwise: bounce the arrow, ignore.
3. `pointermove` searches a forward window `[progress, progress + lookahead]`
   for the sample nearest the finger. Within `tolerance` → advance `progress`.
   Finger strays wide → **hold** progress rather than failing. Toddler-forgiving:
   you can wander off and come back.
4. Ink reveal is `stroke-dashoffset = total * (1 - progress/n)` on a colored
   copy of the path — GPU-composited, no per-frame redraw of geometry.
5. Stroke completes at ≥92% progress → pop animation, arrow moves on.
6. `pointerup` early → gentle rewind to the start, retry.

Tolerances scale with rendered glyph height `H`: `tolerance ≈ 0.14H`,
`startRadius ≈ 0.16H`. These become a difficulty setting later.

Pointer Events throughout (`touch-action: none`) so mouse, touch and stylus all
work; testable with a mouse on desktop.

### Line weights

Deliberately fine, so letters read as letters rather than as blobs on a small
screen:

- **Guide**: ~1.6&nbsp;px dashed (`stroke-dasharray: 5 5`) with
  `vector-effect: non-scaling-stroke`, so the guide stays hairline-thin at any
  glyph size — a worksheet dashed line, not a row of fat dots.
- **Child's ink**: ~7 user units (7% of cap height), round caps. Thick enough to
  feel like a crayon, thin enough that `a`, `e`, `g` and `8` keep their counters
  open at phone size.

## Word band

The bottom 20% shows the word picture and the word. **No "A is for Apple"** —
the letter is already on screen, so the sentence is redundant.

The word is set in the app's own letterforms: it is drawn from the same glyph
stroke data the child is tracing, laid out with per-character advances measured
from `getBBox()` at runtime. The app therefore has exactly one typeface — the
one it teaches — and the child sees the letter they just traced repeated in the
word beneath it.

**Case follows the active set:** `APPLE` while tracing capitals, `apple` while
tracing lowercase. Digits show the count word (`THREE` / `three`) beside a
counting scene.

## Art style: Poster

Hand-authored SVG in a national-park-poster treatment: a muted retro palette,
three hard tone bands per shape, and a pale sage disc behind the subject.

Nothing is shaded by hand. Each shape is used as a clip, and three concentric
discs centred up and to the left paint a lit band, the base tone and a shadow
tone across it. Every object in a picture is lit by the same discs, so a scene
reads as one light source and a new subject inherits the shading for free. The
shadow tone is the fill _mixed toward warm plum_ rather than simply darkened,
which is what keeps light tints tan instead of grey.

Subjects describe themselves as a list of primitives; the style decides fill,
outline and shading. Adding a style never touches a drawing.
`src/routes/styles` renders the candidates side by side.

**Word list (draft):** apple · ball · cat · dog · elephant · fish · goat · hat ·
igloo · juice · kite · leaf · moon · nest · orange · penguin · queen · rainbow ·
sun · tree · umbrella · violin · whale · xylophone · yo-yo · zebra

Lowercase reuses the same illustrations. Digits get a **count scene**
(`3` → three balloons), which teaches numeracy alongside the numeral.

## Persistence

```ts
// localStorage key: "letter-tracer:v1"
type Store = {
	version: 1;
	days: Record<string, { stars: number; chars: string[] }>; // "YYYY-MM-DD"
	totals: { byChar: Record<string, number> };
	lastSet: 'upper' | 'lower' | 'digits';
	order: 'alpha' | 'easy';
};
```

Written through a small `$state`-backed store module so nothing else touches
`localStorage` directly (and SSR/prerender never touches it at all).

## PWA

- `static/manifest.webmanifest`: `display: standalone`, `orientation: portrait`,
  theme color, 192/512 icons + a maskable variant.
- `src/service-worker.ts` using SvelteKit's `$service-worker` module: precache
  `build` + `files` on install, cache-first at runtime, drop old versions on
  activate. Fully playable offline after first load.
- iOS: `apple-touch-icon` + `apple-mobile-web-app-*` meta tags.
- An in-app "Add to Home Screen" prompt via `beforeinstallprompt` (Android),
  with a short illustrated hint for iOS Safari.

## Milestones

- [x] **M1** — repo, scaffold, Node pin, this plan
- [x] **M2** — art style samples → **Poster** chosen
- [x] **M3a** — stroke data for all 62 glyphs, verified on a contact sheet
- [ ] **M3b** — tracing engine, flashing arrow, two-tier celebration, trace screen
- [ ] **M4** — splash, home, grid picker, order toggle, scoring, PWA manifest +
      service worker, GitHub Pages deploy
- [ ] **M5** — 26 word illustrations in Poster style + 10 digit counting scenes
- [ ] **M6** — polish: difficulty setting, progress calendar, optional audio
      toggle, reduced-motion pass

## Backlog

- **Katakana and hiragana sets.** The engine already treats a glyph as an
  ordered list of strokes with a taught order and direction, which is exactly
  how Japanese kana are taught — and where stroke order matters far more than it
  does in the Latin alphabet. Needs: 46 kana per syllabary (plus dakuten
  variants), a set picker that scales past three options, and word pictures
  chosen for the kana rather than the letter. The guide box would want a square
  aspect rather than the current ascender/descender ruling.
- Cursive / D'Nealian as an alternate letterform set.
- Left-handed mode (mirror the arrow offset so the hand doesn't cover the guide).

## Open questions

1. **What counts as a star** — plan assumes 2 for taught order, 1 otherwise,
   never zero.
2. **Lowercase `a` and `g`** — plan assumes single-story, which is what US
   manuscript teaches.

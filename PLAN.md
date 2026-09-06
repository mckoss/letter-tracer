# Letter Tracer — Plan

A mobile-first PWA where a toddler traces letters and numbers with a finger.
Dotted stroke guides teach correct letter formation; a celebration fires on
completion; the bottom of the screen shows a colorful picture of a word starting
with that letter.

**Repo:** https://github.com/mckoss/letter-tracer
**Stack:** SvelteKit 2 + Svelte 5 (runes) + TypeScript, `adapter-static`, Vite 8,
Vitest. Node pinned to LTS 24.20.0 (`.nvmrc`).

## Decisions locked

| Question     | Decision                                                               |
| ------------ | ---------------------------------------------------------------------- |
| Word artwork | Hand-authored SVG (flat vector). 3 style samples first, then all 26.   |
| Letterforms  | Simple block print (Zaner-Bloser style manuscript)                     |
| Hosting      | GitHub Pages via Actions, `adapter-static`, base path `/letter-tracer` |
| Audio        | Silent in v1. Structure the code so a toggle can be added later.       |
| Persistence  | `localStorage` only. No accounts, no network, no analytics.            |

## Screens

1. **Splash** — animated, ≤5s, tap to skip. A pencil draws a big `A`, letters
   tumble in, title lands. Never blocks a returning user for long.
2. **Home** — three big cards: `ABC` (capitals), `abc` (lowercase), `123`
   (numbers). Today's star count + play streak badge.
3. **Trace** — portrait layout:
   - top ~12%: back button, per-letter progress dots, star counter
   - middle ~68%: the tracing stage
   - bottom 20%: word illustration + word label ("A is for Apple")
4. **Progress** (later) — calendar heatmap of stars per day.

## Core design: glyph stroke data

Every glyph is just an **ordered list of SVG path `d` strings**, one per stroke,
written in the order and direction a child should form them. No hand-computed
geometry: the browser's `SVGGeometryElement.getTotalLength()` /
`getPointAtLength()` give us exact arc-length parametrization for free.

```ts
type Glyph = { char: string; strokes: string[] };
// 'A' → ["M 20 110 L 50 12", "M 50 12 L 80 110", "M 32 74 L 68 74"]
```

Shared normalized box, `viewBox="0 0 100 140"`, matching a handwriting guide:

```
y =  10  cap / ascender line
y =  60  midline (x-height)
y = 110  baseline
y = 138  descender
```

Coverage: `A–Z` (26), `a–z` (26), `0–9` (10) = 62 glyphs.

## Core design: the tracing engine

Per active stroke:

1. Measure the path, sample ~1 point per 2 user units into `pts[]`.
2. `pointerdown` must land within `startRadius` of `pts[0]` to arm the stroke.
   Otherwise: bounce the start dot, ignore.
3. `pointermove` searches a forward window `[progress, progress + lookahead]`
   for the sample nearest the finger. Within `tolerance` → advance `progress`.
   Finger strays wide → **hold** progress rather than failing. Toddler-forgiving:
   you can wander off and come back.
4. Ink reveal is `stroke-dashoffset = total * (1 - progress/n)` on a colored
   copy of the path — GPU-composited, no per-frame redraw of geometry.
5. Stroke completes at ≥92% progress → pop animation, advance to next stroke.
6. `pointerup` early → gentle rewind to the start dot, retry.

Tolerances scale with rendered glyph height `H`: `tolerance ≈ 0.14H`,
`startRadius ≈ 0.16H`. These become a difficulty setting later.

Affordances on the stage: dotted guide outline (`stroke-dasharray` + round
caps), numbered start dots, direction arrowheads, and a one-shot "ghost finger"
that demonstrates the stroke when a letter first appears.

Pointer Events throughout (`touch-action: none`) so mouse, touch and stylus all
work; testable with a mouse on desktop.

## Celebration

All strokes done → the letter fills with a rainbow gradient and bounces,
confetti bursts from the letter's center, a star flies to the counter, and the
app auto-advances after ~1.8s. Respects `prefers-reduced-motion`.

## Word list (draft)

apple · ball · cat · dog · elephant · fish · goat · hat · igloo · juice · kite ·
leaf · moon · nest · orange · penguin · queen · rainbow · sun · tree · umbrella ·
violin · whale · xylophone · yo-yo · zebra

Lowercase reuses the same illustrations. Digits show a **count scene** instead
(`3` → three balloons), which teaches numeracy alongside the numeral.

## Persistence

```ts
// localStorage key: "letter-tracer:v1"
type Store = {
	version: 1;
	days: Record<string, { stars: number; chars: string[] }>; // "YYYY-MM-DD"
	totals: { byChar: Record<string, number> };
	lastSet: 'upper' | 'lower' | 'digits';
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
- [ ] **M2** — 3 word-art style samples → pick one
- [ ] **M3** — glyph data for all 62 glyphs + tracing engine + trace screen
- [ ] **M4** — splash, home, scoring, PWA manifest + service worker, GitHub
      Pages deploy
- [ ] **M5** — all 26 word illustrations + 10 digit count scenes
- [ ] **M6** — polish: difficulty setting, progress calendar, optional audio
      toggle, reduced-motion pass

## Open questions

1. **Letter order** — alphabetical, or the easy-first order many curricula use
   (`c o s v w` before `k y z`)? Alphabetical is the obvious default; easy-first
   is pedagogically better.
2. **Free play vs. sequence** — should a child be able to jump to any letter
   from a grid, or only walk the set in order? Plan assumes: grid picker, with a
   "play all" button.
3. **What counts as a star** — one per completed letter, or bonus stars for
   accuracy/no-retry? Plan assumes one star per letter, keeping it unlosable.
4. **Lowercase `a` and `g`** — single-story (`ɑ`, `g`) is what US manuscript
   teaches. Plan assumes single-story.

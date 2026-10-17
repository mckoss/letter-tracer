<script lang="ts">
	// The word under the picture, set in the app's own letterforms -- the very
	// same stroke data the child is tracing. The app has exactly one typeface:
	// the one it teaches. Case is the caller's business (see `wordFor`), so
	// tracing capitals shows APPLE and lowercase shows apple.
	//
	// In cursive the word is joined up, as it would be written: each letter's
	// exit runs on into the next letter's lead-in.
	import { browser } from '$app/environment';
	import { CURSIVE_SETS, SETS, type Hand } from '$lib/glyphs/data';
	import { JOINS } from '$lib/glyphs/cursive';
	import { glyphExtents, samplePoints } from '$lib/glyphs/measure';
	import type { Pt } from '$lib/trace/engine';

	let {
		text,
		hand = 'print',
		height = 30,
		color = '#3B3039',
		weight = 9
	}: { text: string; hand?: Hand; height?: number; color?: string; weight?: number } = $props();

	// Side bearing and word space, in glyph user units. Bearings are measured
	// from the *stroked* edge, not the path geometry: a monoline glyph paints
	// weight/2 beyond its bounding box on each side, so spacing off the raw box
	// leaves neighbouring letters all but touching.
	const SIDE = 7;
	const SPACE = 24;

	/**
	 * How far a lead-in is cut back when it joins a letter that exits along the
	 * midline (b, o, v, w): the joined letter is picked up from where its own
	 * lead-in reaches the height of the bridge. Most letters reach it at their top,
	 * which is right -- the bridge runs straight into the a of "oa" -- but e would
	 * lose its loop, so the bridge dips this much below the midline to meet it.
	 */
	const DIP: Record<string, number> = { e: 14 };
	/** How far a joined letter's body may tuck back under the stroke that joins it. */
	const TUCK = 4;

	const layout = $derived.by(() => (hand === 'cursive' ? joined(text) : printed(text)));

	function printed(text: string) {
		const items: { strokes: string[]; x: number }[] = [];
		if (!browser || !text) return { items, w: 1, y0: 0, y1: 1 };
		let x = 0;
		let y0 = Infinity;
		let y1 = -Infinity;
		for (const ch of text) {
			if (ch === ' ') {
				x += SPACE;
				continue;
			}
			const strokes = SETS.upper[ch] ?? SETS.lower[ch] ?? SETS.digits[ch];
			if (!strokes) continue;
			const e = glyphExtents(strokes);
			items.push({ strokes, x: x + SIDE + weight / 2 - e.x0 });
			x += e.x1 - e.x0 + weight + SIDE * 2;
			y0 = Math.min(y0, e.y0);
			y1 = Math.max(y1, e.y1);
		}
		const pad = weight / 2 + 1;
		return { items, w: Math.max(x, 1), y0: y0 - pad, y1: y1 + pad };
	}

	/**
	 * Cursive, joined up. Every lowercase letter's first stroke runs lead-in to
	 * exit, so a letter that follows another is picked up from the point where its
	 * lead-in reaches the height the last one left off at, and slid along until
	 * that point meets the exit. Spaces, digits and the capitals that do not join
	 * (D, O, P...) break the run and are spaced like print.
	 */
	function joined(text: string) {
		const lines: Pt[][] = [];
		if (!browser || !text) return { items: [], w: 1, y0: 0, y1: 1 };
		let x = 0;
		let exit: Pt | null = null;
		let prev: Pt[] | null = null;
		for (const ch of text) {
			if (ch === ' ') {
				x += SPACE;
				exit = null;
				prev = null;
				continue;
			}
			const lower = ch in CURSIVE_SETS.lower;
			const strokes = CURSIVE_SETS.upper[ch] ?? CURSIVE_SETS.lower[ch] ?? CURSIVE_SETS.digits[ch];
			if (!strokes) continue;
			const pts = strokes.map((d) => samplePoints(d));
			let dx: number;
			if (exit && lower) {
				const h = exit.y + 2 + (exit.y < 80 ? (DIP[ch] ?? 0) : 0);
				const k = Math.max(
					0,
					pts[0].findIndex((p) => p.y <= h)
				);
				pts[0] = pts[0].slice(k);
				const from = pts[0][0];
				const left = Math.min(...pts.flat().map((p) => p.x));
				// Slide the letter clear if its body would sit back over the last one,
				// and let the join stretch to meet it, as a bridge does.
				dx = exit.x - from.x + Math.max(0, from.x - left - TUCK);
				pts[0].unshift({ x: exit.x - dx, y: exit.y });
			} else {
				const left = Math.min(...pts.flat().map((p) => p.x));
				dx = (prev && clearOf(prev, pts.flat())) ?? x + SIDE + weight / 2 - left;
			}
			const placed = pts.map((line) => line.map((p) => ({ x: p.x + dx, y: p.y })));
			lines.push(...placed);
			const exitAt = lower ? 0 : JOINS[ch];
			const tail = exitAt === undefined ? null : placed[exitAt];
			exit = tail ? tail[tail.length - 1] : null;
			prev = placed.flat();
			x = Math.max(x, ...prev.map((p) => p.x)) + weight / 2 + SIDE;
		}
		const all = lines.flat();
		const pad = weight / 2 + 1;
		const y0 = Math.min(...all.map((p) => p.y)) - pad;
		const y1 = Math.max(...all.map((p) => p.y)) + pad;
		const d = (line: Pt[]) =>
			line.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
		return { items: [{ strokes: lines.map(d), x: 0 }], w: Math.max(x, 1), y0, y1 };
	}

	/** Height of the bands `clearOf` compares in, in glyph units. */
	const BAND = 12;

	/**
	 * How far to slide `next` so it clears `prev` at every height, rather than
	 * clearing its bounding box. Slanted letters lean out at the top: spaced by
	 * their boxes, a D or a W that does not join would leave a gap at the baseline
	 * the width of its own lean. Null when the two share no height at all.
	 */
	function clearOf(prev: Pt[], next: Pt[]): number | null {
		const right = new Map<number, number>();
		for (const p of prev) {
			const b = Math.floor(p.y / BAND);
			// A neighbouring band counts too, so a diagonal cannot slip past a corner.
			for (const n of [b - 1, b, b + 1]) right.set(n, Math.max(right.get(n) ?? -Infinity, p.x));
		}
		let dx: number | null = null;
		for (const p of next) {
			const r = right.get(Math.floor(p.y / BAND));
			if (r === undefined) continue;
			dx = Math.max(dx ?? -Infinity, r - p.x + weight + SIDE);
		}
		return dx;
	}
</script>

<svg
	viewBox="0 {layout.y0} {layout.w} {layout.y1 - layout.y0}"
	height={height * ((layout.y1 - layout.y0) / 100)}
	width={(layout.w / (layout.y1 - layout.y0)) * height * ((layout.y1 - layout.y0) / 100)}
	role="img"
	aria-label={text}
>
	{#each layout.items as item, i (i)}
		<g transform="translate({item.x} 0)">
			{#each item.strokes as d, j (j)}
				<path
					{d}
					fill="none"
					stroke={color}
					stroke-width={weight}
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
			{/each}
		</g>
	{/each}
</svg>

<style>
	/*
	 * Shrink to fit rather than overflow. The word is as wide as it is long, and
	 * the longest are half as wide again as the box they sit in on a narrow
	 * phone -- "ICE CREAM TRUCK" against "XYLOPHONE". Width comes from the
	 * attribute above and is the flex base size, so flex-shrink can take it
	 * down; `height: auto` then follows the viewBox rather than the attribute,
	 * and the word simply gets smaller instead of running off the screen.
	 */
	svg {
		display: block;
		overflow: visible;
		max-width: 100%;
		min-width: 0;
		flex-shrink: 1;
		height: auto;
	}
</style>

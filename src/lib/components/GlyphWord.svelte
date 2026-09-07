<script lang="ts">
	// The word under the picture, set in the app's own letterforms -- the very
	// same stroke data the child is tracing. The app has exactly one typeface:
	// the one it teaches. Case is the caller's business (see `wordFor`), so
	// tracing capitals shows APPLE and lowercase shows apple.
	import { browser } from '$app/environment';
	import { SETS } from '$lib/glyphs/data';
	import { glyphExtents } from '$lib/glyphs/measure';

	let {
		text,
		height = 30,
		color = '#3B3039',
		weight = 9
	}: { text: string; height?: number; color?: string; weight?: number } = $props();

	/** Side bearing and word space, in glyph user units. */
	const SIDE = 5;
	const SPACE = 26;

	const layout = $derived.by(() => {
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
			items.push({ strokes, x: x + SIDE - e.x0 });
			x += e.x1 - e.x0 + SIDE * 2;
			y0 = Math.min(y0, e.y0);
			y1 = Math.max(y1, e.y1);
		}
		const pad = weight / 2 + 1;
		return { items, w: Math.max(x, 1), y0: y0 - pad, y1: y1 + pad };
	});
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
	svg {
		display: block;
		overflow: visible;
	}
</style>

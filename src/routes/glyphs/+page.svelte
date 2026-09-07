<script lang="ts">
	// Review sheet for the stroke data: every glyph with its guide rules, numbered
	// start dots and a direction arrow per stroke, so stroke order and direction
	// can be checked at a glance. Development aid, not part of the child's app.
	import { browser } from '$app/environment';
	import { ORDER, SETS, GUIDE, type StrokeSet } from '$lib/glyphs/data';
	import { strokeInfo } from '$lib/glyphs/measure';

	const SECTIONS: { key: StrokeSet; name: string }[] = [
		{ key: 'upper', name: 'Capitals' },
		{ key: 'lower', name: 'Lowercase' },
		{ key: 'digits', name: 'Numbers' }
	];
	const COLORS = ['#C34C3E', '#3E7C7B', '#4C7A4A', '#D89A4A', '#7C6B9E'];

	let showInk = $state(false);
	let showArrows = $state(true);

	const info = (d: string) => (browser ? strokeInfo(d) : null);
</script>

<svelte:head><title>Glyph review &middot; Letter Tracer</title></svelte:head>

<main>
	<header>
		<h1>Glyph review</h1>
		<p>
			All 62 glyphs as the app stores them: one SVG path per stroke, numbered and arrowed in the
			order and direction a child is taught to form them.
		</p>
		<div class="bar">
			<label><input type="checkbox" bind:checked={showArrows} /> Arrows</label>
			<label><input type="checkbox" bind:checked={showInk} /> Ink weight</label>
		</div>
	</header>

	{#each SECTIONS as section (section.key)}
		{@const set = section.key}
		<h2>{section.name} &mdash; {Object.keys(SETS[set]).length} glyphs</h2>
		<div class="row">
			{#each ORDER[set] as ch (ch)}
				{@const strokes = SETS[set][ch]}
				<figure>
					<svg viewBox="-4 0 108 148" width="92" height="126">
						{#each [GUIDE.cap, GUIDE.mid, GUIDE.base, GUIDE.desc] as y (y)}
							<line x1="0" x2="100" y1={y} y2={y} class="rule" class:base={y === GUIDE.base} />
						{/each}
						{#if showInk}
							{#each strokes as d (d)}
								<path {d} class="ink" />
							{/each}
						{/if}
						{#each strokes as d (d)}
							<path {d} class="guide" />
						{/each}
						{#if showArrows}
							{#each strokes as d, i (d)}
								{@const s = info(d)}
								{#if s}
									{@const c = COLORS[i % COLORS.length]}
									{#if !s.isDot}
										<g transform="translate({s.start.x} {s.start.y}) rotate({s.angle})">
											<path d="M14 0 L6 -5.5 L6 5.5 Z" fill={c} />
										</g>
									{/if}
									<circle cx={s.start.x} cy={s.start.y} r="6.5" fill={c} />
									<text x={s.start.x} y={s.start.y + 3} text-anchor="middle">{i + 1}</text>
								{/if}
							{/each}
						{/if}
					</svg>
					<figcaption>
						<b>{ch}</b>
						{strokes.length}
						{strokes.length === 1 ? 'stroke' : 'strokes'}
					</figcaption>
				</figure>
			{/each}
		</div>
	{/each}
</main>

<style>
	main {
		max-width: 1180px;
		margin: 0 auto;
		padding: 28px 20px 64px;
		font:
			15px/1.6 ui-sans-serif,
			-apple-system,
			'Segoe UI',
			Roboto,
			sans-serif;
		color: #241f2b;
	}
	h1 {
		font-size: 26px;
		margin: 0 0 4px;
	}
	header p {
		margin: 0 0 16px;
		color: #6b6579;
		max-width: 62ch;
	}
	.bar {
		display: flex;
		align-items: center;
		gap: 18px;
		flex-wrap: wrap;
		margin-bottom: 8px;
	}
	.bar label {
		display: flex;
		align-items: center;
		gap: 6px;
		color: #6b6579;
		font-size: 14px;
	}
	h2 {
		font-size: 12px;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: #6b6579;
		margin: 30px 0 10px;
	}
	.row {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}
	figure {
		margin: 0;
		width: 100px;
		padding: 5px 5px 3px;
		background: #fff;
		border: 1px solid #e8e4ee;
		border-radius: 9px;
		text-align: center;
	}
	figcaption {
		font-size: 11px;
		color: #8c8598;
	}
	figcaption b {
		color: #241f2b;
		font-size: 13px;
		margin-right: 3px;
	}
	svg {
		display: block;
		margin: 0 auto;
	}
	.rule {
		stroke: #efeaf2;
		stroke-width: 1;
		vector-effect: non-scaling-stroke;
	}
	.rule.base {
		stroke: #dcd6e4;
	}
	/* The real thing: a hairline dashed worksheet line, not a row of fat dots. */
	.guide {
		fill: none;
		stroke: #a79fb6;
		stroke-width: 1.6;
		stroke-dasharray: 5 5;
		vector-effect: non-scaling-stroke;
	}
	.ink {
		fill: none;
		stroke: #4c7a4a;
		stroke-width: 7;
		stroke-linecap: round;
		stroke-linejoin: round;
		opacity: 0.25;
	}
	text {
		font:
			600 8px ui-sans-serif,
			-apple-system,
			sans-serif;
		fill: #fff;
	}
</style>

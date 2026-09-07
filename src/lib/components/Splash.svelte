<script lang="ts">
	// The opening. A big A draws itself stroke by stroke, letters drift in around
	// it, then the title lands. Under three seconds, and a tap anywhere skips it.
	//
	// Everything here is drawn from the app's own stroke data, so the splash is
	// literally a preview of what the child is about to do.
	import { onMount } from 'svelte';
	import { SETS } from '$lib/glyphs/data';
	import GlyphWord from './GlyphWord.svelte';

	let { ondone }: { ondone: () => void } = $props();

	let leaving = $state(false);

	const A = SETS.upper.A;

	/** Letters drifting in behind the A, each with its own delay and drift. */
	// Kept clear of the right edge and of the lower fifth, where the title lands.
	const FLOATERS = [
		{ ch: 'b', set: 'lower', x: 13, y: 15, size: 46, rot: -14, delay: 300, color: '#C34C3E' },
		{ ch: 'S', set: 'upper', x: 75, y: 11, size: 52, rot: 12, delay: 480, color: '#3E7C7B' },
		{ ch: '3', set: 'digits', x: 79, y: 44, size: 44, rot: -8, delay: 660, color: '#D9A93F' },
		{ ch: 'm', set: 'lower', x: 9, y: 46, size: 48, rot: 10, delay: 840, color: '#4C7A4A' },
		{ ch: 'K', set: 'upper', x: 77, y: 65, size: 40, rot: -18, delay: 1020, color: '#7C6B9E' },
		{ ch: 'e', set: 'lower', x: 15, y: 68, size: 42, rot: 16, delay: 1200, color: '#D2763C' }
	] as const;

	function dismiss() {
		if (leaving) return;
		leaving = true;
		setTimeout(ondone, 340);
	}

	onMount(() => {
		const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
		const t = setTimeout(dismiss, reduced ? 1100 : 2900);
		return () => clearTimeout(t);
	});
</script>

<div
	class="splash"
	class:leaving
	role="button"
	tabindex="0"
	aria-label="Skip the opening"
	onpointerdown={dismiss}
	onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && dismiss()}
>
	{#each FLOATERS as f (f.ch + f.x)}
		<svg
			class="floater"
			viewBox="0 0 100 148"
			style="left:{f.x}%; top:{f.y}%; width:{f.size}px; --rot:{f.rot}deg; animation-delay:{f.delay}ms"
			aria-hidden="true"
		>
			{#each SETS[f.set][f.ch] as d (d)}
				<path {d} stroke={f.color} />
			{/each}
		</svg>
	{/each}

	<svg class="hero" viewBox="-8 0 116 150" aria-hidden="true">
		{#each A as d (d)}
			<path class="guide" {d} />
		{/each}
		{#each A as d, i (d)}
			<path class="ink i{i}" pathLength="100" {d} />
		{/each}
	</svg>

	<div class="title"><GlyphWord text="LETTER TRACER" height={26} color="#3B3039" weight={8} /></div>
</div>

<style>
	.splash {
		position: fixed;
		inset: 0;
		z-index: 50;
		background: #fbf8f2;
		display: grid;
		place-items: center;
		gap: 20px;
		grid-template-rows: 1fr auto;
		padding: 8vh 20px 12vh;
		cursor: pointer;
		transition: opacity 340ms ease;
	}
	.splash.leaving {
		opacity: 0;
		pointer-events: none;
	}
	.hero {
		width: min(58vw, 240px);
		height: auto;
		grid-row: 1;
	}
	.guide {
		fill: none;
		stroke: #ded7d0;
		stroke-width: 1.6;
		stroke-dasharray: 5 5;
		vector-effect: non-scaling-stroke;
	}
	.ink {
		fill: none;
		stroke: #c34c3e;
		stroke-width: 9;
		stroke-linecap: round;
		stroke-dasharray: 100;
		stroke-dashoffset: 100;
		animation: draw 620ms ease-out forwards;
	}
	.i0 {
		animation-delay: 120ms;
	}
	.i1 {
		animation-delay: 700ms;
		stroke: #3e7c7b;
	}
	.i2 {
		animation-delay: 1280ms;
		stroke: #d9a93f;
	}
	.floater {
		position: absolute;
		height: auto;
		opacity: 0;
		animation: drift 900ms cubic-bezier(0.2, 1.4, 0.4, 1) forwards;
	}
	.floater path {
		fill: none;
		stroke-width: 9;
		stroke-linecap: round;
		stroke-linejoin: round;
		opacity: 0.5;
	}
	.title {
		grid-row: 2;
		opacity: 0;
		animation: rise 520ms ease-out 1700ms forwards;
	}
	@keyframes draw {
		to {
			stroke-dashoffset: 0;
		}
	}
	@keyframes drift {
		from {
			opacity: 0;
			transform: translateY(22px) scale(0.6) rotate(0deg);
		}
		to {
			opacity: 1;
			transform: translateY(0) scale(1) rotate(var(--rot));
		}
	}
	@keyframes rise {
		from {
			opacity: 0;
			transform: translateY(14px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.ink,
		.floater,
		.title {
			animation: none;
			opacity: 1;
			stroke-dashoffset: 0;
		}
		.floater {
			transform: rotate(var(--rot));
		}
	}
</style>

<script lang="ts">
	// The tracing stage: hairline dashed guide, a flashing arrow on the next
	// taught stroke, ink that follows the finger, and a three-tier celebration.
	//
	// Strokes are a set of candidates rather than a sequence, so a child may draw
	// them in any order and may draw any of them backwards. Either still finishes
	// the letter; only the star rating changes.
	import { browser } from '$app/environment';
	import { GUIDE } from '$lib/glyphs/data';
	import { samplePoints, strokeInfo } from '$lib/glyphs/measure';
	import {
		advance,
		completeIndex,
		findStart,
		scoreLetter,
		type Attempt,
		type Pt,
		type Stars,
		type StrokeSample
	} from '$lib/trace/engine';

	let {
		strokes,
		char,
		onDone
	}: { strokes: string[]; char: string; onDone: (stars: Stars) => void } = $props();

	let svgEl: SVGSVGElement | undefined = $state();
	let samples = $state<StrokeSample[]>([]);
	let done = $state<boolean[]>([]);
	let dirs = $state<(1 | -1)[]>([]);
	let completed = $state<number[]>([]);
	let reversals = $state(0);
	let extras = $state(0);
	let attempt = $state<Attempt | null>(null);
	let result = $state<Stars | null>(null);
	let nudge = $state(false);

	// Reading `strokes` here is what re-runs this when the glyph changes.
	$effect(() => {
		const list = strokes;
		if (!browser) return;
		samples = list.map((d) => {
			const info = strokeInfo(d);
			return { pts: samplePoints(d), length: info.length, isDot: info.isDot };
		});
		done = list.map(() => false);
		dirs = list.map(() => 1 as const);
		completed = [];
		reversals = 0;
		extras = 0;
		attempt = null;
		result = null;
	});

	// Always the lowest-numbered stroke still to do, so the arrow keeps giving
	// useful guidance even after a child has worked out of order.
	const arrow = $derived.by(() => {
		if (!browser || attempt || result !== null) return null;
		const i = done.findIndex((v) => !v);
		if (i < 0 || !strokes[i]) return null;
		return { ...strokeInfo(strokes[i]), n: i + 1 };
	});

	function local(e: PointerEvent): Pt {
		const m = svgEl?.getScreenCTM();
		if (!m) return { x: -999, y: -999 };
		const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
		return { x: p.x, y: p.y };
	}

	function finish(i: number, dir: 1 | -1) {
		done[i] = true;
		dirs[i] = dir;
		completed.push(i);
		if (dir === -1) reversals++;
		attempt = null;
		if (!done.every(Boolean)) return;
		const stars = scoreLetter(completed, reversals, extras);
		result = stars;
		setTimeout(() => onDone(stars), stars === 3 ? 1700 : 1200);
	}

	function onDown(e: PointerEvent) {
		if (result !== null) return;
		const hit = findStart(samples, done, local(e));
		if (!hit) {
			nudge = true;
			setTimeout(() => (nudge = false), 420);
			return;
		}
		svgEl?.setPointerCapture(e.pointerId);
		// The tittle on i and j is a tap, not a drag.
		if (samples[hit.index].isDot) return finish(hit.index, 1);
		attempt = { index: hit.index, dir: hit.dir, progress: 0 };
	}

	function onMove(e: PointerEvent) {
		if (!attempt) return;
		const s = samples[attempt.index];
		attempt.progress = advance(s, attempt, local(e));
		if (attempt.progress >= completeIndex(s)) finish(attempt.index, attempt.dir);
	}

	function onUp() {
		if (!attempt) return;
		// A stroke genuinely begun and then let go of is the "extra stroke" that
		// costs the third star. A stray tap that never moved is forgiven.
		if (attempt.progress > 2) extras++;
		attempt = null;
	}

	function pct(i: number): number {
		if (done[i]) return 100;
		if (attempt?.index !== i) return 0;
		const n = samples[i].pts.length - 1;
		return n > 0 ? (attempt.progress / n) * 100 : 0;
	}

	/** Negative offset reveals from the far end, for a stroke drawn backwards. */
	function offset(i: number): number {
		const dir = attempt?.index === i ? attempt.dir : dirs[i];
		const o = 100 - pct(i);
		return dir === 1 ? o : -o;
	}

	const CONFETTI = Array.from({ length: 18 }, (_, i) => {
		const a = (i / 18) * Math.PI * 2 + 0.35;
		const r = 32 + (i % 4) * 10;
		return {
			tx: Math.cos(a) * r,
			ty: Math.sin(a) * r,
			fill: ['#C34C3E', '#D89A4A', '#3E7C7B', '#4C7A4A', '#7C6B9E'][i % 5],
			delay: (i % 6) * 45
		};
	});
</script>

<svg
	bind:this={svgEl}
	viewBox="-10 -8 120 158"
	role="application"
	aria-label="Trace the character {char}"
	onpointerdown={onDown}
	onpointermove={onMove}
	onpointerup={onUp}
	onpointercancel={onUp}
>
	<line class="rule" x1="0" x2="100" y1={GUIDE.mid} y2={GUIDE.mid} />
	<line class="rule base" x1="0" x2="100" y1={GUIDE.base} y2={GUIDE.base} />

	{#each strokes as d, i (i)}
		<path {d} class="guide" />
	{/each}

	{#each strokes as d, i (i)}
		<path
			{d}
			class="ink"
			class:gold={result === 3}
			pathLength="100"
			stroke-dasharray="100 100"
			stroke-dashoffset={offset(i)}
			visibility={pct(i) > 0 ? 'visible' : 'hidden'}
		/>
	{/each}

	{#if arrow}
		<g class="arrow" class:nudge>
			{#if !arrow.isDot}
				<g transform="translate({arrow.start.x} {arrow.start.y}) rotate({arrow.angle})">
					<path class="head" d="M18 0 L8.5 -6.5 L8.5 6.5 Z" />
				</g>
			{/if}
			<circle class="ring" cx={arrow.start.x} cy={arrow.start.y} r="7" />
			<circle class="knob" cx={arrow.start.x} cy={arrow.start.y} r="7" />
			<text x={arrow.start.x} y={arrow.start.y + 3.2}>{arrow.n}</text>
		</g>
	{/if}

	{#if result === 3}
		<g>
			{#each CONFETTI as c, i (i)}
				<circle
					class="confetti"
					cx="50"
					cy="60"
					r="3.6"
					fill={c.fill}
					style="--tx:{c.tx}px; --ty:{c.ty}px; animation-delay:{c.delay}ms"
				/>
			{/each}
		</g>
	{/if}
</svg>

<style>
	svg {
		display: block;
		width: 100%;
		height: auto;
		max-height: 100%;
		touch-action: none;
		-webkit-user-select: none;
		user-select: none;
	}
	.rule {
		stroke: #e7e1ea;
		stroke-width: 1;
		vector-effect: non-scaling-stroke;
	}
	.rule.base {
		stroke: #d5cdda;
	}
	/* Hairline worksheet dashes -- not a row of fat dots. Non-scaling keeps it
	   the same fine line whatever size the glyph is drawn at. */
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
		transition: stroke 240ms ease;
	}
	.ink.gold {
		stroke: #d89a4a;
	}
	.arrow {
		animation: flash 1.05s ease-in-out infinite;
	}
	.head,
	.knob {
		fill: #c34c3e;
	}
	.ring {
		fill: none;
		stroke: #c34c3e;
		stroke-width: 1.6;
		animation: ring 1.5s ease-out infinite;
	}
	.arrow text {
		font:
			600 8px ui-sans-serif,
			-apple-system,
			sans-serif;
		fill: #fff;
		text-anchor: middle;
	}
	.nudge {
		animation: shake 420ms ease-in-out;
	}
	.confetti {
		animation: pop 900ms ease-out forwards;
	}
	@keyframes flash {
		0%,
		100% {
			opacity: 0.45;
		}
		50% {
			opacity: 1;
		}
	}
	@keyframes ring {
		0% {
			r: 7;
			opacity: 0.75;
		}
		100% {
			r: 17;
			opacity: 0;
		}
	}
	@keyframes shake {
		0%,
		100% {
			transform: translateX(0);
		}
		25% {
			transform: translateX(-3px);
		}
		75% {
			transform: translateX(3px);
		}
	}
	@keyframes pop {
		0% {
			transform: translate(0, 0) scale(0.2);
			opacity: 1;
		}
		70% {
			opacity: 1;
		}
		100% {
			transform: translate(var(--tx), var(--ty)) scale(1.1);
			opacity: 0;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.arrow,
		.ring,
		.confetti,
		.nudge {
			animation: none;
		}
		.arrow {
			opacity: 1;
		}
	}
</style>

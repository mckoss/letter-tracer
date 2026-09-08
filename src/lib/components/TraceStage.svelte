<script lang="ts">
	// The tracing stage: hairline dashed guide, a flashing arrow on the next
	// taught stroke, and the child's own line drawn exactly where their finger
	// went.
	//
	// THE INK KNOWS NOTHING ABOUT THE STROKES. One touch makes one line, running
	// from where the finger went down to where it came up, through every point it
	// actually visited -- never snapped to a guide, never extended to a stroke's
	// end, never re-coloured, re-assigned or rubbed out because the matching went
	// one way or another. A child who draws a wobble sees their wobble.
	//
	// Everything below about strokes is bookkeeping that runs alongside: it moves
	// the arrow on, decides when the letter is finished and works out the stars.
	// It must never reach into what is on the screen.
	//
	// Strokes are a set of candidates rather than a sequence, so a child may draw
	// them in any order and may draw any of them backwards. Either still finishes
	// the letter; only the star rating changes. Nor does a stroke need its own
	// touch: one unbroken drag can run through as many strokes as it reaches,
	// which is how B, K, M and W are really written.
	import { browser } from '$app/environment';
	import { GUIDE } from '$lib/glyphs/data';
	import { samplePoints, strokeInfo } from '$lib/glyphs/measure';
	import {
		COLD,
		COVERED_AT,
		DEVIATION_CLAMP,
		RESOLVE_DISTANCE,
		TOLERANCE,
		advance,
		chainStarts,
		completeIndex,
		coverDirection,
		coveredRun,
		extraIndex,
		findStarts,
		liftIndex,
		markCovered,
		nearest,
		ptAt,
		resolveStart,
		scoreLetter,
		type Attempt,
		type Candidate,
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
	/**
	 * Plain, not $state: nothing in the markup reads it, and the effect below both
	 * writes it and (through reset) reads it, which as reactive state is a loop
	 * that trips effect_update_depth_exceeded and takes the whole component's
	 * reactivity down with it. Being plain also keeps the proxy out of `sweep`,
	 * which walks every sample point of every stroke on every finger position.
	 */
	let samples: StrokeSample[] = [];
	let done = $state<boolean[]>([]);

	/**
	 * Which sample points of each stroke the finger has passed over. A stroke that
	 * ends up substantially covered counts as drawn, whatever route the finger
	 * took to cover it -- see COVERED_AT.
	 */
	let covered: boolean[][] = [];
	let coveredCount: number[] = [];
	/**
	 * Which way the finger has been travelling along each stroke, as a running sum
	 * of steps forward minus steps back. Counted only while that stroke is the one
	 * under the finger: strokes overlap -- u's bowl runs back up the same line its
	 * stem comes down -- so coverage left by drawing a *different* stroke says
	 * nothing about which way this one was drawn.
	 */
	let coverLast: number[] = [];
	let coverDrift: number[] = [];

	/**
	 * Every line the child has drawn on this letter, oldest first, one per touch.
	 * Nothing but the erase button and moving to another glyph ever removes one.
	 */
	let gestures = $state<Pt[][]>([]);
	/** The line being drawn right now, or null between touches. */
	let live = $state<Pt[] | null>(null);

	let completed = $state<number[]>([]);
	let reversals = $state(0);
	let extras = $state(0);
	let devSum = $state(0);
	let devCount = $state(0);
	let attempt = $state<Attempt | null>(null);
	/** Readings of the touch still in play, until the finger says which is meant. */
	let pending = $state<Candidate[] | null>(null);
	let origin = $state<Pt | null>(null);
	/**
	 * Where the finger was when the last stroke of this gesture finished, while it
	 * is still down. Non-null means the drag is between strokes and may pick up
	 * another one.
	 */
	let linkFrom = $state<Pt | null>(null);
	/** Readings of the junction the finger has arrived at, and where it arrived. */
	let linkHits = $state<Candidate[] | null>(null);
	let linkPivot = $state<Pt | null>(null);
	let linkBest = $state(Infinity);
	let result = $state<Stars | null>(null);
	let nudge = $state(false);

	/** Wipe the letter -- ink and all -- and start over. */
	export function reset() {
		done = strokes.map(() => false);
		covered = samples.map((s) => s.pts.map(() => false));
		coveredCount = samples.map(() => 0);
		coverLast = samples.map(() => -1);
		coverDrift = samples.map(() => 0);
		gestures = [];
		live = null;
		completed = [];
		reversals = 0;
		extras = 0;
		devSum = 0;
		devCount = 0;
		attempt = null;
		pending = null;
		origin = null;
		linkFrom = null;
		forgetJunction();
		result = null;
	}

	// Reading `strokes` here is what re-runs this when the glyph changes.
	$effect(() => {
		const list = strokes;
		if (!browser) return;
		samples = list.map((d) => {
			const info = strokeInfo(d);
			return { pts: samplePoints(d), length: info.length, isDot: info.isDot };
		});
		reset();
	});

	// Always the lowest-numbered stroke still to do, so the arrow keeps giving
	// useful guidance even after a child has worked out of order.
	const arrow = $derived.by(() => {
		if (!browser || attempt || linkFrom || result !== null) return null;
		const i = done.findIndex((v) => !v);
		if (i < 0 || !strokes[i]) return null;
		return strokeInfo(strokes[i]);
	});

	function local(e: PointerEvent): Pt {
		const m = svgEl?.getScreenCTM();
		if (!m) return { x: -999, y: -999 };
		const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
		return { x: p.x, y: p.y };
	}

	/** Begin a new line under the finger. The only place ink is ever created. */
	function startLine(p: Pt) {
		gestures.push([p]);
		if (gestures.length > INK_LIMIT) gestures.shift();
		// Take the reference back OUT of the state array: pushing a plain array
		// into $state stores a proxy of it, and appending to the original would
		// never reach the rendered copy.
		live = gestures[gestures.length - 1];
	}

	/** Extend it. The only place ink is ever added to. */
	function extendLine(p: Pt) {
		if (!live) return;
		const tail = live[live.length - 1];
		if (!tail || (p.x - tail.x) ** 2 + (p.y - tail.y) ** 2 > 0.6) live.push(p);
	}

	function forgetJunction() {
		linkHits = null;
		linkPivot = null;
		linkBest = Infinity;
	}

	/** Arm a stroke under a finger that is already down. */
	function arm(hits: Candidate[], p: Pt) {
		const first = hits[0];
		// The tittle on i and j is a tap, not a drag.
		if (samples[first.index].isDot) return finish(first.index, 1, p);
		attempt = { index: first.index, dir: first.dir, progress: 0 };
		// Strokes meet end to end all over the alphabet, so hold the other
		// readings open until the finger has moved far enough to say which.
		pending = hits.length > 1 ? hits : null;
		origin = p;
		linkFrom = null;
		forgetJunction();
	}

	/**
	 * `chainAt` is where the finger is, and passing it says the gesture is still
	 * going: the next stroke can be picked up without lifting.
	 */
	function finish(i: number, dir: 1 | -1, chainAt?: Pt) {
		done[i] = true;
		completed.push(i);
		if (dir === -1) reversals++;
		// Only the stroke under the finger lets it go. A stroke that filled in by
		// coverage somewhere else must not cancel what the finger is doing.
		if (attempt === null || attempt.index === i) {
			attempt = null;
			pending = null;
			origin = null;
			linkFrom = chainAt ?? null;
			forgetJunction();
		}
		if (!done.every(Boolean)) return;
		const stars = scoreLetter(completed, reversals, extras, devCount ? devSum / devCount : 0);
		result = stars;
		setTimeout(() => onDone(stars), stars === 3 ? 1500 : 1100);
	}

	function onDown(e: PointerEvent) {
		const p = local(e);
		try {
			svgEl?.setPointerCapture(e.pointerId);
		} catch {
			// No active pointer to capture (synthetic events); tracking still works.
		}
		startLine(p);
		// The letter is finished and celebrating, but the finger is still a finger.
		if (result !== null) return;
		sweep(p);
		linkFrom = null;
		forgetJunction();
		const hits = findStarts(samples, done, p);
		if (!hits.length) {
			// Nudge the arrow toward where the stroke does start. The line is already
			// being drawn regardless -- an ignored finger reads as a broken app.
			nudge = true;
			setTimeout(() => (nudge = false), 420);
			return;
		}
		arm(hits, p);
	}

	/**
	 * The finger is down but between strokes: watch for it setting off along
	 * another one. Nothing here draws; the line is already being laid down.
	 */
	function link(p: Pt) {
		const hits = chainStarts(samples, done, linkFrom!, p);
		if (!hits.length) return forgetJunction();
		// Arriving at a junction is not the same as setting off from it. A stroke
		// completes a little short of its end, so the finger runs out the last of it
		// afterwards -- and half the alphabet has another stroke starting on that
		// very point. Arming on arrival would hand the tail of every stem to the
		// stroke below it. So watch for the closest approach, and only commit once
		// the finger leaves it again, which is also what says which way it went.
		const j = ptAt(samples[hits[0].index], hits[0].dir, 0);
		const d = Math.hypot(p.x - j.x, p.y - j.y);
		if (!linkHits || d < linkBest) {
			linkHits = hits;
			linkPivot = p;
			linkBest = d;
		}
		if (Math.hypot(p.x - linkPivot!.x, p.y - linkPivot!.y) < RESOLVE_DISTANCE) return;
		const from = linkPivot!;
		const chosen = linkHits!.length > 1 ? resolveStart(samples, linkHits!, from, p) : linkHits![0];
		arm([chosen], from);
	}

	/**
	 * Record where the line has been, and finish any stroke it has now covered.
	 * Runs for every finger position, whether or not a stroke is armed -- this is
	 * what lets a child draw a letter in any direction, from any starting point,
	 * in any number of passes, and still have it count.
	 *
	 * Returns how far the finger is from the nearest unfinished stroke.
	 */
	function sweep(p: Pt): number {
		let near = Infinity;
		for (let i = 0; i < samples.length; i++) {
			// The tittle on i and j is completed by a tap, not by being drawn over.
			if (done[i] || samples[i].isDot) continue;
			const hit = markCovered(samples[i], covered[i], p);
			if (hit.index < 0) continue;
			near = Math.min(
				near,
				Math.hypot(p.x - samples[i].pts[hit.index].x, p.y - samples[i].pts[hit.index].y)
			);
			if (attempt === null || attempt.index === i) {
				if (coverLast[i] >= 0) coverDrift[i] += Math.sign(hit.index - coverLast[i]);
				coverLast[i] = hit.index;
			}
			coveredCount[i] += hit.added;
			// The cheap test first: the expensive one only runs once enough of the
			// stroke has been touched for an unbroken run to be possible at all.
			if (coveredCount[i] / samples[i].pts.length < COVERED_AT) continue;
			if (coveredRun(covered[i]) < COVERED_AT) continue;
			// Which way round it was drawn. The armed stroke already knows; anything
			// else is read from the direction the finger travelled along it.
			const dir =
				attempt?.index === i ? attempt.dir : coverDirection(coverDrift[i], samples[i].pts.length);
			finish(i, dir, p);
		}
		return near;
	}

	function onMove(e: PointerEvent) {
		const p = local(e);
		// The line first, unconditionally, before a single word about strokes. The
		// last stroke of a letter completes a little short of its end, so the finger
		// is still travelling when the celebration starts; stopping the ink there is
		// what used to leave a gap at the end of the final stroke.
		extendLine(p);
		if (!live || result !== null) return;

		if (!attempt) {
			judge(p, sweep(p));
			if (linkFrom) link(p);
			return;
		}

		if (pending && origin) {
			// Too early to tell which stroke is meant: do not score or advance
			// against a guess that may be about to change.
			if (Math.hypot(p.x - origin.x, p.y - origin.y) < RESOLVE_DISTANCE) return;
			const chosen = resolveStart(samples, pending, origin, p);
			attempt.index = chosen.index;
			attempt.dir = chosen.dir;
			pending = null;
		}

		const s = samples[attempt.index];
		const m = nearest(s, attempt, p);

		// Armed but never begun, and now nowhere near the stroke: the finger is on
		// its way somewhere else. Let it go, rather than staying latched onto a
		// stroke it has left behind -- that is what strands a child who runs back
		// up B's stem to start the bowls.
		if (attempt.progress < COLD && m.dist > TOLERANCE) {
			const hits = chainStarts(samples, done, origin ?? p, p);
			const next = hits[0];
			if (next && (next.index !== attempt.index || next.dir !== attempt.dir)) {
				return arm(hits, p);
			}
		}

		// Accuracy is judged on every sample, including the ones that strayed past
		// the tolerance and so did not move the child forward. One wild excursion
		// costs a star; it does not wreck the average outright. Reaching for a
		// stroke not yet begun is travel, not bad drawing, so it is not judged.
		const judged = attempt.progress >= COLD || m.dist <= TOLERANCE;
		if (judged) {
			devSum += Math.min(m.dist, DEVIATION_CLAMP);
			devCount++;
		}

		attempt.progress = advance(s, attempt, p);
		if (attempt.progress >= completeIndex(s)) finish(attempt.index, attempt.dir, p);
		const near = sweep(p);
		if (!judged) judge(p, near);
	}

	/**
	 * Score how close to a guide this finger position was, when the armed stroke
	 * did not already account for it.
	 *
	 * Only marks made at the letter count. Past DEVIATION_CLAMP the child is not
	 * tracing badly, they are drawing something else on the same screen, and a
	 * doodle beside a neat letter should not cost a star.
	 */
	function judge(p: Pt, near: number) {
		if (near > DEVIATION_CLAMP) return;
		devSum += near;
		devCount++;
	}

	function onUp(e: PointerEvent) {
		// Where the finger came up is part of the line too, and need not be exactly
		// where the last move reported.
		extendLine(local(e));
		// The line is finished, and stays exactly as drawn.
		live = null;
		linkFrom = null;
		forgetJunction();
		if (!attempt || result !== null) return;
		const s = samples[attempt.index];
		// Lifting near the end finishes the stroke rather than discarding it.
		if (s && !s.isDot && attempt.progress >= liftIndex(s)) {
			return finish(attempt.index, attempt.dir);
		}
		// A stroke genuinely begun and then let go of is the "extra stroke" that
		// costs a star. Barely touching one is forgiven: running out the foot of
		// k's stem picks up the start of its lower leg and creeps a few samples
		// along it, which is not a child giving up on a stroke.
		if (attempt.progress >= extraIndex(s)) {
			extras++;
		}
		attempt = null;
		pending = null;
		origin = null;
	}

	/** Bound how much scribble a determined toddler can pile onto one letter. */
	const INK_LIMIT = 60;

	const points = (t: Pt[]) => t.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
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

	<!-- One translucent layer rather than translucent strokes: group opacity
	     composites once, so crossing strokes do not darken where they meet. -->
	<g class="ink-layer">
		{#each gestures as line, i (i)}
			{#if line.length === 1}
				<circle class="ink" class:gold={result === 3} cx={line[0].x} cy={line[0].y} r="3.5" />
			{:else}
				<polyline class="ink" class:gold={result === 3} points={points(line)} />
			{/if}
		{/each}
	</g>

	{#if arrow}
		<g class="arrow" class:nudge>
			{#if !arrow.isDot}
				<g transform="translate({arrow.start.x} {arrow.start.y}) rotate({arrow.angle})">
					<!-- A real arrow, shaft and head, bouncing along its own +x -- which
					     the rotation above has already aimed down the stroke. -->
					<g class="arrow-body">
						<path class="shaft" d="M6 0 L14 0" />
						<path class="head" d="M11.5 -5 L18.5 0 L11.5 5 Z" />
					</g>
				</g>
			{/if}
			<circle class="ring" cx={arrow.start.x} cy={arrow.start.y} r="7" />
			<circle class="knob" cx={arrow.start.x} cy={arrow.start.y} r="5.5" />
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
	/* Translucent so the dashed guide stays readable underneath the child's own
	   line -- they need to see how far off it they are while they draw. */
	.ink-layer {
		opacity: 0.65;
	}
	polyline.ink,
	circle.ink {
		fill: none;
		stroke: #4c7a4a;
		stroke-width: 7;
		stroke-linecap: round;
		stroke-linejoin: round;
		transition: stroke 240ms ease;
	}
	circle.ink {
		fill: #4c7a4a;
		stroke: none;
	}
	.ink.gold {
		stroke: #d89a4a;
	}
	circle.ink.gold {
		fill: #d89a4a;
	}
	.arrow {
		animation: flash 1.05s ease-in-out infinite;
	}
	.head,
	.knob {
		fill: #c34c3e;
	}
	.shaft {
		fill: none;
		stroke: #c34c3e;
		stroke-width: 4;
		stroke-linecap: round;
	}
	/* Two bounces a second, in the direction of travel: motion says "this way"
	   far more clearly than a static triangle does. */
	.arrow-body {
		animation: lunge 0.5s ease-in-out infinite;
	}
	.ring {
		fill: none;
		stroke: #c34c3e;
		stroke-width: 1.6;
		animation: ring 1.5s ease-out infinite;
	}
	.nudge {
		animation: shake 420ms ease-in-out;
	}
	@keyframes lunge {
		0% {
			transform: translateX(0);
		}
		45% {
			transform: translateX(5px);
		}
		100% {
			transform: translateX(0);
		}
	}
	@keyframes flash {
		0%,
		100% {
			opacity: 0.7;
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
	@media (prefers-reduced-motion: reduce) {
		.arrow,
		.arrow-body,
		.ring,
		.nudge {
			animation: none;
		}
		.arrow {
			opacity: 1;
		}
	}
</style>

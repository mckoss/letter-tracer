<script lang="ts">
	// The tracing stage: hairline dashed guide, a flashing arrow on the next
	// taught stroke, and the child's own line drawn exactly where their finger
	// went.
	//
	// The ink is the raw finger trail, not the guide path revealed. Snapping the
	// ink to the guide makes the letter draw itself perfectly however sloppy the
	// finger was, which teaches nothing about accuracy; drawing the real trail
	// shows the child their line and lets the score measure how close it ran.
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
		DEVIATION_CLAMP,
		RESOLVE_DISTANCE,
		TOLERANCE,
		advance,
		chainStarts,
		completeIndex,
		distanceTo,
		findStarts,
		liftIndex,
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
	let samples = $state<StrokeSample[]>([]);
	let done = $state<boolean[]>([]);
	let trails = $state<Pt[][]>([]);
	/**
	 * Lines drawn that did not begin on any stroke's start. They are still shown:
	 * a child who draws in the wrong place should see what they drew, not have
	 * the screen ignore them. They just do not count toward the letter.
	 */
	let freeTrails = $state<Pt[][]>([]);
	let freeActive = $state<Pt[] | null>(null);
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
	/** Ink laid down while reaching from one stroke to the next. */
	let linkPoly = $state<Pt[] | null>(null);
	/** Readings of the junction the finger has arrived at, and where it arrived. */
	let linkHits = $state<Candidate[] | null>(null);
	let linkPivot = $state<Pt | null>(null);
	let linkBest = $state(Infinity);
	/** The stroke that finish left under the finger, whose tail is not a wander. */
	let linkAfter = $state(-1);
	/**
	 * Whether the armed stroke was picked up mid-gesture rather than touched. A
	 * chained stroke that never got going has no ink of its own to keep: the marks
	 * under it belong to the stroke that was being finished at the time.
	 */
	let chained = $state(false);
	let result = $state<Stars | null>(null);
	let nudge = $state(false);

	/** Wipe every stroke and start the letter over. */
	export function reset() {
		done = strokes.map(() => false);
		trails = strokes.map(() => []);
		freeTrails = [];
		freeActive = null;
		completed = [];
		reversals = 0;
		extras = 0;
		devSum = 0;
		devCount = 0;
		attempt = null;
		pending = null;
		origin = null;
		linkFrom = null;
		linkPoly = null;
		linkAfter = -1;
		forgetJunction();
		chained = false;
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

	/**
	 * Keep an abandoned line on screen if it is long enough that the child meant
	 * to draw it. Below that it is the few pixels between two strokes, and a grey
	 * smudge at every junction would be worse than nothing.
	 */
	function stray(trail: Pt[]) {
		let len = 0;
		for (let i = 1; i < trail.length; i++) {
			len += Math.hypot(trail[i].x - trail[i - 1].x, trail[i].y - trail[i - 1].y);
		}
		if (len < STRAY_MIN) return;
		freeTrails.push(trail);
		if (freeTrails.length > FREE_LIMIT) freeTrails.shift();
	}

	function forgetJunction() {
		linkHits = null;
		linkPivot = null;
		linkBest = Infinity;
	}

	/**
	 * Let go of the armed stroke's line. It stays on screen as stray ink -- rubbing
	 * out a child's line the instant they lift is startling -- unless the stroke
	 * was picked up mid-gesture and never begun, in which case the marks under it
	 * are the tail of the stroke just finished and are already drawn.
	 */
	function abandon() {
		if (!attempt) return;
		if (!(chained && attempt.progress < COLD)) stray(trails[attempt.index]);
		trails[attempt.index] = [];
	}

	/** Arm a stroke under a finger that is already down. */
	function arm(hits: Candidate[], p: Pt, midGesture = false) {
		const first = hits[0];
		if (samples[first.index].isDot) {
			trails[first.index] = [samples[first.index].pts[0]];
			return finish(first.index, 1, undefined, p);
		}
		trails[first.index] = [p];
		attempt = { index: first.index, dir: first.dir, progress: 0 };
		// Strokes meet end to end all over the alphabet, so hold the other
		// readings open until the finger has moved far enough to say which.
		pending = hits.length > 1 ? hits : null;
		origin = p;
		chained = midGesture;
		linkFrom = null;
		linkPoly = null;
		linkAfter = -1;
		forgetJunction();
	}

	/**
	 * `chainAt` is where the finger is, and passing it says the gesture is still
	 * going: the next stroke can be picked up without lifting.
	 */
	function finish(i: number, dir: 1 | -1, from?: number, chainAt?: Pt) {
		// A stroke completes a little short of its end (COMPLETE_AT), so the trail
		// stops where the finger was and leaves a gap the child never made. Run the
		// line out along the rest of the stroke to close it.
		const s = samples[i];
		if (s && !s.isDot && from !== undefined) {
			for (let k = Math.ceil(from); k < s.pts.length; k++) trails[i].push(ptAt(s, dir, k));
		}
		done[i] = true;
		completed.push(i);
		if (dir === -1) reversals++;
		attempt = null;
		pending = null;
		origin = null;
		linkPoly = null;
		linkFrom = chainAt ?? null;
		linkAfter = i;
		forgetJunction();
		if (!done.every(Boolean)) return;
		const stars = scoreLetter(completed, reversals, extras, devCount ? devSum / devCount : 0);
		result = stars;
		setTimeout(() => onDone(stars), stars === 3 ? 1500 : 1100);
	}

	function onDown(e: PointerEvent) {
		if (result !== null) return;
		const p = local(e);
		linkFrom = null;
		linkPoly = null;
		linkAfter = -1;
		const hits = findStarts(samples, done, p);
		try {
			svgEl?.setPointerCapture(e.pointerId);
		} catch {
			// No active pointer to capture (synthetic events); tracking still works.
		}
		if (!hits.length) {
			// Nudge the arrow toward where the stroke does start, but draw the line
			// anyway. An ignored finger reads as a broken app.
			nudge = true;
			setTimeout(() => (nudge = false), 420);
			freeTrails.push([p]);
			if (freeTrails.length > FREE_LIMIT) freeTrails.shift();
			// Take the reference back OUT of the state array: pushing a plain array
			// into $state stores a proxy of it, and appending to the original would
			// never reach the rendered copy.
			freeActive = freeTrails[freeTrails.length - 1];
			return;
		}
		// The tittle on i and j is a tap, not a drag; `arm` knows.
		arm(hits, p);
	}

	/**
	 * The finger is down but between strokes. Watch for it arriving at the start
	 * of another one, and meanwhile show the reach across as stray ink -- but only
	 * once it is long enough to be a line rather than a junction.
	 */
	function link(p: Pt) {
		const hits = chainStarts(samples, done, linkFrom!, p);
		if (hits.length) {
			// Arriving at a junction is not the same as setting off from it. A stroke
			// completes a little short of its end, so the finger runs out the last of
			// it afterwards -- and half the alphabet has another stroke starting on
			// that very point. Arming on arrival would hand the tail of every stem to
			// the stroke below it. So watch for the closest approach, and only commit
			// once the finger leaves it again, which is also what says which way.
			const j = ptAt(samples[hits[0].index], hits[0].dir, 0);
			const d = Math.hypot(p.x - j.x, p.y - j.y);
			if (!linkHits || d < linkBest) {
				linkHits = hits;
				linkPivot = p;
				linkBest = d;
			}
			if (Math.hypot(p.x - linkPivot!.x, p.y - linkPivot!.y) >= RESOLVE_DISTANCE) {
				const from = linkPivot!;
				const chosen =
					linkHits!.length > 1 ? resolveStart(samples, linkHits!, from, p) : linkHits![0];
				return arm([chosen], from, true);
			}
			return;
		}
		forgetJunction();
		if (!linkPoly) {
			if (Math.hypot(p.x - linkFrom!.x, p.y - linkFrom!.y) < STRAY_MIN) return;
			// A stroke completes a little short of its end, so the finger normally
			// runs out the last of it after finishing. That tail is the stroke being
			// drawn properly, not a wander, and must not be greyed over.
			if (linkAfter >= 0 && distanceTo(samples[linkAfter], p) <= TOLERANCE) return;
			freeTrails.push([linkFrom!, p]);
			if (freeTrails.length > FREE_LIMIT) freeTrails.shift();
			// Back out of the state array: pushing a plain array into $state stores
			// a proxy, and appending to the original would never reach the render.
			linkPoly = freeTrails[freeTrails.length - 1];
			return;
		}
		const tail = linkPoly[linkPoly.length - 1];
		if ((p.x - tail.x) ** 2 + (p.y - tail.y) ** 2 > 0.6) linkPoly.push(p);
	}

	function onMove(e: PointerEvent) {
		if (result !== null) return;
		const p = local(e);
		if (freeActive) {
			const tail = freeActive[freeActive.length - 1];
			if (!tail || (p.x - tail.x) ** 2 + (p.y - tail.y) ** 2 > 0.6) freeActive.push(p);
			return;
		}
		if (!attempt) return linkFrom ? link(p) : undefined;

		if (pending && origin) {
			if (Math.hypot(p.x - origin.x, p.y - origin.y) < RESOLVE_DISTANCE) {
				// Too early to tell which stroke is meant. Draw the line, but do not
				// score or advance against a guess that may be about to change.
				trails[attempt.index].push(p);
				return;
			}
			const chosen = resolveStart(samples, pending, origin, p);
			if (chosen.index !== attempt.index) {
				trails[chosen.index] = trails[attempt.index];
				trails[attempt.index] = [];
			}
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
				abandon();
				return arm(hits, p, true);
			}
		}

		// Accuracy is judged on every sample, including the ones that strayed past
		// the tolerance and so did not move the child forward. One wild excursion
		// costs a star; it does not wreck the average outright. Reaching for a
		// stroke not yet begun is travel, not bad drawing, so it is not judged.
		if (attempt.progress >= COLD || m.dist <= TOLERANCE) {
			devSum += Math.min(m.dist, DEVIATION_CLAMP);
			devCount++;
		}

		const trail = trails[attempt.index];
		const tail = trail[trail.length - 1];
		if (!tail || (p.x - tail.x) ** 2 + (p.y - tail.y) ** 2 > 0.6) trail.push(p);

		attempt.progress = advance(s, attempt, p);
		if (attempt.progress >= completeIndex(s))
			finish(attempt.index, attempt.dir, attempt.progress, p);
	}

	function onUp() {
		linkFrom = null;
		linkPoly = null;
		linkAfter = -1;
		if (freeActive) {
			// Keep it on screen; the erase button is how it goes away.
			freeActive = null;
			return;
		}
		if (!attempt) return;
		const s = samples[attempt.index];
		// Lifting near the end finishes the stroke rather than discarding it.
		if (s && !s.isDot && attempt.progress >= liftIndex(s)) {
			return finish(attempt.index, attempt.dir, attempt.progress);
		}
		// A stroke genuinely begun and then let go of is the "extra stroke" that
		// costs a star. A stray tap that never moved is forgiven.
		if (attempt.progress > 2) extras++;
		// Keep what was drawn on screen -- rubbing out a child's line the instant
		// they lift is startling. It moves to the uncounted pile, so a retry starts
		// from a clean stroke while the earlier try stays visible.
		abandon();
		attempt = null;
		pending = null;
	}

	/** Bound how much stray scribble a determined toddler can accumulate. */
	const FREE_LIMIT = 20;
	/** Shorter than this and a leftover line is a smudge, not something drawn. */
	const STRAY_MIN = 8;

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
		{#each freeTrails as trail, i (i)}
			{#if trail.length > 1}
				<polyline class="free" points={points(trail)} />
			{:else if trail.length === 1}
				<circle class="free-dot" cx={trail[0].x} cy={trail[0].y} r="3.5" />
			{/if}
		{/each}
		{#each trails as trail, i (i)}
			{#if trail.length === 1}
				<circle class="ink" class:gold={result === 3} cx={trail[0].x} cy={trail[0].y} r="3.5" />
			{:else if trail.length > 1}
				<polyline class="ink" class:gold={result === 3} points={points(trail)} />
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
	/* Drawn, but off the guide: a muted pencil grey rather than the ink green, so
	   it is visible without being mistaken for progress. */
	.free {
		fill: none;
		stroke: #9a92a6;
		stroke-width: 7;
		stroke-linecap: round;
		stroke-linejoin: round;
	}
	.free-dot {
		fill: #9a92a6;
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

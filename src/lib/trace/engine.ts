// Tracing engine: pure geometry, no DOM.
//
// The component samples each stroke's path with the browser's own path geometry
// and hands the points here; everything below is plain arithmetic so it can be
// unit tested.
//
// Strokes are a *set of candidates*, not a sequence. A child may draw them in
// any order, and may draw any one of them backwards. Both complete the letter;
// they only change the grade.

export type Pt = { x: number; y: number };

export type StrokeSample = {
	/** Arc-length-ordered points, in the direction the child is taught to draw. */
	pts: Pt[];
	length: number;
	/** The tittle on i and j: completed by a tap, not a drag. */
	isDot: boolean;
};

/** A stroke currently under the finger. `dir` is -1 when drawn backwards. */
export type Attempt = { index: number; dir: 1 | -1; progress: number };

/** One way a touch could be read: this stroke, drawn this way round. */
export type Candidate = { index: number; dir: 1 | -1 };

/**
 * Angry-Birds-style rating for a letter that got finished. Finishing always
 * scores at least one star.
 */
export type Stars = 1 | 2 | 3;

/**
 * What the grid shows on a tile: the best rating ever earned on that glyph, or
 * zero for one the child has never correctly completed. Zero is the empty state,
 * not something a finished attempt can score.
 */
export type Best = 0 | Stars;

/** All in glyph user units, where the cap height is 100. */
export const TOLERANCE = 11;
export const START_RADIUS = 13;
/** How far ahead of the current position a move may jump, as a fraction. */
export const LOOKAHEAD = 0.22;
/** A stroke counts as finished a little short of the end. */
export const COMPLETE_AT = 0.92;

/**
 * How far the finger must travel before an ambiguous start is settled. Strokes
 * meet end to end all over the alphabet -- the foot of K, the middle of M, W
 * and Y, the stem of every bowl letter -- so a touch on a junction genuinely
 * does not say which stroke is meant until it moves.
 */
export const RESOLVE_DISTANCE = 5;

/**
 * Mean distance from the guide, in user units, that separates the tidiness
 * bands. TOLERANCE is only the gate for "still on this stroke"; these are what
 * the child is actually judged on, so wandering inside the tolerance band still
 * costs a star.
 */
export const NEAT = 3.5;
export const OK = 7;
/** One wild excursion should cost a star, not wreck the average outright. */
export const DEVIATION_CLAMP = 25;

const d2 = (a: Pt, b: Pt) => (a.x - b.x) ** 2 + (a.y - b.y) ** 2;

/** The i-th point along the direction being drawn. */
export function ptAt(s: StrokeSample, dir: 1 | -1, i: number): Pt {
	return dir === 1 ? s.pts[i] : s.pts[s.pts.length - 1 - i];
}

/**
 * Every way a touch at `p` could be read, nearest first. Both ends of every
 * unfinished stroke count, since a stroke may be drawn backwards.
 *
 * More than one candidate is the normal case, not an edge case: 23 of the 62
 * glyphs have strokes that share an endpoint, so a touch there is ambiguous
 * until `resolveStart` sees which way the finger went.
 */
export function findStarts(
	samples: StrokeSample[],
	done: boolean[],
	p: Pt,
	radius = START_RADIUS
): Candidate[] {
	const hits: { c: Candidate; d: number }[] = [];
	const max = radius ** 2;
	for (let i = 0; i < samples.length; i++) {
		if (done[i]) continue;
		for (const dir of [1, -1] as const) {
			const d = d2(ptAt(samples[i], dir, 0), p);
			if (d <= max) hits.push({ c: { index: i, dir }, d });
		}
	}
	hits.sort((a, b) => a.d - b.d);
	return hits.map((h) => h.c);
}

/** The nearest reading of a touch, or null if it landed on no stroke start. */
export function findStart(
	samples: StrokeSample[],
	done: boolean[],
	p: Pt,
	radius = START_RADIUS
): Candidate | null {
	return findStarts(samples, done, p, radius)[0] ?? null;
}

/** Unit vector a stroke sets off in. */
export function heading(s: StrokeSample, dir: 1 | -1): Pt {
	const n = s.pts.length;
	const k = Math.min(n - 1, Math.max(1, Math.round(n * 0.15)));
	const a = ptAt(s, dir, 0);
	const b = ptAt(s, dir, k);
	const dx = b.x - a.x;
	const dy = b.y - a.y;
	const len = Math.hypot(dx, dy) || 1;
	return { x: dx / len, y: dy / len };
}

/**
 * Settle an ambiguous start once the finger has moved: take the candidate whose
 * heading best matches the way it actually set off. Without this, touching the
 * foot of K arms the upper leg *backwards* -- it ends exactly where the lower
 * leg begins -- and a child drawing down and right matches nothing at all, so
 * the stroke silently fails to register.
 */
export function resolveStart(
	samples: StrokeSample[],
	candidates: Candidate[],
	from: Pt,
	to: Pt
): Candidate {
	const dx = to.x - from.x;
	const dy = to.y - from.y;
	const len = Math.hypot(dx, dy) || 1;
	let best = candidates[0];
	let bestScore = -Infinity;
	for (const c of candidates) {
		const h = heading(samples[c.index], c.dir);
		const score = (h.x * dx + h.y * dy) / len;
		if (score > bestScore) {
			bestScore = score;
			best = c;
		}
	}
	return best;
}

/**
 * The point on the stroke nearest the finger, searching only forward from where
 * the child has already got to. `dist` is how far off the guide they are, which
 * is what the accuracy score is built from.
 */
export function nearest(s: StrokeSample, a: Attempt, p: Pt): { index: number; dist: number } {
	const n = s.pts.length;
	const end = Math.min(n - 1, a.progress + Math.max(2, Math.ceil(n * LOOKAHEAD)));
	let index = a.progress;
	let best = Infinity;
	for (let i = a.progress; i <= end; i++) {
		const dd = d2(ptAt(s, a.dir, i), p);
		if (dd < best) {
			best = dd;
			index = i;
		}
	}
	return { index, dist: Math.sqrt(best) };
}

/**
 * New progress for a finger at `p`. Never goes backwards: straying past the
 * tolerance holds position rather than failing, so a child can wander and come
 * back. The look-ahead window is what stops a fast drag from being left behind.
 */
export function advance(s: StrokeSample, a: Attempt, p: Pt, tolerance = TOLERANCE): number {
	const m = nearest(s, a, p);
	return m.dist <= tolerance ? m.index : a.progress;
}

/** Progress at which a stroke is considered complete. */
export function completeIndex(s: StrokeSample): number {
	return (s.pts.length - 1) * COMPLETE_AT;
}

/** How closely the finger followed the guide, averaged over the whole letter. */
export type Tidiness = 'neat' | 'ok' | 'loose';

export function tidiness(meanDeviation: number): Tidiness {
	if (meanDeviation <= NEAT) return 'neat';
	if (meanDeviation <= OK) return 'ok';
	return 'loose';
}

/**
 * Rating for a finished letter. Every letter that gets finished scores at least
 * one star -- a child never loses a letter for poor form, only some applause.
 *
 *   3  every stroke, taught order and direction, no false starts, neatly traced
 *   2  out of order, or one drawn backwards, or only roughly on the line
 *   1  it took extra stroke attempts, or the line was wandered off badly
 *
 * `extras` counts abandoned attempts: strokes begun and then let go of before
 * they were finished. Those are what "an additional stroke" looks like from
 * inside the engine, since a completed stroke is never re-armed.
 */
export function scoreLetter(
	order: number[],
	reversals: number,
	extras: number,
	meanDeviation: number
): Stars {
	const tidy = tidiness(meanDeviation);
	if (extras > 0 || tidy === 'loose') return 1;
	const inOrder = order.every((v, i) => v === i);
	if (!inOrder || reversals > 0 || tidy === 'ok') return 2;
	return 3;
}

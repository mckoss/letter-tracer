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

const d2 = (a: Pt, b: Pt) => (a.x - b.x) ** 2 + (a.y - b.y) ** 2;

/** The i-th point along the direction being drawn. */
export function ptAt(s: StrokeSample, dir: 1 | -1, i: number): Pt {
	return dir === 1 ? s.pts[i] : s.pts[s.pts.length - 1 - i];
}

/**
 * Which stroke a touch at `p` should arm. Considers both ends of every
 * unfinished stroke and takes the nearest, so overlapping starts (the three
 * strokes of `m`) resolve to whichever the child actually reached for.
 */
export function findStart(
	samples: StrokeSample[],
	done: boolean[],
	p: Pt,
	radius = START_RADIUS
): { index: number; dir: 1 | -1 } | null {
	let best: { index: number; dir: 1 | -1 } | null = null;
	let bestD = radius ** 2;
	for (let i = 0; i < samples.length; i++) {
		if (done[i]) continue;
		const s = samples[i];
		for (const dir of [1, -1] as const) {
			const dd = d2(ptAt(s, dir, 0), p);
			if (dd < bestD) {
				bestD = dd;
				best = { index: i, dir };
			}
		}
	}
	return best;
}

/**
 * New progress for a finger at `p`. Never goes backwards: straying off the path
 * holds position rather than failing, so a child can wander and come back.
 *
 * Takes the *nearest* point within tolerance, not the furthest -- the furthest
 * puts the head of the ink up to a whole tolerance radius ahead of the finger,
 * which reads as the letter drawing itself. The look-ahead window, not the
 * choice of point, is what stops a fast drag from being left behind.
 */
export function advance(s: StrokeSample, a: Attempt, p: Pt, tolerance = TOLERANCE): number {
	const n = s.pts.length;
	const end = Math.min(n - 1, a.progress + Math.max(2, Math.ceil(n * LOOKAHEAD)));
	const tol2 = tolerance ** 2;
	let found = a.progress;
	let best = Infinity;
	for (let i = a.progress; i <= end; i++) {
		const dd = d2(ptAt(s, a.dir, i), p);
		if (dd <= tol2 && dd < best) {
			best = dd;
			found = i;
		}
	}
	return found;
}

/** Progress at which a stroke is considered complete. */
export function completeIndex(s: StrokeSample): number {
	return (s.pts.length - 1) * COMPLETE_AT;
}

/**
 * Rating for a finished letter. Every letter that gets finished scores at least
 * one star -- a child never loses a letter for poor form, only some applause.
 *
 *   3  every stroke, taught order, taught direction, no false starts
 *   2  every stroke, but out of order or with one drawn backwards
 *   1  finished, but it took extra stroke attempts to get there
 *
 * `extras` counts abandoned attempts: strokes begun and then let go of before
 * they were finished. Those are what "an additional stroke" looks like from
 * inside the engine, since a completed stroke is never re-armed.
 */
export function scoreLetter(order: number[], reversals: number, extras: number): Stars {
	if (extras > 0) return 1;
	const inOrder = order.every((v, i) => v === i);
	return inOrder && reversals === 0 ? 3 : 2;
}

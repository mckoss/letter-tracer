import { describe, it, expect } from 'vitest';
import {
	COVERED_AT,
	advance,
	chainStarts,
	findStart,
	coverDirection,
	coveredRun,
	markCovered,
	findStarts,
	liftIndex,
	completeIndex,
	nearest,
	resolveStart,
	scoreLetter,
	tidiness,
	ptAt,
	type StrokeSample
} from './engine';

/** A horizontal stroke from (0,0) to (100,0), sampled every unit. */
const line = (): StrokeSample => ({
	pts: Array.from({ length: 101 }, (_, i) => ({ x: i, y: 0 })),
	length: 100,
	isDot: false
});

describe('ptAt', () => {
	it('walks backwards when the stroke is reversed', () => {
		const s = line();
		expect(ptAt(s, 1, 0)).toEqual({ x: 0, y: 0 });
		expect(ptAt(s, -1, 0)).toEqual({ x: 100, y: 0 });
	});
});

describe('findStart', () => {
	it('arms the nearest unfinished stroke', () => {
		const s = [line(), line()];
		expect(findStart(s, [false, false], { x: 2, y: 0 })).toEqual({ index: 0, dir: 1 });
	});

	it('reports a reversed direction when the far end is touched', () => {
		expect(findStart([line()], [false], { x: 98, y: 0 })).toEqual({ index: 0, dir: -1 });
	});

	it('skips strokes already finished', () => {
		const s = [line(), line()];
		expect(findStart(s, [true, false], { x: 2, y: 0 })).toEqual({ index: 1, dir: 1 });
	});

	it('ignores a touch nowhere near a start point', () => {
		expect(findStart([line()], [false], { x: 50, y: 60 })).toBeNull();
	});
});

describe('resolveStart', () => {
	/** Two strokes meeting at a point, as the upper and lower legs of K do. */
	const seg = (x0: number, y0: number, x1: number, y1: number): StrokeSample => {
		const n = 41;
		return {
			pts: Array.from({ length: n }, (_, i) => ({
				x: x0 + ((x1 - x0) * i) / (n - 1),
				y: y0 + ((y1 - y0) * i) / (n - 1)
			})),
			length: Math.hypot(x1 - x0, y1 - y0),
			isDot: false
		};
	};
	// K, once the stem is done: the upper leg ENDS where the lower leg BEGINS.
	const upperLeg = seg(74, 10, 26, 62);
	const lowerLeg = seg(26, 62, 76, 110);
	const kLegs = [upperLeg, lowerLeg];
	const junction = { x: 26, y: 62 };

	it('sees both readings of a touch on a junction', () => {
		const hits = findStarts(kLegs, [false, false], junction);
		expect(hits).toContainEqual({ index: 0, dir: -1 });
		expect(hits).toContainEqual({ index: 1, dir: 1 });
	});

	it('picks the lower leg when the finger heads down and right', () => {
		const hits = findStarts(kLegs, [false, false], junction);
		const got = resolveStart(kLegs, hits, junction, { x: 32, y: 68 });
		expect(got).toEqual({ index: 1, dir: 1 });
	});

	it('picks the upper leg backwards when the finger heads up and right', () => {
		const hits = findStarts(kLegs, [false, false], junction);
		const got = resolveStart(kLegs, hits, junction, { x: 32, y: 55 });
		expect(got).toEqual({ index: 0, dir: -1 });
	});
});

describe('chainStarts', () => {
	const seg = (x0: number, y0: number, x1: number, y1: number): StrokeSample => {
		const n = 41;
		return {
			pts: Array.from({ length: n }, (_, i) => ({
				x: x0 + ((x1 - x0) * i) / (n - 1),
				y: y0 + ((y1 - y0) * i) / (n - 1)
			})),
			length: Math.hypot(x1 - x0, y1 - y0),
			isDot: false
		};
	};
	// K: the stem is drawn, the upper leg has just finished at its foot, and the
	// finger has not lifted.
	const legs = [seg(74, 10, 26, 62), seg(26, 62, 76, 110)];
	const foot = { x: 26, y: 62 };

	it('picks up the next stroke from a finger that never lifted', () => {
		const hits = chainStarts(legs, [true, false], foot, { x: 30, y: 66 });
		expect(hits[0]).toEqual({ index: 1, dir: 1 });
	});

	it('ignores the tremor of a finger resting on the junction', () => {
		expect(chainStarts(legs, [true, false], foot, { x: 27, y: 63 })).toEqual([]);
	});

	it('finds nothing when the finger runs on past every start', () => {
		expect(chainStarts(legs, [true, false], foot, { x: 90, y: 20 })).toEqual([]);
	});

	it('leaves a finished stroke alone', () => {
		expect(chainStarts(legs, [true, true], foot, { x: 30, y: 66 })).toEqual([]);
	});

	it('will not pick a stroke up backwards', () => {
		// The far end of the lower leg, which a finger running out the end of some
		// other stroke can easily pass through.
		expect(chainStarts(legs, [true, false], foot, { x: 74, y: 108 })).toEqual([]);
	});
});

describe('advance', () => {
	it('moves forward along the stroke', () => {
		const s = line();
		expect(advance(s, { index: 0, dir: 1, progress: 0 }, { x: 8, y: 0 })).toBe(8);
	});

	it('holds position when the finger strays off the path', () => {
		const s = line();
		expect(advance(s, { index: 0, dir: 1, progress: 20 }, { x: 25, y: 90 })).toBe(20);
	});

	it('never runs backwards', () => {
		const s = line();
		expect(advance(s, { index: 0, dir: 1, progress: 40 }, { x: 5, y: 0 })).toBe(40);
	});

	it('will not skip past the look-ahead window', () => {
		const s = line();
		expect(advance(s, { index: 0, dir: 1, progress: 0 }, { x: 90, y: 0 })).toBe(0);
	});

	it('follows a reversed stroke from the far end', () => {
		const s = line();
		expect(advance(s, { index: 0, dir: -1, progress: 0 }, { x: 92, y: 0 })).toBe(8);
	});
});

describe('markCovered', () => {
	it('marks every sample the finger passed over, and reports the nearest', () => {
		const s = line();
		const covered = s.pts.map(() => false);
		const sweep = markCovered(s, covered, { x: 50, y: 0 });
		// TOLERANCE is 11, so samples 39..61 inclusive.
		expect(sweep.added).toBe(23);
		expect(sweep.index).toBe(50);
		expect(covered[39]).toBe(true);
		expect(covered[38]).toBe(false);
	});

	it('does not count a sample twice', () => {
		const s = line();
		const covered = s.pts.map(() => false);
		markCovered(s, covered, { x: 50, y: 0 });
		expect(markCovered(s, covered, { x: 50, y: 0 }).added).toBe(0);
	});

	it('ignores a finger nowhere near the stroke', () => {
		const s = line();
		const covered = s.pts.map(() => false);
		expect(markCovered(s, covered, { x: 50, y: 40 })).toEqual({ added: 0, index: -1 });
	});

	it('covers a whole stroke drawn backwards, which advance would refuse', () => {
		const s = line();
		const covered = s.pts.map(() => false);
		let last = -1;
		for (let x = 100; x >= 0; x--) last = markCovered(s, covered, { x, y: 0 }).index;
		expect(covered.filter(Boolean).length / covered.length).toBeGreaterThanOrEqual(COVERED_AT);
		// Nearest sample ran from high to low: the finger went backwards.
		expect(last).toBe(0);
	});
});

describe('coveredRun', () => {
	it('measures the longest unbroken run, not the total', () => {
		const s = line();
		const covered = s.pts.map(() => false);
		// Both ends touched, middle untouched: 88% of the samples, in two pieces.
		markCovered(s, covered, { x: 12, y: 0 });
		markCovered(s, covered, { x: 88, y: 0 });
		expect(covered.filter(Boolean).length / covered.length).toBeCloseTo(0.46, 1);
		expect(coveredRun(covered)).toBeCloseTo(0.23, 1);
	});

	it('reaches the threshold once the run joins up', () => {
		const s = line();
		const covered = s.pts.map(() => false);
		for (let x = 0; x <= 100; x += 5) markCovered(s, covered, { x, y: 0 });
		expect(coveredRun(covered)).toBe(1);
	});
});

describe('coverDirection', () => {
	it('calls a stroke run the whole way backwards a reversal', () => {
		expect(coverDirection(-34, 34)).toBe(-1);
	});

	it('does not call a tail brushing along part of it a reversal', () => {
		// u's bowl runs back up a fifth of u's stem on its way to the top.
		expect(coverDirection(-7, 34)).toBe(1);
	});

	it('is forward when the finger went forward', () => {
		expect(coverDirection(30, 34)).toBe(1);
	});
});

describe('nearest', () => {
	it('reports how far off the guide the finger is', () => {
		const s = line();
		const m = nearest(s, { index: 0, dir: 1, progress: 0 }, { x: 4, y: 3 });
		expect(m).toEqual({ index: 4, dist: 3 });
	});
});

describe('tidiness', () => {
	it('bands the mean deviation', () => {
		expect(tidiness(1)).toBe('neat');
		expect(tidiness(5)).toBe('ok');
		expect(tidiness(12)).toBe('loose');
	});
});

describe('scoreLetter', () => {
	it('gives three stars for a neat trace in the taught order', () => {
		expect(scoreLetter([0, 1, 2], 0, 0, 2)).toBe(3);
	});

	it('gives two stars for every stroke drawn out of order', () => {
		expect(scoreLetter([2, 0, 1], 0, 0, 2)).toBe(2);
	});

	it('gives two stars for a stroke drawn backwards', () => {
		expect(scoreLetter([0, 1, 2], 1, 0, 2)).toBe(2);
	});

	it('drops a neat, correctly ordered letter to two stars if it wandered', () => {
		expect(scoreLetter([0, 1, 2], 0, 0, 5)).toBe(2);
	});

	it('gives one star for a badly wandering line, however good the order', () => {
		expect(scoreLetter([0, 1, 2], 0, 0, 14)).toBe(1);
	});

	it('gives one star when extra stroke attempts were needed', () => {
		expect(scoreLetter([0, 1, 2], 0, 1, 1)).toBe(1);
	});

	it('never scores zero, however messy the attempt', () => {
		expect(scoreLetter([2, 1, 0], 2, 4, 20)).toBe(1);
	});
});

describe('finishing thresholds', () => {
	it('finishes under the finger a little short of the end', () => {
		const s = line(); // 101 points, so index 100 is the end
		expect(completeIndex(s)).toBeCloseTo(88);
	});

	it('accepts a lift at three quarters, which 90% of a stem comfortably clears', () => {
		const s = line();
		expect(liftIndex(s)).toBeCloseTo(75);
		expect(90).toBeGreaterThanOrEqual(liftIndex(s));
	});
});

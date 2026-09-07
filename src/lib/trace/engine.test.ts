import { describe, it, expect } from 'vitest';
import {
	advance,
	findStart,
	findStarts,
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

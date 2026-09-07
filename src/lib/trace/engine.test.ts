import { describe, it, expect } from 'vitest';
import { advance, findStart, scoreLetter, ptAt, type StrokeSample } from './engine';

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

describe('scoreLetter', () => {
	it('gives three stars for the taught order and direction', () => {
		expect(scoreLetter([0, 1, 2], 0, 0)).toBe(3);
	});

	it('gives two stars for every stroke drawn out of order', () => {
		expect(scoreLetter([2, 0, 1], 0, 0)).toBe(2);
	});

	it('gives two stars for a stroke drawn backwards', () => {
		expect(scoreLetter([0, 1, 2], 1, 0)).toBe(2);
	});

	it('gives one star when extra stroke attempts were needed', () => {
		expect(scoreLetter([0, 1, 2], 0, 1)).toBe(1);
	});

	it('never scores zero, however messy the attempt', () => {
		expect(scoreLetter([2, 1, 0], 2, 4)).toBe(1);
	});
});

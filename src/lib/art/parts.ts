// Shared parts for the word illustrations: the pieces several subjects are
// built from, so a set of vehicles shares one wheel and every face one eye.

import { P } from './palette';
import type { Prim } from './render';

/**
 * Short strokes laid tangentially around an ellipse: the woven strands of a
 * nest rim, seen from above. Deterministic, so a picture is the same every time
 * it is drawn -- `k` only varies the depth each strand sits at.
 */
export const weave = (
	cx: number,
	cy: number,
	rx: number,
	ry: number,
	n: number,
	arc = 0.62
): string => {
	const parts: string[] = [];
	for (let i = 0; i < n; i++) {
		const t = (i / n) * Math.PI * 2;
		const k = 1 + 0.075 * Math.sin(i * 2.7);
		const at = (u: number, g: number) =>
			`${(cx + rx * k * g * Math.cos(u)).toFixed(1)} ${(cy + ry * k * g * Math.sin(u)).toFixed(1)}`;
		parts.push(`M${at(t - arc / 2, 1)} Q${at(t, 1.09)} ${at(t + arc / 2, 1)}`);
	}
	return parts.join(' ');
};

/**
 * A road wheel: dark tyre, pale hub. Every wheeled subject stands on these, so
 * they are one shape rather than twenty-odd slightly different ones -- a set of
 * vehicles read as a set largely because the wheels match.
 */
export const wheel = (cx: number, cy: number, r: number): Prim[] => [
	{ k: 'circle', o: { cx, cy, r }, fill: P.dark, shade: true },
	{ k: 'circle', o: { cx, cy, r: r * 0.42 }, fill: P.grey, shade: true, soft: true }
];

/** The usual pair, on one axle line. */
export const axle = (x1: number, x2: number, cy: number, r: number): Prim[] => [
	...wheel(x1, cy, r),
	...wheel(x2, cy, r)
];

/** A row of `n` evenly spaced windows: a bus, a van, a bridge deck. */
export const glazing = (
	x: number,
	y: number,
	w: number,
	h: number,
	n: number,
	gap: number
): Prim[] =>
	Array.from({ length: n }, (_, i) => ({
		k: 'rect',
		x: x + i * (w + gap),
		y,
		w,
		h,
		rx: 4,
		fill: P.sky,
		shade: true,
		soft: true
	}));

export const eye = (cx: number, cy: number, r = 6.5): Prim[] => [
	{ k: 'circle', o: { cx, cy, r }, fill: P.dark },
	{ k: 'circle', o: { cx: cx + r * 0.36, cy: cy - r * 0.36, r: r * 0.34 }, fill: P.white }
];

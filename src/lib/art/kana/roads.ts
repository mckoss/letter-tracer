// Kana word pictures: roads. See ./index.ts.

import { P } from '../palette';
import { axle, glazing, wheel } from '../parts';
import type { Prim } from '../render';
import type { Subject } from '../subjects';

/** A crawler track: a dark rounded belt with a row of small road wheels inside. */
const track = (x: number, y: number, w: number, h: number): Prim[] => {
	const r = h / 2;
	const n = Math.max(2, Math.round((w - h) / (h * 0.75)) + 1);
	const step = (w - h) / (n - 1);
	return [
		{ k: 'rect', x, y, w, h, rx: r, fill: P.dark, shade: true },
		...Array.from({ length: n }, (_, i): Prim => ({
			k: 'circle',
			o: { cx: x + r + i * step, cy: y + r, r: r * 0.5 },
			fill: P.grey,
			shade: true,
			soft: true
		}))
	];
};

export const ROADS: Record<string, Subject> = {
	bulldozer: () => [
		...track(28, 130, 116, 34),
		{ k: 'rect', x: 34, y: 98, w: 100, h: 34, rx: 6, fill: P.yellow, shade: true },
		{ k: 'path', d: 'M58 100 L58 62 L108 62 L120 100 Z', fill: P.yellow, shade: true },
		{ k: 'path', d: 'M66 94 L66 70 L104 70 L112 94 Z', fill: P.sky, shade: true, soft: true },
		{ k: 'rect', x: 40, y: 76, w: 8, h: 24, rx: 2, fill: P.dark },
		// The push arms run from the body to the blade.
		{ k: 'line', d: 'M126 128 L156 132', color: P.slate, w: 8 },
		// The blade: tall and curved, the one shape that says bulldozer.
		{
			k: 'path',
			d: 'M150 88 L170 88 Q 182 126 172 166 L150 166 Q 160 126 150 88 Z',
			fill: P.gold,
			shade: true
		}
	],

	camper: () => [
		{
			k: 'path',
			d: 'M24 150 L24 82 Q 24 72 34 72 L164 72 Q 178 72 178 86 Q 178 98 166 98 L146 98 L162 126 L178 130 L178 150 Z',
			fill: P.cream,
			shade: true
		},
		// The bunk overhanging the cab is what makes it a camper and not a van.
		{ k: 'line', d: 'M30 92 H170', color: P.orange, w: 6 },
		{ k: 'path', d: 'M142 102 L146 102 L158 124 L142 124 Z', fill: P.sky, shade: true, soft: true },
		...glazing(34, 104, 26, 20, 2, 10),
		{ k: 'rect', x: 104, y: 102, w: 26, h: 42, rx: 4, fill: P.teal, shade: true, soft: true },
		{ k: 'circle', o: { cx: 124, cy: 124, r: 2.5 }, fill: P.cream },
		{ k: 'line', d: 'M28 134 H104', color: P.teal, w: 5 },
		{ k: 'circle', o: { cx: 172, cy: 140, r: 5 }, fill: P.yellow },
		...axle(58, 148, 150, 19)
	],

	'cement mixer': () => [
		{ k: 'rect', x: 24, y: 130, w: 152, h: 14, rx: 4, fill: P.slate, shade: true },
		// The drum tilts up toward the back, where its mouth is.
		{
			k: 'ellipse',
			o: { cx: 78, cy: 98, rx: 54, ry: 32, rot: 14 },
			fill: P.white,
			shade: true
		},
		{
			k: 'line',
			d: 'M61 69 Q 66 95 49 116 M86 72 Q 92 101 73 125 M111 82 Q 117 108 100 127',
			color: P.orange,
			w: 8
		},

		{
			k: 'path',
			d: 'M134 130 L134 88 L156 88 L176 110 L176 130 Z',
			fill: P.blue,
			shade: true
		},
		{ k: 'path', d: 'M142 108 L142 94 L154 94 L166 108 Z', fill: P.sky, shade: true, soft: true },
		{ k: 'circle', o: { cx: 170, cy: 120, r: 5 }, fill: P.cream },
		...wheel(52, 148, 18),
		...wheel(90, 148, 18),
		...wheel(152, 148, 18)
	],

	'crane truck': () => [
		{ k: 'rect', x: 24, y: 126, w: 152, h: 18, rx: 4, fill: P.slate, shade: true },
		// The boom, raised high, with a slimmer section sliding out of it.
		{ k: 'line', d: 'M100 62 L122 38', color: P.gold, w: 9 },
		{ k: 'line', d: 'M54 112 L106 56', color: P.yellow, w: 16 },
		{ k: 'line', d: 'M122 38 L122 84', color: P.dark, w: 3 },
		{ k: 'rect', x: 115, y: 82, w: 14, h: 10, rx: 2, fill: P.red },
		{ k: 'line', d: 'M122 92 L122 104 Q 122 114 112 110', color: P.dark, w: 6 },
		{ k: 'rect', x: 34, y: 100, w: 46, h: 28, rx: 5, fill: P.yellow, shade: true },
		{ k: 'path', d: 'M136 126 L136 84 L156 84 L176 106 L176 126 Z', fill: P.red, shade: true },
		{ k: 'path', d: 'M143 104 L143 90 L154 90 L166 104 Z', fill: P.sky, shade: true, soft: true },
		{ k: 'circle', o: { cx: 54, cy: 112, r: 7 }, fill: P.slate },
		...wheel(48, 146, 18),
		...wheel(86, 146, 18),
		...wheel(154, 146, 18)
	],

	digger: () => [
		...track(26, 136, 100, 30),
		{ k: 'rect', x: 28, y: 106, w: 92, h: 32, rx: 8, fill: P.orange, shade: true },
		{ k: 'path', d: 'M68 108 L68 66 L104 66 L112 108 Z', fill: P.orange, shade: true },
		{ k: 'path', d: 'M75 98 L75 73 L100 73 L105 98 Z', fill: P.sky, shade: true, soft: true },
		// Boom up, stick down, bucket curled under: the excavator's elbow.
		{ k: 'line', d: 'M108 112 L146 54', color: P.orange, w: 14 },
		{ k: 'line', d: 'M146 54 L164 118', color: P.gold, w: 11 },
		{
			k: 'path',
			d: 'M152 114 L176 112 L178 140 Q 166 152 150 140 Z',
			fill: P.slate,
			shade: true
		},
		{ k: 'circle', o: { cx: 146, cy: 54, r: 6 }, fill: P.dark }
	],

	'race car': () => [
		// Rear wing on its post, front wing low at the nose.
		{ k: 'line', d: 'M40 112 L40 90', color: P.dark, w: 6 },
		{ k: 'rect', x: 24, y: 80, w: 34, h: 12, rx: 3, fill: P.dark, shade: true },
		{
			k: 'path',
			d: 'M28 134 L30 108 L84 104 L108 104 L176 122 L178 134 Z',
			fill: P.red,
			shade: true
		},
		{ k: 'rect', x: 150, y: 132, w: 30, h: 8, rx: 2, fill: P.dark },
		{ k: 'circle', o: { cx: 92, cy: 96, r: 12 }, fill: P.yellow, shade: true },
		{ k: 'rect', x: 92, y: 92, w: 12, h: 6, rx: 2, fill: P.dark },
		// The roundel, where a number would go.
		{ k: 'circle', o: { cx: 104, cy: 120, r: 9 }, fill: P.white, shade: true, soft: true },
		...axle(56, 146, 138, 24)
	],

	taxi: () => [
		// The roof lamp is what makes it a taxi rather than a car.
		{ k: 'path', d: 'M84 82 L89 62 L117 62 L122 82 Z', fill: P.white, shade: true },
		{ k: 'rect', x: 92, y: 68, w: 22, h: 7, rx: 2, fill: P.orange },
		{ k: 'rect', x: 22, y: 110, w: 156, h: 36, rx: 10, fill: P.yellow, shade: true },
		{ k: 'path', d: 'M54 112 L68 80 L136 80 L156 112 Z', fill: P.yellow, shade: true },
		{ k: 'path', d: 'M64 108 L74 86 L98 86 L98 108 Z', fill: P.sky, shade: true, soft: true },
		{ k: 'path', d: 'M106 86 L132 86 L146 108 L106 108 Z', fill: P.sky, shade: true, soft: true },
		{ k: 'line', d: 'M26 126 H174', color: P.green, w: 6 },
		{ k: 'circle', o: { cx: 170, cy: 118, r: 6 }, fill: P.cream },
		...axle(60, 140, 146, 19)
	]
};

// Kana word pictures: animals1. See ./index.ts.

import { P } from '../palette';
import { eye } from '../parts';
import type { Prim } from '../render';
import type { Subject } from '../subjects';

/**
 * A scalloped disc: `n` round bumps around a circle, as one closed path. The
 * lion's mane, which a plain circle would read as a sun or a plate.
 */
const scallop = (cx: number, cy: number, r: number, n: number, bump: number): string => {
	const at = (t: number, rr: number) =>
		`${(cx + rr * Math.cos(t)).toFixed(1)} ${(cy + rr * Math.sin(t)).toFixed(1)}`;
	let d = `M${at(0, r)}`;
	for (let i = 0; i < n; i++) {
		const t0 = (i / n) * Math.PI * 2;
		const t1 = ((i + 1) / n) * Math.PI * 2;
		d += ` Q${at((t0 + t1) / 2, r + bump * 2)} ${at(t1, r)}`;
	}
	return d + ' Z';
};

export const ANIMALS1: Record<string, Subject> = {
	// ことり: a round little songbird perched on a twig, facing left.
	bird: (): Prim[] => [
		{
			k: 'path',
			d: 'M138 100 L176 62 C 180 74, 178 86, 170 96 L148 124 Z',
			fill: P.navy,
			shade: true
		},
		{ k: 'line', d: 'M24 158 C 70 150, 120 156, 176 146', color: P.brown, w: 9 },
		{ k: 'line', d: 'M140 152 C 150 138, 160 132, 170 130', color: P.brown, w: 6 },
		{
			k: 'ellipse',
			o: { cx: 168, cy: 126, rx: 11, ry: 6, rot: -30 },
			fill: P.green,
			shade: true,
			soft: true
		},
		{ k: 'line', d: 'M88 140 L84 158 M108 140 L110 157', color: P.orange, w: 5 },
		{ k: 'ellipse', o: { cx: 100, cy: 100, rx: 52, ry: 48 }, fill: P.blue, shade: true },
		{
			k: 'ellipse',
			o: { cx: 86, cy: 120, rx: 32, ry: 24 },
			fill: P.orange,
			shade: true,
			soft: true
		},
		{
			k: 'ellipse',
			o: { cx: 122, cy: 108, rx: 30, ry: 19, rot: -24 },
			fill: P.navy,
			shade: true
		},
		{ k: 'path', d: 'M52 88 L30 98 L53 106 Z', fill: P.gold },
		...eye(72, 86, 7)
	],

	// ひよこ: a fluffy yellow chick still sitting in the bottom of its egg.
	chick: (): Prim[] => [
		{
			k: 'line',
			d: 'M100 46 C 96 34, 90 30, 84 30 M100 46 C 102 32, 108 26, 116 26',
			color: P.gold,
			w: 6
		},
		{ k: 'circle', o: { cx: 100, cy: 98, r: 52 }, fill: P.yellow, shade: true },
		{
			k: 'ellipse',
			o: { cx: 50, cy: 112, rx: 12, ry: 20, rot: 30 },
			fill: P.yellow,
			shade: true
		},
		{
			k: 'ellipse',
			o: { cx: 150, cy: 112, rx: 12, ry: 20, rot: -30 },
			fill: P.yellow,
			shade: true
		},
		{
			k: 'path',
			d: 'M40 128 L54 116 L66 130 L80 114 L94 130 L108 114 L122 130 L136 116 L148 130 L160 118 C 162 160, 138 184, 100 184 C 62 184, 38 160, 40 128 Z',
			fill: P.white,
			shade: true
		},
		{ k: 'path', d: 'M90 96 L110 96 L100 110 Z', fill: P.orange },
		{ k: 'circle', o: { cx: 70, cy: 106, r: 7 }, fill: P.pink, op: 0.7 },
		{ k: 'circle', o: { cx: 130, cy: 106, r: 7 }, fill: P.pink, op: 0.7 },
		...eye(80, 86, 7),
		...eye(120, 86, 7)
	],

	// あひる: the white farmyard duck, side on, with an orange bill and feet.
	duck: (): Prim[] => [
		{
			k: 'path',
			d: 'M96 164 L90 182 L72 184 L80 176 Z M126 164 L124 182 L106 184 L114 176 Z',
			fill: P.orange
		},
		{ k: 'line', d: 'M96 158 L92 180 M126 158 L122 180', color: P.orange, w: 6 },
		{
			k: 'path',
			d: 'M58 112 C 50 150, 88 172, 128 168 C 160 164, 176 140, 178 100 C 166 112, 152 112, 140 108 C 116 100, 84 98, 58 112 Z',
			fill: P.white,
			shade: true
		},
		{
			k: 'path',
			d: 'M52 70 C 48 94, 52 112, 62 128 L 98 118 C 90 104, 88 88, 88 70 Z',
			fill: P.white,
			shade: true
		},
		{ k: 'circle', o: { cx: 70, cy: 62, r: 28 }, fill: P.white, shade: true },
		{
			k: 'path',
			d: 'M104 124 C 120 112, 150 112, 164 120 C 152 142, 124 146, 104 124 Z',
			fill: P.cream,
			shade: true,
			soft: true
		},
		{
			k: 'path',
			d: 'M48 60 C 38 58, 26 62, 24 70 C 30 76, 42 78, 50 74 Z',
			fill: P.orange,
			shade: true
		},
		...eye(70, 56, 6.5)
	],

	// うさぎ: a sitting rabbit, front on, ears straight up.
	rabbit: (): Prim[] => [
		{ k: 'ellipse', o: { cx: 80, cy: 52, rx: 15, ry: 32, rot: -8 }, fill: P.sand, shade: true },
		{ k: 'ellipse', o: { cx: 120, cy: 52, rx: 15, ry: 32, rot: 8 }, fill: P.sand, shade: true },
		{
			k: 'ellipse',
			o: { cx: 80, cy: 54, rx: 7, ry: 23, rot: -8 },
			fill: P.pink,
			shade: true,
			soft: true
		},
		{
			k: 'ellipse',
			o: { cx: 120, cy: 54, rx: 7, ry: 23, rot: 8 },
			fill: P.pink,
			shade: true,
			soft: true
		},
		{ k: 'ellipse', o: { cx: 100, cy: 150, rx: 46, ry: 36 }, fill: P.sand, shade: true },
		{
			k: 'ellipse',
			o: { cx: 100, cy: 156, rx: 26, ry: 26 },
			fill: P.cream,
			shade: true,
			soft: true
		},
		{
			k: 'ellipse',
			o: { cx: 76, cy: 180, rx: 18, ry: 9 },
			fill: P.cream,
			shade: true,
			soft: true
		},
		{
			k: 'ellipse',
			o: { cx: 124, cy: 180, rx: 18, ry: 9 },
			fill: P.cream,
			shade: true,
			soft: true
		},
		{ k: 'ellipse', o: { cx: 100, cy: 100, rx: 40, ry: 36 }, fill: P.sand, shade: true },
		{
			k: 'ellipse',
			o: { cx: 100, cy: 116, rx: 20, ry: 14 },
			fill: P.cream,
			shade: true,
			soft: true
		},
		{ k: 'rect', x: 95, y: 118, w: 10, h: 9, rx: 2, fill: P.white },
		{ k: 'line', d: 'M100 112 v 6 M100 118 q -7 6 -12 1 M100 118 q 7 6 12 1', color: P.dark, w: 3 },
		{ k: 'path', d: 'M93 106 L107 106 L100 114 Z', fill: P.pink },
		...eye(84, 94),
		...eye(116, 94)
	],

	// しか: a sika deer, side on, with pale spots and small antlers.
	deer: (): Prim[] => [
		{
			k: 'line',
			d: 'M84 130 L82 180 M100 132 L100 180 M134 132 L136 180 M150 128 L152 180',
			color: P.brown,
			w: 10
		},
		{
			k: 'line',
			d: 'M82 176 v6 M100 176 v6 M136 176 v6 M152 176 v6',
			color: P.dark,
			w: 10,
			cap: 'butt'
		},
		{ k: 'ellipse', o: { cx: 164, cy: 96, rx: 10, ry: 8, rot: -30 }, fill: P.white, shade: true },
		{ k: 'ellipse', o: { cx: 116, cy: 110, rx: 52, ry: 30 }, fill: P.tan, shade: true },
		{
			k: 'path',
			d: 'M50 58 C 62 46, 80 52, 86 66 L 100 96 L 72 114 C 62 96, 52 80, 50 58 Z',
			fill: P.tan,
			shade: true
		},
		{
			k: 'line',
			d: 'M66 46 L60 28 M62 34 L52 30 M76 46 L80 28 M79 34 L88 30',
			color: P.brown,
			w: 5
		},
		{ k: 'ellipse', o: { cx: 80, cy: 48, rx: 15, ry: 7, rot: -30 }, fill: P.tan, shade: true },
		{ k: 'ellipse', o: { cx: 54, cy: 62, rx: 26, ry: 17, rot: 18 }, fill: P.tan, shade: true },
		...[
			[96, 96],
			[116, 92],
			[136, 96],
			[106, 108],
			[126, 108],
			[146, 110],
			[88, 112],
			[116, 124],
			[96, 124],
			[138, 122]
		].map(([cx, cy]): Prim => ({ k: 'circle', o: { cx, cy, r: 4.5 }, fill: P.cream })),
		{ k: 'ellipse', o: { cx: 32, cy: 70, rx: 6, ry: 5 }, fill: P.dark },
		...eye(56, 58, 6)
	],

	// キリン: head and neck, front on, the neck running off the bottom.
	giraffe: (): Prim[] => [
		{ k: 'line', d: 'M86 52 L82 28 M114 52 L118 28', color: P.gold, w: 7 },
		{ k: 'circle', o: { cx: 82, cy: 27, r: 6 }, fill: P.brown },
		{ k: 'circle', o: { cx: 118, cy: 27, r: 6 }, fill: P.brown },
		{
			k: 'ellipse',
			o: { cx: 58, cy: 60, rx: 20, ry: 9, rot: -20 },
			fill: P.yellow,
			shade: true
		},
		{
			k: 'ellipse',
			o: { cx: 142, cy: 60, rx: 20, ry: 9, rot: 20 },
			fill: P.yellow,
			shade: true
		},
		{
			k: 'path',
			d: 'M80 100 C 78 130, 72 160, 66 188 L134 188 C 128 160, 122 130, 120 100 Z',
			fill: P.yellow,
			shade: true
		},
		{ k: 'ellipse', o: { cx: 100, cy: 70, rx: 30, ry: 28 }, fill: P.yellow, shade: true },
		{
			k: 'ellipse',
			o: { cx: 100, cy: 98, rx: 24, ry: 18 },
			fill: P.sand,
			shade: true,
			soft: true
		},
		{
			k: 'rect',
			x: 84,
			y: 122,
			w: 18,
			h: 16,
			rx: 6,
			rot: 10,
			fill: P.brown,
			shade: true,
			soft: true
		},
		{
			k: 'rect',
			x: 104,
			y: 132,
			w: 16,
			h: 18,
			rx: 6,
			rot: -8,
			fill: P.brown,
			shade: true,
			soft: true
		},
		{
			k: 'rect',
			x: 78,
			y: 150,
			w: 20,
			h: 18,
			rx: 6,
			rot: -6,
			fill: P.brown,
			shade: true,
			soft: true
		},
		{
			k: 'rect',
			x: 104,
			y: 160,
			w: 20,
			h: 20,
			rx: 6,
			rot: 12,
			fill: P.brown,
			shade: true,
			soft: true
		},
		{ k: 'circle', o: { cx: 100, cy: 52, r: 7 }, fill: P.brown, shade: true, soft: true },
		{ k: 'ellipse', o: { cx: 92, cy: 98, rx: 3, ry: 4 }, fill: P.dark },
		{ k: 'ellipse', o: { cx: 108, cy: 98, rx: 3, ry: 4 }, fill: P.dark },
		{ k: 'line', d: 'M92 108 q 8 6 16 0', color: P.dark, w: 3 },
		...eye(86, 70, 6),
		...eye(114, 70, 6)
	],

	// ライオン: a lion's face in a big scalloped mane.
	lion: (): Prim[] => [
		{ k: 'path', d: scallop(100, 100, 64, 14, 9), fill: P.rust, shade: true },
		{ k: 'circle', o: { cx: 68, cy: 64, r: 13 }, fill: P.yellow, shade: true },
		{ k: 'circle', o: { cx: 132, cy: 64, r: 13 }, fill: P.yellow, shade: true },
		{ k: 'circle', o: { cx: 68, cy: 64, r: 6 }, fill: P.gold },
		{ k: 'circle', o: { cx: 132, cy: 64, r: 6 }, fill: P.gold },
		{ k: 'circle', o: { cx: 100, cy: 104, r: 44 }, fill: P.yellow, shade: true },
		{
			k: 'ellipse',
			o: { cx: 100, cy: 122, rx: 26, ry: 18 },
			fill: P.cream,
			shade: true,
			soft: true
		},
		{ k: 'path', d: 'M90 108 L110 108 L100 119 Z', fill: P.dark },
		{
			k: 'line',
			d: 'M100 119 L100 124 M100 124 q -8 7 -14 1 M100 124 q 8 7 14 1',
			color: P.dark,
			w: 3.4
		},
		...eye(82, 92),
		...eye(118, 92)
	],

	// ユニコーン: a white unicorn's head with a gold spiral horn and a rainbow mane.
	unicorn: (): Prim[] => [
		{
			k: 'path',
			d: 'M124 50 C 156 44, 174 72, 168 104 C 164 124, 168 142, 172 156 C 156 156, 140 132, 138 108 Z',
			fill: P.pink,
			shade: true
		},
		{
			k: 'path',
			d: 'M128 56 C 152 54, 164 76, 158 104 C 154 126, 160 144, 164 156 C 156 156, 142 136, 140 110 Z',
			fill: P.purple,
			shade: true
		},
		{
			k: 'path',
			d: 'M132 70 C 150 72, 156 92, 152 112 C 150 128, 154 142, 158 152 C 144 146, 136 128, 136 110 Z',
			fill: P.blue,
			shade: true,
			soft: true
		},
		{
			k: 'path',
			d: 'M72 68 C 62 52, 60 40, 66 38 C 74 36, 84 50, 86 62 Z',
			fill: P.white,
			shade: true
		},
		{
			k: 'path',
			d: 'M128 68 C 138 52, 140 40, 134 38 C 126 36, 116 50, 114 62 Z',
			fill: P.white,
			shade: true
		},
		{
			k: 'path',
			d: 'M100 56 C 128 56, 142 74, 142 98 C 142 120, 132 140, 124 158 C 116 174, 84 174, 76 158 C 68 140, 58 120, 58 98 C 58 74, 72 56, 100 56 Z',
			fill: P.white,
			shade: true
		},
		{ k: 'path', d: 'M100 22 L90 62 L110 62 Z', fill: P.yellow, shade: true },
		{ k: 'line', d: 'M95 50 L108 44 M93 58 L109 52 M97 38 L105 34', color: P.gold, w: 3 },
		{
			k: 'path',
			d: 'M76 70 C 84 56, 104 56, 116 64 C 108 66, 104 74, 104 84 C 96 74, 86 74, 76 80 C 78 76, 78 72, 76 70 Z',
			fill: P.pink,
			shade: true
		},
		{
			k: 'ellipse',
			o: { cx: 100, cy: 150, rx: 22, ry: 15 },
			fill: P.cream,
			shade: true,
			soft: true
		},
		{ k: 'ellipse', o: { cx: 92, cy: 148, rx: 3.5, ry: 5, rot: -14 }, fill: P.pink },
		{ k: 'ellipse', o: { cx: 108, cy: 148, rx: 3.5, ry: 5, rot: 14 }, fill: P.pink },
		{ k: 'circle', o: { cx: 74, cy: 120, r: 7 }, fill: P.pink, op: 0.6 },
		{ k: 'circle', o: { cx: 126, cy: 120, r: 7 }, fill: P.pink, op: 0.6 },
		...eye(82, 102, 7),
		...eye(118, 102, 7)
	]
};

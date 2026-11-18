// Kana word pictures: food. See ./index.ts.

import { P } from '../palette';
import type { Prim } from '../render';
import type { Subject } from '../subjects';

/** A plain round plate seen from a little above: rim and a slightly darker well. */
const plate = (cx: number, cy: number, rx: number, ry: number): Prim[] => [
	{ k: 'ellipse', o: { cx, cy, rx, ry }, fill: P.white, shade: true },
	{
		k: 'ellipse',
		o: { cx, cy: cy + ry * 0.05, rx: rx * 0.7, ry: ry * 0.62 },
		fill: P.sky,
		shade: true,
		soft: true,
		op: 0.45
	}
];

/** A plump sausage: a fat capsule along a line, with a lit stripe and two cuts. */
const sausage = (cx: number, cy: number, len: number, r: number, rot: number): Prim[] => {
	const a = (rot * Math.PI) / 180;
	const ux = Math.cos(a);
	const uy = Math.sin(a);
	const at = (t: number, n: number) =>
		`${(cx + ux * t - uy * n).toFixed(1)} ${(cy + uy * t + ux * n).toFixed(1)}`;
	const cut = (t: number) => `M${at(t - 4, -r * 0.7)} L${at(t + 4, -r * 0.05)}`;
	return [
		{
			k: 'rect',
			x: cx - len / 2,
			y: cy - r,
			w: len,
			h: r * 2,
			rx: r,
			rot,
			cx,
			cy,
			fill: P.red,
			shade: true
		},
		{
			k: 'line',
			d: `M${at(-len / 2 + r, -r * 0.5)} L${at(-len / 2 + r + len * 0.22, -r * 0.5)}`,
			color: P.orange,
			w: r * 0.3
		},
		{ k: 'line', d: `${cut(-len * 0.18)} ${cut(len * 0.12)}`, color: P.rust, w: 3 }
	];
};

export const FOOD: Record<string, Subject> = {
	// A Japanese strawberry shortcake slice: the tip points left, the cream back
	// faces right, sponge and cream in layers down the long side.
	cake: () => [
		// back face (the outside of the round cake): all cream
		{ k: 'path', d: 'M150 92 L178 72 L178 152 L150 176 Z', fill: P.white, shade: true },
		// long cut side
		{ k: 'path', d: 'M30 112 L150 92 L150 176 L30 176 Z', fill: P.sand, shade: true },
		{ k: 'path', d: 'M30 130 L150 116 L150 128 L30 139 Z', fill: P.white, shade: true, soft: true },
		{ k: 'path', d: 'M30 154 L150 148 L150 158 L30 163 Z', fill: P.white, shade: true, soft: true },
		{ k: 'path', d: 'M46 133 L130 124 L130 130 L46 138 Z', fill: P.red },
		{ k: 'path', d: 'M40 157 L124 152 L124 157 L40 161 Z', fill: P.red },
		// top: a thin cream triangle
		{ k: 'path', d: 'M30 112 L150 92 L178 72 Z', fill: P.white, shade: true },
		// whipped cream and the strawberry
		{ k: 'ellipse', o: { cx: 146, cy: 84, rx: 22, ry: 12 }, fill: P.white, shade: true },
		{
			k: 'path',
			d: 'M128 74 C 122 52, 140 36, 152 36 C 166 36, 178 52, 170 74 C 162 86, 136 86, 128 74 Z',
			fill: P.red,
			shade: true
		},
		{ k: 'path', d: 'M136 40 L152 28 L168 40 L152 44 Z', fill: P.green },
		{
			k: 'line',
			d: 'M140 56 h0.1 M158 54 h0.1 M150 66 h0.1 M138 70 h0.1 M162 70 h0.1',
			color: P.yellow,
			w: 3.4
		}
	],

	// A wedge with the tip to the left: a pale top, a deep back, holes in both.
	cheese: () => [
		{ k: 'path', d: 'M28 110 L144 84 L178 54 Z', fill: P.cream, shade: true },
		{ k: 'path', d: 'M144 84 L178 54 L178 144 L144 174 Z', fill: P.gold, shade: true },
		{ k: 'path', d: 'M28 110 L144 84 L144 174 L28 174 Z', fill: P.yellow, shade: true },
		{ k: 'circle', o: { cx: 58, cy: 136, r: 11 }, fill: P.gold, shade: true, soft: true },
		{ k: 'circle', o: { cx: 104, cy: 124, r: 15 }, fill: P.gold, shade: true, soft: true },
		{ k: 'circle', o: { cx: 116, cy: 158, r: 8 }, fill: P.gold, shade: true, soft: true },
		{ k: 'circle', o: { cx: 60, cy: 164, r: 6 }, fill: P.gold, shade: true, soft: true },
		{ k: 'path', d: 'M144 128 A 10 10 0 0 0 144 148 Z', fill: P.gold, shade: true, soft: true },
		{
			k: 'ellipse',
			o: { cx: 164, cy: 96, rx: 7, ry: 11 },
			fill: P.yellow,
			shade: true,
			soft: true
		},
		{ k: 'ellipse', o: { cx: 108, cy: 88, rx: 9, ry: 3.5 }, fill: P.sand, shade: true, soft: true }
	],

	// Two chocolate-chip cookies, one leaning on the other.
	cookie: () => [
		{ k: 'circle', o: { cx: 72, cy: 86, r: 46 }, fill: P.tan, shade: true },
		{ k: 'circle', o: { cx: 56, cy: 70, r: 6 }, fill: P.brown },
		{ k: 'circle', o: { cx: 82, cy: 62, r: 5 }, fill: P.brown },
		{ k: 'circle', o: { cx: 46, cy: 98, r: 5 }, fill: P.brown },
		{ k: 'circle', o: { cx: 112, cy: 122, r: 56 }, fill: P.sand, shade: true },
		{ k: 'circle', o: { cx: 92, cy: 100, r: 8 }, fill: P.brown },
		{ k: 'circle', o: { cx: 130, cy: 96, r: 7 }, fill: P.brown },
		{ k: 'circle', o: { cx: 112, cy: 126, r: 8 }, fill: P.brown },
		{ k: 'circle', o: { cx: 82, cy: 138, r: 7 }, fill: P.brown },
		{ k: 'circle', o: { cx: 144, cy: 136, r: 8 }, fill: P.brown },
		{ k: 'circle', o: { cx: 118, cy: 158, r: 6 }, fill: P.brown },
		{ k: 'circle', o: { cx: 150, cy: 108, r: 4 }, fill: P.brown }
	],

	// Round slices of ham fanned across a plate: pink meat, a paler fat rim.
	ham: () => [
		...plate(100, 126, 82, 46),
		...[
			{ cx: 60, cy: 114 },
			{ cx: 100, cy: 102 },
			{ cx: 140, cy: 114 }
		].flatMap(({ cx, cy }): Prim[] => [
			{ k: 'ellipse', o: { cx, cy, rx: 40, ry: 34 }, fill: P.cream, shade: true },
			{ k: 'ellipse', o: { cx, cy, rx: 33, ry: 27 }, fill: P.pink, shade: true },
			{
				k: 'line',
				d: `M${cx - 14} ${cy - 6} q 8 -6 16 0 M${cx - 4} ${cy + 10} q 8 -5 14 1`,
				color: P.cream,
				w: 2.6
			}
		])
	],

	hamburger: () => [
		// bottom bun
		{ k: 'rect', x: 34, y: 144, w: 132, h: 30, rx: 14, fill: P.tan, shade: true },
		// patty
		{ k: 'rect', x: 30, y: 122, w: 140, h: 28, rx: 14, fill: P.brown, shade: true },
		// cheese with drips
		{
			k: 'path',
			d: 'M30 116 L170 116 L170 124 L150 124 L140 140 L130 124 L80 124 L68 140 L56 124 L30 124 Z',
			fill: P.yellow,
			shade: true
		},
		// tomato
		{ k: 'rect', x: 36, y: 104, w: 128, h: 14, rx: 7, fill: P.red, shade: true },
		// lettuce
		{
			k: 'path',
			d: 'M26 102 C 34 92, 44 112, 54 100 C 64 90, 74 112, 86 100 C 96 90, 106 112, 116 100 C 126 90, 136 112, 148 100 C 158 90, 168 112, 174 100 L174 108 L26 108 Z',
			fill: P.green,
			shade: true
		},
		// top bun
		{
			k: 'path',
			d: 'M30 100 C 30 58, 64 38, 100 38 C 136 38, 170 58, 170 100 Z',
			fill: P.orange,
			shade: true
		},
		{
			k: 'line',
			d: 'M70 60 l6 -2 M100 52 l6 0 M126 60 l6 2 M84 76 l6 -1 M116 74 l6 1 M56 84 l5 -2 M142 84 l5 2',
			color: P.cream,
			w: 4
		}
	],

	// A waffle cone with two scoops: strawberry on vanilla.
	'ice cream': () => [
		{ k: 'path', d: 'M62 108 L138 108 L100 186 Z', fill: P.tan, shade: true },
		{
			k: 'line',
			d: 'M72 112 L116 160 M92 112 L126 148 M112 112 L132 128 M128 112 L84 160 M108 112 L74 148 M88 112 L68 128',
			color: P.brown,
			w: 3
		},
		{
			k: 'path',
			d: 'M54 110 C 46 80, 66 64, 100 64 C 134 64, 154 80, 146 110 C 136 120, 126 106, 116 116 C 106 124, 94 110, 84 118 C 74 124, 66 108, 54 110 Z',
			fill: P.cream,
			shade: true
		},
		{ k: 'circle', o: { cx: 100, cy: 60, r: 36 }, fill: P.pink, shade: true },
		{ k: 'line', d: 'M106 28 C 110 20, 116 18, 122 18', color: P.green, w: 3 },
		{ k: 'circle', o: { cx: 104, cy: 30, r: 10 }, fill: P.red, shade: true }
	],

	// A gable-top milk carton, three-quarter view, no lettering.
	milk: () => [
		// side face and its roof slope
		{ k: 'path', d: 'M122 84 L152 70 L152 166 L122 180 Z', fill: P.white, shade: true },
		{ k: 'path', d: 'M92 54 L122 84 L152 70 L122 40 Z', fill: P.white, shade: true },
		// front face and gable
		{ k: 'path', d: 'M56 84 L122 84 L122 180 L56 180 Z', fill: P.white, shade: true },
		{ k: 'path', d: 'M56 84 L89 52 L122 84 Z', fill: P.white, shade: true },
		// the sealed fin along the ridge
		{ k: 'path', d: 'M86 52 L119 38 L122 30 L89 44 Z', fill: P.white, shade: true },
		// blue band
		{ k: 'path', d: 'M56 122 L122 122 L122 156 L56 156 Z', fill: P.blue, shade: true, soft: true },
		{ k: 'path', d: 'M122 122 L152 108 L152 142 L122 156 Z', fill: P.blue, shade: true },
		{ k: 'line', d: 'M56 84 L122 84 L152 70', color: P.sky, w: 3 },
		// a white drop on the band
		{
			k: 'path',
			d: 'M89 126 C 82 138, 78 142, 78 146 C 78 152, 84 154, 89 154 C 94 154, 100 152, 100 146 C 100 142, 96 138, 89 126 Z',
			fill: P.white
		}
	],

	// Ramen: a bowl of broth, chopsticks lifting noodles, steam rising.
	noodles: () => [
		// steam
		{
			k: 'line',
			d: 'M60 66 C 52 56, 68 48, 60 36 M84 60 C 76 50, 92 42, 84 30',
			color: P.white,
			w: 6
		},
		// broth
		{ k: 'ellipse', o: { cx: 100, cy: 108, rx: 74, ry: 20 }, fill: P.gold, shade: true },
		// toppings
		{ k: 'ellipse', o: { cx: 66, cy: 108, rx: 15, ry: 9 }, fill: P.white, shade: true, soft: true },
		{ k: 'ellipse', o: { cx: 66, cy: 108, rx: 7, ry: 5 }, fill: P.yellow },
		{
			k: 'ellipse',
			o: { cx: 140, cy: 108, rx: 12, ry: 7 },
			fill: P.white,
			shade: true,
			soft: true
		},
		{ k: 'line', d: 'M134 108 q 6 -5 10 0', color: P.pink, w: 2.6 },
		// bowl
		{
			k: 'path',
			d: 'M24 108 C 28 150, 62 172, 100 172 C 138 172, 172 150, 176 108 C 160 124, 40 124, 24 108 Z',
			fill: P.red,
			shade: true
		},
		{ k: 'rect', x: 76, y: 168, w: 48, h: 10, rx: 4, fill: P.rust, shade: true },
		{ k: 'line', d: 'M40 136 H160', color: P.cream, w: 4, cap: 'butt' },
		// noodles hanging from the chopsticks into the bowl
		{
			k: 'line',
			d: 'M104 54 C 98 74, 108 90, 100 112 M112 56 C 108 76, 118 92, 112 112 M120 56 C 118 78, 128 94, 124 112',
			color: P.cream,
			w: 5
		},
		// chopsticks
		{ k: 'line', d: 'M96 56 L168 24', color: P.brown, w: 6 },
		{ k: 'line', d: 'M100 62 L172 36', color: P.brown, w: 6 }
	],

	// An onigiri: a rounded white rice triangle with a dark nori band.
	'rice ball': () => [
		{
			k: 'path',
			d: 'M100 32 C 116 32, 128 48, 148 86 C 168 124, 178 148, 168 164 C 160 176, 140 178, 100 178 C 60 178, 40 176, 32 164 C 22 148, 32 124, 52 86 C 72 48, 84 32, 100 32 Z',
			fill: P.white,
			shade: true
		},
		{ k: 'rect', x: 70, y: 118, w: 60, h: 60, rx: 4, fill: P.dark, shade: true },
		{ k: 'line', d: 'M80 130 V168 M120 130 V168', color: P.moss, w: 2.6, cap: 'butt' },
		{
			k: 'line',
			d: 'M74 70 h0.1 M118 62 h0.1 M58 112 h0.1 M144 110 h0.1 M98 92 h0.1 M50 150 h0.1 M152 150 h0.1',
			color: P.cream,
			w: 4
		}
	],

	// A Japanese convenience-store sandwich: a crustless triangle seen from a
	// little above, the cut face showing egg, lettuce and ham.
	sandwich: () => [
		// top slice
		{ k: 'path', d: 'M30 112 L148 112 L112 40 Z', fill: P.white, shade: true },
		{ k: 'line', d: 'M30 112 L112 40 L148 112', color: P.sand, w: 5 },
		// cut face: bread, lettuce, egg, ham, bread
		{ k: 'path', d: 'M30 112 L148 112 L148 176 L30 176 Z', fill: P.white, shade: true },
		{
			k: 'path',
			d: 'M30 124 C 40 118, 50 130, 60 124 C 70 118, 80 130, 90 124 C 100 118, 110 130, 120 124 C 130 118, 140 130, 148 124 L148 134 L30 134 Z',
			fill: P.green,
			shade: true
		},
		{ k: 'path', d: 'M30 134 L148 134 L148 150 L30 150 Z', fill: P.yellow, shade: true },
		{ k: 'path', d: 'M30 150 L148 150 L148 158 L30 158 Z', fill: P.pink, shade: true },
		// the side face of the far point, going back
		{ k: 'path', d: 'M148 112 L168 98 L168 162 L148 176 Z', fill: P.cream, shade: true },
		{ k: 'path', d: 'M148 112 L112 40 L168 98 Z', fill: P.white, shade: true },
		{ k: 'line', d: 'M112 40 L168 98', color: P.sand, w: 5 }
	],

	// Three plump sausages on a plate -- no bun, so not a hotdog.
	sausage: () => [
		...plate(100, 130, 84, 48),
		...sausage(94, 98, 112, 16, -16),
		...sausage(102, 130, 116, 16, -16),
		...sausage(110, 162, 104, 16, -16)
	],

	// Nori: a stack of dark green sheets, one rolled up in front.
	seaweed: () => [
		...[0, 1, 2].flatMap((i): Prim[] => {
			const y = 120 - i * 14;
			const x = 36 + i * 6;
			return [
				{
					k: 'path',
					d: `M${x} ${y} L${x + 92} ${y - 54} L${x + 136} ${y - 22} L${x + 44} ${y + 32} Z`,
					fill: i === 2 ? P.green : P.moss,
					shade: true
				},
				{
					k: 'line',
					d: `M${x} ${y} L${x + 44} ${y + 32} L${x + 136} ${y - 22}`,
					color: P.dark,
					w: 4
				}
			];
		}),
		// a crinkly texture on the top sheet
		{
			k: 'line',
			d: 'M74 88 L152 42 M86 96 L164 50 M98 104 L170 62 M62 80 L138 36',
			color: P.moss,
			w: 3
		},
		// the roll lying in front
		{ k: 'rect', x: 52, y: 146, w: 108, h: 34, rx: 17, fill: P.moss, shade: true },
		{ k: 'ellipse', o: { cx: 152, cy: 163, rx: 11, ry: 17 }, fill: P.dark, shade: true },
		{
			k: 'line',
			d: 'M152 163 m -4 0 a 4 5 0 1 1 8 0 a 7 9 0 1 1 -14 0',
			color: P.green,
			w: 2.6
		}
	]
};

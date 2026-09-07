// The word illustrations: one builder per word, each returning a list of
// primitives in the shared 200x210 box. The renderer decides colour treatment
// and shading, so nothing here worries about light or depth -- only shape.
//
// Everything should sit inside the backdrop disc, centred (100,102) radius 104,
// so roughly x 22..178 and y 22..186.

import { P } from './palette';
import type { Prim } from './render';

export type Subject = () => Prim[];

const eye = (cx: number, cy: number, r = 6.5): Prim[] => [
	{ k: 'circle', o: { cx, cy, r }, fill: P.dark },
	{ k: 'circle', o: { cx: cx + r * 0.36, cy: cy - r * 0.36, r: r * 0.34 }, fill: P.white }
];

export const SUBJECTS: Record<string, Subject> = {
	apple: () => [
		{ k: 'line', d: 'M100 80 C103 62 111 50 126 44', color: P.brown, w: 9 },
		{
			k: 'ellipse',
			o: { cx: 138, cy: 46, rx: 24, ry: 13, rot: -28 },
			fill: P.green,
			shade: true,
			soft: true
		},
		{
			k: 'path',
			d: 'M100 78 C 78 56, 40 66, 38 108 C 36 152, 72 184, 100 170 C 128 184, 164 152, 162 108 C 160 66, 122 56, 100 78 Z',
			fill: P.red,
			shade: true
		}
	],

	// A generic monster truck -- big wheels, flames, high cab. Deliberately not a
	// likeness of any particular television character, whose face and decals are
	// somebody's protected design and this repository is public.
	blaze: () => [
		{ k: 'circle', o: { cx: 54, cy: 150, r: 40 }, fill: P.dark, shade: true },
		{ k: 'circle', o: { cx: 146, cy: 150, r: 40 }, fill: P.dark, shade: true },
		{ k: 'circle', o: { cx: 54, cy: 150, r: 17 }, fill: P.grey, shade: true, soft: true },
		{ k: 'circle', o: { cx: 146, cy: 150, r: 17 }, fill: P.grey, shade: true, soft: true },
		{ k: 'line', d: 'M54 150 H146', color: P.slate, w: 9 },
		{ k: 'rect', x: 22, y: 96, w: 156, h: 46, rx: 12, fill: P.red, shade: true },
		{
			k: 'path',
			d: 'M60 98 L72 54 C 74 48, 80 46, 90 46 L 126 46 C 136 46, 142 50, 144 56 L 154 98 Z',
			fill: P.red,
			shade: true
		},
		{
			k: 'path',
			d: 'M78 92 L88 60 C 89 56, 92 55, 98 55 L 120 55 C 126 55, 129 57, 130 61 L 138 92 Z',
			fill: P.blue,
			shade: true,
			soft: true
		},
		{
			k: 'path',
			d: 'M28 138 C 42 116, 52 132, 66 110 C 76 130, 88 112, 100 130 C 112 110, 124 130, 136 112 C 146 132, 158 118, 170 138 Z',
			fill: P.yellow,
			shade: true,
			soft: true
		},
		{ k: 'circle', o: { cx: 168, cy: 110, r: 9 }, fill: P.yellow, shade: true, soft: true }
	],

	cat: () => [
		{ k: 'line', d: 'M148 168 C176 164 178 128 160 122', color: P.orange, w: 13 },
		{ k: 'path', d: 'M60 60 L52 22 L88 46 Z', fill: P.orange, shade: true },
		{ k: 'path', d: 'M140 60 L148 22 L112 46 Z', fill: P.orange, shade: true },
		{
			k: 'path',
			d: 'M70 118 C 60 148, 58 172, 62 180 L138 180 C 142 172, 140 148, 130 118 Z',
			fill: P.orange,
			shade: true
		},
		{
			k: 'ellipse',
			o: { cx: 100, cy: 158, rx: 22, ry: 24 },
			fill: P.cream,
			shade: true,
			soft: true
		},
		{ k: 'circle', o: { cx: 100, cy: 84, r: 46 }, fill: P.orange, shade: true },
		{
			k: 'ellipse',
			o: { cx: 100, cy: 100, rx: 26, ry: 18 },
			fill: P.cream,
			shade: true,
			soft: true
		},
		{ k: 'line', d: 'M42 92 L74 98 M42 108 L74 104', color: P.slate, w: 2.6 },
		{ k: 'line', d: 'M158 92 L126 98 M158 108 L126 104', color: P.slate, w: 2.6 },
		{ k: 'path', d: 'M92 92 L108 92 L100 101 Z', fill: P.pink },
		{
			k: 'line',
			d: 'M100 101 L100 106 M100 106 q -8 7 -14 1 M100 106 q 8 7 14 1',
			color: P.dark,
			w: 3.4
		},
		...eye(82, 74),
		...eye(118, 74)
	],

	dog: () => [
		{ k: 'ellipse', o: { cx: 54, cy: 84, rx: 25, ry: 43, rot: -8 }, fill: P.tan, shade: true },
		{ k: 'ellipse', o: { cx: 146, cy: 84, rx: 25, ry: 43, rot: 8 }, fill: P.tan, shade: true },
		{
			k: 'path',
			d: 'M68 116 C 60 148, 57 174, 62 182 L138 182 C 143 174, 140 148, 132 116 Z',
			fill: P.sand,
			shade: true
		},
		{
			k: 'ellipse',
			o: { cx: 78, cy: 177, rx: 17, ry: 10 },
			fill: P.cream,
			shade: true,
			soft: true
		},
		{
			k: 'ellipse',
			o: { cx: 122, cy: 177, rx: 17, ry: 10 },
			fill: P.cream,
			shade: true,
			soft: true
		},
		{
			k: 'ellipse',
			o: { cx: 100, cy: 154, rx: 21, ry: 27 },
			fill: P.cream,
			shade: true,
			soft: true
		},
		{ k: 'circle', o: { cx: 100, cy: 84, r: 46 }, fill: P.sand, shade: true },
		{
			k: 'ellipse',
			o: { cx: 100, cy: 102, rx: 27, ry: 21 },
			fill: P.cream,
			shade: true,
			soft: true
		},
		{
			k: 'line',
			d: 'M100 100 v 7 M100 107 q -10 9 -17 1 M100 107 q 10 9 17 1',
			color: P.dark,
			w: 4
		},
		{ k: 'ellipse', o: { cx: 100, cy: 92, rx: 11, ry: 8 }, fill: P.dark },
		...eye(81, 72),
		...eye(119, 72)
	],

	elephant: () => [
		{ k: 'ellipse', o: { cx: 46, cy: 96, rx: 30, ry: 40, rot: -12 }, fill: P.grey, shade: true },
		{ k: 'ellipse', o: { cx: 154, cy: 96, rx: 30, ry: 40, rot: 12 }, fill: P.grey, shade: true },
		{ k: 'ellipse', o: { cx: 100, cy: 96, rx: 48, ry: 46 }, fill: P.slate, shade: true },
		{ k: 'line', d: 'M100 130 C 100 158, 116 168, 132 160', color: P.slate, w: 22 },
		{ k: 'line', d: 'M78 132 L70 156 M122 132 L130 156', color: P.cream, w: 8 },
		...eye(80, 88),
		...eye(120, 88)
	],

	fish: () => [
		{
			k: 'path',
			d: 'M158 72 L194 108 L158 148 C 146 128, 146 92, 158 72 Z',
			fill: P.rust,
			shade: true
		},
		{ k: 'path', d: 'M78 78 C 92 46, 122 46, 134 78 Z', fill: P.rust, shade: true },
		{ k: 'path', d: 'M84 142 C 96 168, 118 168, 128 142 Z', fill: P.rust, shade: true },
		{ k: 'ellipse', o: { cx: 96, cy: 110, rx: 66, ry: 40 }, fill: P.orange, shade: true },
		{ k: 'ellipse', o: { cx: 96, cy: 126, rx: 38, ry: 16 }, fill: P.sand, shade: true, soft: true },
		...eye(54, 100, 7.5)
	],

	goat: () => [
		{ k: 'line', d: 'M74 48 C 58 26, 40 26, 38 44', color: P.tan, w: 11 },
		{ k: 'line', d: 'M126 48 C 142 26, 160 26, 162 44', color: P.tan, w: 11 },
		{
			k: 'ellipse',
			o: { cx: 52, cy: 78, rx: 22, ry: 12, rot: 18 },
			fill: P.cream,
			shade: true,
			soft: true
		},
		{
			k: 'ellipse',
			o: { cx: 148, cy: 78, rx: 22, ry: 12, rot: -18 },
			fill: P.cream,
			shade: true,
			soft: true
		},
		{ k: 'ellipse', o: { cx: 100, cy: 96, rx: 42, ry: 48 }, fill: P.white, shade: true },
		{
			k: 'path',
			d: 'M84 140 C 88 168, 112 168, 116 140 Z',
			fill: P.white,
			shade: true,
			soft: true
		},
		{
			k: 'ellipse',
			o: { cx: 100, cy: 124, rx: 20, ry: 15 },
			fill: P.cream,
			shade: true,
			soft: true
		},
		{ k: 'ellipse', o: { cx: 100, cy: 118, rx: 8, ry: 6 }, fill: P.dark },
		...eye(82, 88, 6),
		...eye(118, 88, 6)
	],

	hat: () => [
		{ k: 'ellipse', o: { cx: 100, cy: 152, rx: 76, ry: 22 }, fill: P.navy, shade: true },
		{
			k: 'path',
			d: 'M62 152 L66 58 C 66 46, 134 46, 134 58 L138 152 Z',
			fill: P.navy,
			shade: true
		},
		{ k: 'rect', x: 62, y: 118, w: 76, h: 22, fill: P.red, shade: true, soft: true },
		{ k: 'ellipse', o: { cx: 100, cy: 56, rx: 34, ry: 11 }, fill: P.slate, shade: true, soft: true }
	],

	igloo: () => [
		{ k: 'path', d: 'M22 156 A 78 66 0 0 1 178 156 Z', fill: P.white, shade: true },
		{ k: 'line', d: 'M34 130 H166 M50 100 H150', color: P.grey, w: 2.6, cap: 'butt' },
		{
			k: 'line',
			d: 'M72 156 V130 M128 156 V130 M100 130 V100 M62 100 L58 130 M138 100 L142 130',
			color: P.grey,
			w: 2.6,
			cap: 'butt'
		},
		{ k: 'path', d: 'M74 156 A 26 30 0 0 1 126 156 Z', fill: P.slate, shade: true },
		{ k: 'rect', x: 18, y: 156, w: 164, h: 12, rx: 6, fill: P.white, shade: true, soft: true }
	],

	juice: () => [
		{ k: 'line', d: 'M120 38 L104 62', color: P.red, w: 11 },
		{
			k: 'path',
			d: 'M62 62 L138 62 L128 168 C 126 178, 74 178, 72 168 Z',
			fill: P.cream,
			shade: true,
			soft: true,
			op: 0.55
		},
		{
			k: 'path',
			d: 'M68 92 L132 92 L126 166 C 124 174, 76 174, 74 166 Z',
			fill: P.orange,
			shade: true
		},
		{ k: 'ellipse', o: { cx: 100, cy: 92, rx: 32, ry: 8 }, fill: P.gold, shade: true, soft: true },
		{ k: 'ellipse', o: { cx: 100, cy: 62, rx: 38, ry: 9 }, fill: P.sand, shade: true, soft: true },
		{ k: 'line', d: 'M82 108 L78 152', color: P.white, w: 5, cap: 'round' }
	],

	kite: () => [
		{
			k: 'line',
			d: 'M90 124 C 100 152, 128 156, 130 176 C 132 192, 150 196, 162 189',
			color: P.brown,
			w: 4.5
		},
		...[
			{ cx: 105, cy: 146, rot: -46 },
			{ cx: 127, cy: 168, rot: -27 },
			{ cx: 142, cy: 191, rot: -71 }
		].map((b): Prim => ({
			k: 'rect',
			x: b.cx - 15,
			y: b.cy - 6,
			w: 30,
			h: 12,
			rx: 6,
			rot: b.rot,
			cx: b.cx,
			cy: b.cy,
			fill: P.purple
		})),
		{ k: 'path', d: 'M90 14 L 44 70 L 90 70 Z', fill: P.teal, shade: true },
		{ k: 'path', d: 'M90 14 L 136 70 L 90 70 Z', fill: P.yellow, shade: true },
		{ k: 'path', d: 'M44 70 L 90 124 L 90 70 Z', fill: P.red, shade: true },
		{ k: 'path', d: 'M136 70 L 90 124 L 90 70 Z', fill: P.green, shade: true }
	],

	leaf: () => [
		{
			k: 'path',
			d: 'M100 24 C 156 62, 158 148, 100 186 C 42 148, 44 62, 100 24 Z',
			fill: P.green,
			shade: true
		},
		{ k: 'line', d: 'M100 30 L100 184', color: P.moss, w: 5 },
		{
			k: 'line',
			d: 'M100 66 L64 60 M100 66 L136 60 M100 104 L58 100 M100 104 L142 100 M100 142 L68 142 M100 142 L132 142',
			color: P.moss,
			w: 3.4
		}
	],

	moon: () => [
		{
			k: 'path',
			d: 'M132 30 A 74 74 0 1 0 132 186 A 60 74 0 1 1 132 30 Z',
			fill: P.yellow,
			shade: true
		},
		{ k: 'path', d: 'M162 46 l5 13 l13 5 l-13 5 l-5 13 l-5 -13 l-13 -5 l13 -5 Z', fill: P.cream },
		{ k: 'path', d: 'M150 130 l4 10 l10 4 l-10 4 l-4 10 l-4 -10 l-10 -4 l10 -4 Z', fill: P.cream },
		{ k: 'path', d: 'M176 96 l3 8 l8 3 l-8 3 l-3 8 l-3 -8 l-8 -3 l8 -3 Z', fill: P.cream }
	],

	nest: () => [
		{ k: 'ellipse', o: { cx: 72, cy: 108, rx: 23, ry: 27, rot: -12 }, fill: P.cream, shade: true },
		{ k: 'ellipse', o: { cx: 128, cy: 108, rx: 23, ry: 27, rot: 12 }, fill: P.cream, shade: true },
		{ k: 'ellipse', o: { cx: 100, cy: 96, rx: 23, ry: 27 }, fill: P.white, shade: true },
		{
			k: 'path',
			d: 'M20 110 C 30 184, 170 184, 180 110 C 158 138, 42 138, 20 110 Z',
			fill: P.brown,
			shade: true
		},
		{
			k: 'line',
			d: 'M28 128 C 70 154, 130 154, 172 128 M36 148 C 74 168, 126 168, 164 148 M46 164 C 76 178, 124 178, 154 164',
			color: P.tan,
			w: 4.5
		}
	],

	orange: () => [
		{ k: 'line', d: 'M100 56 C 102 44, 108 36, 118 32', color: P.brown, w: 8 },
		{
			k: 'ellipse',
			o: { cx: 130, cy: 34, rx: 22, ry: 12, rot: -24 },
			fill: P.green,
			shade: true,
			soft: true
		},
		{ k: 'circle', o: { cx: 100, cy: 116, r: 62 }, fill: P.orange, shade: true },
		{ k: 'circle', o: { cx: 100, cy: 116, r: 34 }, fill: P.gold, shade: true, soft: true, op: 0.5 }
	],

	penguin: () => [
		{ k: 'path', d: 'M76 176 L48 186 L78 190 Z', fill: P.orange, shade: true },
		{ k: 'path', d: 'M124 176 L152 186 L122 190 Z', fill: P.orange, shade: true },
		{ k: 'ellipse', o: { cx: 40, cy: 118, rx: 16, ry: 40, rot: 16 }, fill: P.navy, shade: true },
		{ k: 'ellipse', o: { cx: 160, cy: 118, rx: 16, ry: 40, rot: -16 }, fill: P.navy, shade: true },
		{ k: 'ellipse', o: { cx: 100, cy: 116, rx: 56, ry: 70 }, fill: P.navy, shade: true },
		{
			k: 'ellipse',
			o: { cx: 100, cy: 128, rx: 36, ry: 52 },
			fill: P.white,
			shade: true,
			soft: true
		},
		{ k: 'path', d: 'M100 74 L120 86 L100 96 L80 86 Z', fill: P.orange, shade: true },
		...eye(84, 66, 7),
		...eye(116, 66, 7)
	],

	queen: () => [
		{
			k: 'path',
			d: 'M50 178 C 54 128, 76 108, 100 108 C 124 108, 146 128, 150 178 Z',
			fill: P.purple,
			shade: true
		},
		{ k: 'circle', o: { cx: 100, cy: 88, r: 40 }, fill: P.sand, shade: true },
		{
			k: 'path',
			d: 'M60 56 L60 26 L78 42 L100 18 L122 42 L140 26 L140 56 Z',
			fill: P.yellow,
			shade: true
		},
		{ k: 'circle', o: { cx: 100, cy: 30, r: 6 }, fill: P.red },
		{ k: 'line', d: 'M92 104 q 8 8 16 0', color: P.dark, w: 3.6 },
		...eye(86, 84, 6),
		...eye(114, 84, 6)
	],

	rainbow: () => [
		{
			k: 'line',
			d: 'M28 158 A 72 72 0 0 1 172 158',
			color: P.red,
			w: 16,
			cap: 'butt'
		},
		{ k: 'line', d: 'M44 158 A 56 56 0 0 1 156 158', color: P.orange, w: 16, cap: 'butt' },
		{ k: 'line', d: 'M60 158 A 40 40 0 0 1 140 158', color: P.yellow, w: 16, cap: 'butt' },
		{ k: 'line', d: 'M76 158 A 24 24 0 0 1 124 158', color: P.teal, w: 16, cap: 'butt' },
		{ k: 'ellipse', o: { cx: 40, cy: 162, rx: 30, ry: 18 }, fill: P.white, shade: true },
		{ k: 'ellipse', o: { cx: 160, cy: 162, rx: 30, ry: 18 }, fill: P.white, shade: true }
	],

	sun: () => [
		{
			k: 'line',
			d: 'M100 18 V44 M100 160 V186 M18 102 H44 M156 102 H182 M42 44 L60 62 M140 142 L158 160 M158 44 L140 62 M60 142 L42 160',
			color: P.gold,
			w: 11
		},
		{ k: 'circle', o: { cx: 100, cy: 102, r: 54 }, fill: P.yellow, shade: true }
	],

	tree: () => [
		{ k: 'rect', x: 88, y: 108, w: 24, h: 76, rx: 6, fill: P.brown, shade: true },
		{ k: 'circle', o: { cx: 68, cy: 96, r: 38 }, fill: P.moss, shade: true },
		{ k: 'circle', o: { cx: 132, cy: 96, r: 38 }, fill: P.moss, shade: true },
		{ k: 'circle', o: { cx: 100, cy: 66, r: 44 }, fill: P.green, shade: true }
	],

	umbrella: () => [
		{ k: 'line', d: 'M100 60 L100 154 C 100 174, 74 176, 70 158', color: P.brown, w: 8 },
		{
			k: 'path',
			d: 'M20 108 A 80 66 0 0 1 180 108 C 168 96, 156 96, 146 108 C 136 96, 124 96, 112 108 C 100 96, 88 96, 76 108 C 64 96, 52 96, 42 108 C 32 96, 30 100, 20 108 Z',
			fill: P.red,
			shade: true
		},
		{ k: 'line', d: 'M100 42 L100 60', color: P.brown, w: 8 },
		{ k: 'circle', o: { cx: 100, cy: 40, r: 7 }, fill: P.brown }
	],

	violin: () => [
		{ k: 'rect', x: 92, y: 24, w: 16, h: 70, rx: 5, fill: P.brown, shade: true },
		{
			k: 'path',
			d: 'M100 84 C 68 84, 56 106, 62 122 C 66 134, 62 140, 58 150 C 52 168, 74 186, 100 186 C 126 186, 148 168, 142 150 C 138 140, 134 134, 138 122 C 144 106, 132 84, 100 84 Z',
			fill: P.rust,
			shade: true
		},
		{ k: 'line', d: 'M94 100 L94 178 M100 100 L100 178 M106 100 L106 178', color: P.cream, w: 1.8 },
		{ k: 'rect', x: 86, y: 148, w: 28, h: 7, rx: 3, fill: P.dark },
		{ k: 'circle', o: { cx: 92, cy: 26, r: 6 }, fill: P.tan },
		{ k: 'circle', o: { cx: 108, cy: 26, r: 6 }, fill: P.tan }
	],

	whale: () => [
		{
			k: 'line',
			d: 'M60 62 C 56 42, 66 34, 76 32 M60 62 C 74 50, 88 52, 94 40',
			color: P.blue,
			w: 7
		},
		{ k: 'path', d: 'M168 92 L188 68 L186 140 L164 122 Z', fill: P.navy, shade: true },
		{ k: 'ellipse', o: { cx: 96, cy: 118, rx: 70, ry: 46 }, fill: P.blue, shade: true },
		{
			k: 'path',
			d: 'M40 130 C 66 158, 132 158, 156 130 C 132 152, 66 152, 40 130 Z',
			fill: P.white,
			shade: true,
			soft: true
		},
		{
			k: 'ellipse',
			o: { cx: 100, cy: 140, rx: 26, ry: 14, rot: -8 },
			fill: P.navy,
			shade: true,
			soft: true
		},
		...eye(54, 104, 7)
	],

	xylophone: () => [
		{ k: 'rect', x: 30, y: 40, w: 140, h: 12, rx: 6, rot: 8, fill: P.brown, shade: true },
		{ k: 'rect', x: 30, y: 150, w: 140, h: 12, rx: 6, rot: -8, fill: P.brown, shade: true },
		...[P.red, P.orange, P.yellow, P.green, P.teal, P.purple].map((fill, i): Prim => ({
			k: 'rect',
			x: 34 + i * 23,
			y: 46 + i * 4,
			w: 17,
			h: 112 - i * 8,
			rx: 6,
			fill,
			shade: true
		})),
		{ k: 'line', d: 'M176 176 L150 120', color: P.tan, w: 6 },
		{ k: 'circle', o: { cx: 148, cy: 114, r: 11 }, fill: P.slate, shade: true }
	],

	yoyo: () => [
		{ k: 'line', d: 'M100 24 L100 74', color: P.cream, w: 4 },
		{ k: 'circle', o: { cx: 100, cy: 122, r: 60 }, fill: P.red, shade: true },
		{ k: 'circle', o: { cx: 100, cy: 122, r: 34 }, fill: P.cream, shade: true, soft: true },
		{ k: 'circle', o: { cx: 100, cy: 122, r: 14 }, fill: P.rust, shade: true, soft: true }
	],

	zebra: () => [
		{ k: 'path', d: 'M64 54 L56 24 L86 42 Z', fill: P.white, shade: true },
		{ k: 'path', d: 'M136 54 L144 24 L114 42 Z', fill: P.white, shade: true },
		{ k: 'ellipse', o: { cx: 100, cy: 106, rx: 46, ry: 60 }, fill: P.white, shade: true },
		{
			k: 'line',
			d: 'M72 62 L84 82 M100 52 L100 78 M128 62 L116 82 M60 96 L82 100 M140 96 L118 100 M64 128 L86 122 M136 128 L114 122',
			color: P.dark,
			w: 7
		},
		{
			k: 'ellipse',
			o: { cx: 100, cy: 154, rx: 24, ry: 18 },
			fill: P.slate,
			shade: true,
			soft: true
		},
		{ k: 'ellipse', o: { cx: 92, cy: 150, rx: 4, ry: 5 }, fill: P.dark },
		{ k: 'ellipse', o: { cx: 108, cy: 150, rx: 4, ry: 5 }, fill: P.dark },
		...eye(80, 104, 7),
		...eye(120, 104, 7)
	]
};

// --- counting scenes -------------------------------------------------------
//
// Digits get a countable scene rather than a word picture: the numeral teaches
// the shape, the scene teaches what the shape means. Arrangements follow the
// familiar dice/ten-frame patterns, which are easier to subitise than a row.

const COUNT_LAYOUTS: Record<number, [number, number][]> = {
	1: [[100, 102]],
	2: [
		[66, 102],
		[134, 102]
	],
	3: [
		[100, 58],
		[66, 136],
		[134, 136]
	],
	4: [
		[68, 68],
		[132, 68],
		[68, 136],
		[132, 136]
	],
	5: [
		[66, 64],
		[134, 64],
		[100, 102],
		[66, 140],
		[134, 140]
	],
	6: [
		[66, 58],
		[134, 58],
		[66, 102],
		[134, 102],
		[66, 146],
		[134, 146]
	],
	7: [
		[60, 56],
		[100, 56],
		[140, 56],
		[100, 102],
		[60, 148],
		[100, 148],
		[140, 148]
	],
	8: [
		[60, 56],
		[100, 56],
		[140, 56],
		[60, 102],
		[140, 102],
		[60, 148],
		[100, 148],
		[140, 148]
	],
	9: [
		[58, 56],
		[100, 56],
		[142, 56],
		[58, 102],
		[100, 102],
		[142, 102],
		[58, 148],
		[100, 148],
		[142, 148]
	]
};

const COUNT_COLORS = [P.red, P.teal, P.yellow, P.green, P.purple, P.orange, P.blue, P.pink, P.gold];

function countScene(n: number): Prim[] {
	// Zero is the hard one: an empty basket says "none" in a way that drawing
	// nothing at all cannot.
	if (n === 0) {
		return [
			{
				k: 'path',
				d: 'M20 96 C 30 176, 170 176, 180 96 C 158 126, 42 126, 20 96 Z',
				fill: P.brown,
				shade: true
			},
			{
				k: 'line',
				d: 'M28 116 C 70 144, 130 144, 172 116 M36 138 C 74 160, 126 160, 164 138',
				color: P.tan,
				w: 4.5
			}
		];
	}
	const spots = COUNT_LAYOUTS[n];
	// Counters must read as separate things, so they shrink as the grid fills.
	const r = n <= 3 ? 30 : n <= 6 ? 25 : 19;
	return spots.map(([cx, cy], i) => ({
		k: 'circle',
		o: { cx, cy, r },
		fill: COUNT_COLORS[i % COUNT_COLORS.length],
		shade: true
	}));
}

const NUMBER_NAMES = [
	'zero',
	'one',
	'two',
	'three',
	'four',
	'five',
	'six',
	'seven',
	'eight',
	'nine'
];
for (const [n, name] of NUMBER_NAMES.entries()) {
	SUBJECTS[name] = () => countScene(n);
}

export const SUBJECT_NAMES = Object.keys(SUBJECTS);

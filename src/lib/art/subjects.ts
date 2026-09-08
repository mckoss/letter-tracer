// The word illustrations: one builder per word, each returning a list of
// primitives in the shared 200x210 box. The renderer decides colour treatment
// and shading, so nothing here worries about light or depth -- only shape.
//
// Everything should sit inside the backdrop disc, centred (100,102) radius 104,
// so roughly x 22..178 and y 22..186.

import { P } from './palette';
import type { Prim } from './render';

export type Subject = () => Prim[];

/**
 * Short strokes laid tangentially around an ellipse: the woven strands of a
 * nest rim, seen from above. Deterministic, so a picture is the same every time
 * it is drawn -- `k` only varies the depth each strand sits at.
 */
const weave = (cx: number, cy: number, rx: number, ry: number, n: number, arc = 0.62): string => {
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

	// Side view: the sausage is drawn first and runs longer than the buns, so it
	// shows at both ends and through the gap between the halves.
	hotdog: () => [
		{ k: 'rect', x: 16, y: 86, w: 168, h: 54, rx: 27, fill: P.rust, shade: true },
		{ k: 'rect', x: 26, y: 62, w: 148, h: 44, rx: 22, fill: P.sand, shade: true },
		{ k: 'rect', x: 26, y: 120, w: 148, h: 44, rx: 22, fill: P.sand, shade: true },
		{
			k: 'line',
			d: 'M46 118 L60 108 L74 118 L88 108 L102 118 L116 108 L130 118 L144 108 L156 117',
			color: P.yellow,
			w: 6
		}
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

	// Looking down into the nest: a woven rim of twigs, a dark hollow, and three
	// pale blue eggs settled into it.
	nest: () => [
		{ k: 'ellipse', o: { cx: 100, cy: 112, rx: 76, ry: 62 }, fill: P.tan, shade: true },
		{ k: 'line', d: weave(100, 112, 74, 60, 17), color: P.brown, w: 5, cap: 'round' },
		{ k: 'line', d: weave(100, 112, 62, 49, 13, 0.78), color: P.sand, w: 4.5, cap: 'round' },
		// The hollow. Two rings rather than one, so the cup has a visible depth.
		{ k: 'ellipse', o: { cx: 100, cy: 113, rx: 52, ry: 41 }, fill: P.brown, shade: true },
		{ k: 'ellipse', o: { cx: 100, cy: 116, rx: 45, ry: 34 }, fill: P.dark, shade: true, op: 0.55 },
		// Three eggs, nestled: the two behind sit higher, the front one overlaps.
		{ k: 'ellipse', o: { cx: 82, cy: 102, rx: 21, ry: 16, rot: -26 }, fill: P.sky, shade: true },
		{ k: 'ellipse', o: { cx: 119, cy: 101, rx: 21, ry: 16, rot: 24 }, fill: P.sky, shade: true },
		{ k: 'ellipse', o: { cx: 100, cy: 124, rx: 22, ry: 16, rot: -6 }, fill: P.sky, shade: true },
		{
			k: 'line',
			d: 'M76 99 L76.4 99 M87 96 L87.4 96 M80 108 L80.4 108 M90 105 L90.4 105 M113 96 L113.4 96 M124 99 L124.4 99 M118 106 L118.4 106 M126 104 L126.4 104 M94 121 L94.4 121 M104 118 L104.4 118 M108 128 L108.4 128 M96 130 L96.4 130',
			color: P.tan,
			w: 3.4,
			cap: 'round'
		},
		// A few strands crossing the rim, so it reads as woven rather than as a
		// bowl with a pattern printed on it.
		{
			k: 'line',
			d: 'M26 124 C 44 112, 52 100, 46 86 M174 124 C 156 112, 148 100, 154 86 M62 168 C 78 160, 96 158, 112 162',
			color: P.brown,
			w: 5,
			cap: 'round'
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
		// Shoulders and gown, cut off by the backdrop disc.
		{
			k: 'path',
			d: 'M46 186 C 48 152, 70 138, 100 138 C 130 138, 152 152, 154 186 Z',
			fill: P.purple,
			shade: true
		},
		{ k: 'rect', x: 88, y: 124, w: 24, h: 28, fill: P.sand, shade: true },
		// Long hair behind, falling either side of the face.
		{
			k: 'path',
			d: 'M50 98 Q 38 160 58 186 Q 100 148 142 186 Q 162 160 150 98 Z',
			fill: P.brown,
			shade: true
		},
		{
			k: 'path',
			d: 'M65 95 Q 65 145 100 150 Q 135 145 135 95 Q 135 60 100 60 Q 65 60 65 95 Z',
			fill: P.sand,
			shade: true
		},
		{ k: 'circle', o: { cx: 78, cy: 121, r: 8 }, fill: P.pink, op: 0.45 },
		{ k: 'circle', o: { cx: 122, cy: 121, r: 8 }, fill: P.pink, op: 0.45 },
		// Almond eyes rather than the plain dots the animals use.
		{ k: 'path', d: 'M74 105 Q 82 99 90 105 Q 82 111 74 105 Z', fill: P.white },
		{ k: 'circle', o: { cx: 82, cy: 105, r: 4 }, fill: P.dark },
		{ k: 'circle', o: { cx: 80.8, cy: 103.8, r: 1.5 }, fill: P.white },
		{ k: 'path', d: 'M110 105 Q 118 99 126 105 Q 118 111 110 105 Z', fill: P.white },
		{ k: 'circle', o: { cx: 118, cy: 105, r: 4 }, fill: P.dark },
		{ k: 'circle', o: { cx: 116.8, cy: 103.8, r: 1.5 }, fill: P.white },
		{ k: 'line', d: 'M72 95 Q 82 89 90 95 M110 95 Q 118 89 128 95', color: P.brown, w: 2.6 },
		{ k: 'path', d: 'M100 107 L96 118 L100 120.5 L104 118 Z', fill: P.tan },
		{ k: 'path', d: 'M90 132 Q 100 139 110 132 Q 100 145 90 132 Z', fill: P.rust },
		// Fringe, swept from a centre parting.
		{
			k: 'path',
			d: 'M100 60 Q 75 60 60 95 Q 55 80 65 60 Q 80 45 100 60 Z',
			fill: P.brown,
			shade: true
		},
		{
			k: 'path',
			d: 'M100 60 Q 125 60 140 95 Q 145 80 135 60 Q 120 45 100 60 Z',
			fill: P.brown,
			shade: true
		},
		{ k: 'path', d: 'M55 75 L70 30 L100 50 L130 30 L145 75 Z', fill: P.yellow, shade: true },
		{
			k: 'path',
			d: 'M55 75 Q 100 85 145 75 L140 86 Q 100 96 60 86 Z',
			fill: P.gold,
			shade: true,
			soft: true
		},
		{ k: 'circle', o: { cx: 70, cy: 46, r: 4 }, fill: P.red },
		{ k: 'circle', o: { cx: 100, cy: 60, r: 5 }, fill: P.blue },
		{ k: 'circle', o: { cx: 130, cy: 46, r: 4 }, fill: P.green },
		{ k: 'circle', o: { cx: 85, cy: 74, r: 3 }, fill: P.teal },
		{ k: 'circle', o: { cx: 115, cy: 74, r: 3 }, fill: P.teal }
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

	// A baleen whale in profile, facing left: blunt head, horizontal flukes, a
	// pleated pale belly and a spout. The old one was a fish -- upright tail fin,
	// no flukes, no blow.
	whale: () => [
		// The blow, drawn first so it sits behind the head.
		{
			k: 'line',
			d: 'M62 66 C 54 48, 50 36, 52 24 M68 64 C 72 48, 82 38, 94 32 M64 60 C 62 48, 62 40, 64 34',
			color: P.sky,
			w: 6,
			cap: 'round'
		},
		// Flukes: two lobes either side of the peduncle, notched in the middle.
		{
			k: 'path',
			d: 'M138 108 C 156 92, 176 80, 194 76 C 184 92, 168 104, 154 112 C 168 118, 182 130, 194 148 C 174 142, 154 128, 138 118 Z',
			fill: P.navy,
			shade: true
		},
		{
			k: 'path',
			d: 'M28 116 C 28 90, 52 70, 88 70 C 122 70, 144 88, 152 110 C 146 134, 120 154, 84 154 C 50 154, 28 140, 28 116 Z',
			fill: P.blue,
			shade: true
		},
		// Pale underside, and the throat grooves every rorqual has.
		{
			k: 'path',
			d: 'M30 124 C 44 148, 96 158, 138 128 C 116 152, 56 156, 30 124 Z',
			fill: P.white,
			shade: true,
			soft: true
		},
		{
			k: 'line',
			d: 'M44 132 C 46 140, 48 145, 50 148 M58 139 C 59 146, 60 150, 61 152 M72 143 C 73 149, 74 152, 75 154 M86 145 C 87 150, 87 152, 88 154',
			color: P.blue,
			w: 2.6,
			cap: 'round'
		},
		// Mouth line, running back from the snout under the eye.
		{ k: 'line', d: 'M27 118 C 44 134, 72 140, 98 132', color: P.navy, w: 4.5, cap: 'round' },
		// Near pectoral fin, over the body.
		{
			k: 'ellipse',
			o: { cx: 88, cy: 144, rx: 28, ry: 11, rot: 24 },
			fill: P.navy,
			shade: true
		},
		...eye(48, 112, 6)
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

	// Hanging on its string, turned just enough to show both halves and the gap
	// between them. Drawn dead-on and concentric, as it was, a yo-yo is a target.
	yoyo: () => [
		{ k: 'line', d: 'M98 30 C 90 30, 90 16, 98 16 C 106 16, 106 30, 98 30 Z', color: P.tan, w: 4 },
		{ k: 'line', d: 'M98 30 C 97 46, 95 58, 94 74', color: P.tan, w: 4, cap: 'round' },
		// Far half, offset so a crescent of it shows past the near one.
		{ k: 'circle', o: { cx: 80, cy: 128, r: 54 }, fill: P.rust, shade: true },
		// The axle gap, with the wound string sitting in it.
		{ k: 'ellipse', o: { cx: 94, cy: 127, rx: 44, ry: 53, rot: 5 }, fill: P.white, shade: true },
		{ k: 'circle', o: { cx: 110, cy: 124, r: 54 }, fill: P.red, shade: true },
		// Moulded cap and axle on the near face.
		{ k: 'circle', o: { cx: 110, cy: 124, r: 19 }, fill: P.cream, shade: true, soft: true },
		{ k: 'circle', o: { cx: 110, cy: 124, r: 7 }, fill: P.rust, shade: true, soft: true }
	],

	// A zebra's head is long and tapers to a black muzzle, and its stripes are
	// broad curved bands that follow it. The old one was a white oval with seven
	// straight dashes scattered over it.
	zebra: () => [
		// Ears, behind the head so they tuck in at the base.
		{
			k: 'path',
			d: 'M70 56 C 58 38, 54 22, 62 19 C 72 16, 84 34, 86 50 Z',
			fill: P.white,
			shade: true
		},
		{
			k: 'path',
			d: 'M130 56 C 142 38, 146 22, 138 19 C 128 16, 116 34, 114 50 Z',
			fill: P.white,
			shade: true
		},
		{
			k: 'path',
			d: 'M72 52 C 65 39, 62 28, 66 26 C 72 24, 79 37, 81 48 Z',
			fill: P.pink,
			shade: true,
			soft: true
		},
		{
			k: 'path',
			d: 'M128 52 C 135 39, 138 28, 134 26 C 128 24, 121 37, 119 48 Z',
			fill: P.pink,
			shade: true,
			soft: true
		},
		// Head: wide at the brow, tapering to the muzzle.
		{
			k: 'path',
			d: 'M100 38 C 130 38, 146 60, 146 90 C 146 116, 134 140, 124 158 C 116 172, 84 172, 76 158 C 66 140, 54 116, 54 90 C 54 60, 70 38, 100 38 Z',
			fill: P.white,
			shade: true
		},
		// Mane: a spiky crest between the ears.
		{
			k: 'path',
			d: 'M78 56 L82 34 L89 52 L95 30 L101 50 L107 30 L113 52 L120 34 L124 56 C 114 46, 88 46, 78 56 Z',
			fill: P.dark,
			shade: true,
			soft: true
		},
		// Stripes: down the forehead, then curving out around the cheeks.
		{
			k: 'line',
			d: 'M87 60 C 84 72, 84 84, 87 96 M100 58 C 100 72, 100 86, 100 98 M113 60 C 116 72, 116 84, 113 96',
			color: P.dark,
			w: 7.5,
			cap: 'round'
		},
		{
			k: 'line',
			d: 'M57 74 C 66 76, 74 80, 80 86 M55 96 C 65 97, 73 100, 79 105 M60 120 C 68 121, 74 124, 79 129 M68 140 C 74 142, 78 145, 82 149',
			color: P.dark,
			w: 8,
			cap: 'round'
		},
		{
			k: 'line',
			d: 'M143 74 C 134 76, 126 80, 120 86 M145 96 C 135 97, 127 100, 121 105 M140 120 C 132 121, 126 124, 121 129 M132 140 C 126 142, 122 145, 118 149',
			color: P.dark,
			w: 8,
			cap: 'round'
		},
		// Muzzle.
		{
			k: 'ellipse',
			o: { cx: 100, cy: 150, rx: 24, ry: 16 },
			fill: P.dark,
			shade: true,
			soft: true
		},
		{ k: 'ellipse', o: { cx: 91, cy: 147, rx: 4.5, ry: 6, rot: -14 }, fill: P.slate },
		{ k: 'ellipse', o: { cx: 109, cy: 147, rx: 4.5, ry: 6, rot: 14 }, fill: P.slate },
		...eye(76, 88, 7.5),
		...eye(124, 88, 7.5)
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

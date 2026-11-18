// Kana word pictures: things1. See ./index.ts.
//
// Clothes, toys and everyday things: the apron, the outfit on its hanger, the
// sweater, the tie, glasses, a hard hat, a bow, a hand, a beach ball, balloons,
// a star and a toy robot.

import { P } from '../palette';
import type { Prim } from '../render';
import { eye } from '../parts';
import type { Subject } from '../subjects';

/** A ring, as a stroked path, so a frame can be drawn over a tinted lens. */
const ring = (cx: number, cy: number, r: number): string =>
	`M${cx - r} ${cy} a ${r} ${r} 0 1 0 ${2 * r} 0 a ${r} ${r} 0 1 0 ${-2 * r} 0`;

/** Five-pointed star outline, point up. */
const starPath = (cx: number, cy: number, R: number, r: number): string => {
	const pts: string[] = [];
	for (let i = 0; i < 10; i++) {
		const a = -Math.PI / 2 + (i * Math.PI) / 5;
		const rad = i % 2 ? r : R;
		pts.push(`${(cx + rad * Math.cos(a)).toFixed(1)} ${(cy + rad * Math.sin(a)).toFixed(1)}`);
	}
	return `M${pts.join(' L')} Z`;
};

/**
 * Beach-ball panels: lens shapes between meridians of a sphere, tilted so the
 * poles are not straight up and down. `m` are the meridians as signed
 * fractions of the radius (-1 is the left limb, 1 the right).
 */
const ballPanels = (
	cx: number,
	cy: number,
	R: number,
	tilt: number,
	m: number[],
	fills: string[]
): Prim[] => {
	const t = (tilt * Math.PI) / 180;
	const top = { x: cx + R * Math.sin(t), y: cy - R * Math.cos(t) };
	const bot = { x: cx - R * Math.sin(t), y: cy + R * Math.cos(t) };
	const f = (v: number) => v.toFixed(1);
	// An arc along meridian `a`, from p to q. Down the left limb or up the right
	// one runs anticlockwise on screen.
	const arc = (a: number, q: { x: number; y: number }, down: boolean) => {
		if (Math.abs(a) < 0.01) return `L${f(q.x)} ${f(q.y)}`;
		const sweep = down ? (a > 0 ? 1 : 0) : a > 0 ? 0 : 1;
		return `A${f(Math.abs(a) * R)} ${R} ${tilt} 0 ${sweep} ${f(q.x)} ${f(q.y)}`;
	};
	return fills.map(
		(fill, i): Prim => ({
			k: 'path',
			d: `M${f(top.x)} ${f(top.y)} ${arc(m[i], bot, true)} ${arc(m[i + 1], top, false)} Z`,
			fill,
			shade: true
		})
	);
};

export const THINGS1: Record<string, Subject> = {
	// Bib, waistband with ties, a skirt with a pocket, polka dots.
	apron: () => [
		{ k: 'line', d: 'M78 52 C 74 22, 126 22, 122 52', color: P.rust, w: 6 },
		{ k: 'line', d: 'M50 98 C 38 100, 30 112, 26 128', color: P.rust, w: 6 },
		{ k: 'line', d: 'M150 98 C 162 100, 170 112, 174 128', color: P.rust, w: 6 },
		{
			k: 'path',
			d: 'M74 48 L126 48 L128 94 C 148 98, 152 112, 152 132 L150 166 C 150 176, 144 182, 134 182 L66 182 C 56 182, 50 176, 50 166 L48 132 C 48 112, 52 98, 72 94 Z',
			fill: P.red,
			shade: true
		},
		{ k: 'rect', x: 48, y: 90, w: 104, h: 12, rx: 6, fill: P.rust, shade: true, soft: true },
		...[
			[86, 62],
			[114, 76],
			[64, 118],
			[136, 118],
			[62, 160],
			[138, 160],
			[100, 112]
		].map(([cx, cy]): Prim => ({ k: 'circle', o: { cx, cy, r: 5 }, fill: P.white })),
		{ k: 'rect', x: 76, y: 128, w: 48, h: 38, rx: 8, fill: P.white, shade: true, soft: true },
		{
			k: 'path',
			d: 'M100 158 C 88 150, 84 142, 90 138 C 94 135, 98 137, 100 141 C 102 137, 106 135, 110 138 C 116 142, 112 150, 100 158 Z',
			fill: P.red
		}
	],

	// A T-shirt on a coat hanger: the hook and the hanger's arms show above it.
	clothes: () => [
		{
			k: 'line',
			d: 'M100 56 L100 46 C 100 38, 112 38, 112 30 C 112 22, 100 20, 96 28',
			color: P.slate,
			w: 5
		},
		{ k: 'line', d: 'M100 56 L36 84 L164 84 Z', color: P.brown, w: 6 },
		{
			k: 'path',
			d: 'M82 72 C 88 84, 112 84, 118 72 L148 82 L172 116 L150 128 L142 114 L142 180 L58 180 L58 114 L50 128 L28 116 L52 82 Z',
			fill: P.blue,
			shade: true
		},
		{ k: 'path', d: 'M82 72 C 88 84, 112 84, 118 72 L112 70 C 106 78, 94 78, 88 70 Z', fill: P.navy },
		{ k: 'rect', x: 58, y: 124, w: 84, h: 12, fill: P.white, shade: true, soft: true },
		{ k: 'rect', x: 58, y: 146, w: 84, h: 12, fill: P.white, shade: true, soft: true }
	],

	// Laid flat, long sleeves down: ribbed collar, cuffs and hem, and a band of
	// knit pattern across the chest.
	sweater: () => [
		{
			k: 'path',
			d: 'M80 40 C 86 52, 114 52, 120 40 L146 48 C 160 54, 166 66, 168 80 L178 146 L154 150 L144 96 L144 162 L56 162 L56 96 L46 150 L22 146 L32 80 C 34 66, 40 54, 54 48 Z',
			fill: P.green,
			shade: true
		},
		{
			k: 'path',
			d: 'M80 40 C 86 52, 114 52, 120 40 L128 43 C 120 62, 80 62, 72 43 Z',
			fill: P.moss,
			shade: true,
			soft: true
		},
		{ k: 'rect', x: 56, y: 160, w: 88, h: 20, rx: 4, fill: P.moss, shade: true, soft: true },
		{
			k: 'path',
			d: 'M22 146 L46 150 L44 166 L19 162 Z',
			fill: P.moss,
			shade: true,
			soft: true
		},
		{
			k: 'path',
			d: 'M178 146 L154 150 L156 166 L181 162 Z',
			fill: P.moss,
			shade: true,
			soft: true
		},
		{
			k: 'line',
			d:
				Array.from({ length: 10 }, (_, i) => `M${64 + i * 8} 164 V176`).join(' ') +
				' M26 150 L24 162 M33 151 L31 163 M40 152 L38 164 M174 150 L176 162 M167 151 L169 163 M160 152 L162 164',
			color: P.green,
			w: 2.4,
			cap: 'butt'
		},
		{ k: 'rect', x: 56, y: 90, w: 88, h: 26, fill: P.cream, shade: true, soft: true },
		{
			k: 'line',
			d: 'M56 110 ' + Array.from({ length: 11 }, (_, i) => `L${60 + i * 8} ${i % 2 ? 110 : 96}`).join(' '),
			color: P.red,
			w: 4,
			cap: 'butt'
		},
		...[72, 100, 128].map((cx): Prim => ({ k: 'circle', o: { cx, cy: 134, r: 4 }, fill: P.cream })),
		...[86, 114].map((cx): Prim => ({ k: 'circle', o: { cx, cy: 76, r: 4 }, fill: P.cream }))
	],

	// A striped tie, knotted under a shirt collar.
	necktie: () => {
		const xl = (y: number) => 91 - ((y - 76) * 16) / 80;
		const xr = (y: number) => 109 + ((y - 76) * 16) / 80;
		const stripes = [94, 116, 138]
			.map((a) => `M${(xl(a) + 2).toFixed(1)} ${a} L${(xr(a - 14) - 2).toFixed(1)} ${a - 14}`)
			.join(' ');
		return [
			{
				k: 'path',
				d: 'M30 186 C 30 110, 50 70, 70 50 L130 50 C 150 70, 170 110, 170 186 Z',
				fill: P.sky,
				shade: true
			},
			{ k: 'path', d: 'M91 76 L109 76 L125 156 L100 182 L75 156 Z', fill: P.red, shade: true },
			{ k: 'line', d: stripes, color: P.yellow, w: 7, cap: 'butt' },
			{ k: 'line', d: 'M80 160 L104 146 M88 172 L118 154', color: P.yellow, w: 7, cap: 'butt' },
			{ k: 'path', d: 'M86 56 L114 56 L110 80 L90 80 Z', fill: P.red, shade: true },
			{
				k: 'path',
				d: 'M100 56 L70 34 L58 48 L80 92 Z',
				fill: P.white,
				shade: true
			},
			{
				k: 'path',
				d: 'M100 56 L130 34 L142 48 L120 92 Z',
				fill: P.white,
				shade: true
			}
		];
	},

	// Round lenses, a keyhole bridge, and the arms folding back at the hinges.
	glasses: () => [
		{ k: 'line', d: 'M34 102 L22 92 M166 102 L178 92', color: P.navy, w: 8 },
		{ k: 'circle', o: { cx: 64, cy: 110, r: 32 }, fill: P.sky, shade: true, op: 0.8 },
		{ k: 'circle', o: { cx: 136, cy: 110, r: 32 }, fill: P.sky, shade: true, op: 0.8 },
		{ k: 'line', d: 'M50 96 L64 88 M122 96 L136 88', color: P.white, w: 5 },
		{ k: 'line', d: ring(64, 110, 32), color: P.navy, w: 10 },
		{ k: 'line', d: ring(136, 110, 32), color: P.navy, w: 10 },
		{ k: 'line', d: 'M94 102 C 96 90, 104 90, 106 102', color: P.navy, w: 9 },
	],

	// A yellow construction hard hat: dome, crown ridge and brim.
	helmet: () => [
		{
			k: 'path',
			d: 'M40 138 C 40 86, 66 56, 100 56 C 134 56, 160 86, 160 138 Z',
			fill: P.yellow,
			shade: true
		},
		{
			k: 'path',
			d: 'M88 58 C 92 56, 108 56, 112 58 L114 138 L86 138 Z',
			fill: P.gold,
			shade: true,
			soft: true
		},
		{ k: 'line', d: 'M64 134 C 62 104, 68 84, 80 70', color: P.gold, w: 5 },
		{ k: 'line', d: 'M136 134 C 138 104, 132 84, 120 70', color: P.gold, w: 5 },
		{ k: 'ellipse', o: { cx: 100, cy: 142, rx: 78, ry: 14 }, fill: P.gold, shade: true }
	],

	// A big bow: two loops, a knot and two notched tails.
	ribbon: () => [
		{
			k: 'path',
			d: 'M94 104 L64 176 L76 170 L84 184 L106 108 Z',
			fill: P.rust,
			shade: true
		},
		{
			k: 'path',
			d: 'M106 104 L136 176 L124 170 L116 184 L94 108 Z',
			fill: P.rust,
			shade: true
		},
		{
			k: 'path',
			d: 'M100 96 C 82 66, 42 46, 30 72 C 22 92, 30 122, 50 126 C 70 130, 88 114, 100 96 Z',
			fill: P.red,
			shade: true
		},
		{
			k: 'path',
			d: 'M100 96 C 118 66, 158 46, 170 72 C 178 92, 170 122, 150 126 C 130 130, 112 114, 100 96 Z',
			fill: P.red,
			shade: true
		},
		{
			k: 'path',
			d: 'M96 96 C 80 80, 56 70, 48 84 C 60 82, 80 88, 96 100 Z',
			fill: P.rust,
			shade: true,
			soft: true
		},
		{
			k: 'path',
			d: 'M104 96 C 120 80, 144 70, 152 84 C 140 82, 120 88, 104 100 Z',
			fill: P.rust,
			shade: true,
			soft: true
		},
		{ k: 'rect', x: 86, y: 80, w: 28, h: 34, rx: 10, fill: P.red, shade: true },
		{ k: 'line', d: 'M92 88 C 96 94, 96 100, 92 106', color: P.rust, w: 3 }
	],

	// An open hand, palm out, fingers spread, coming up from a sleeve.
	hand: () => {
		const finger = (cx: number, cy: number, h: number, rot: number): Prim => ({
			k: 'rect',
			x: cx - 11,
			y: cy - h / 2,
			w: 22,
			h,
			rx: 11,
			rot,
			cx,
			cy,
			fill: P.sand,
			shade: true
		});
		return [
			{ k: 'rect', x: 74, y: 150, w: 52, h: 40, rx: 4, fill: P.sand, shade: true },
			finger(60, 90, 50, -26),
			finger(78, 68, 66, -10),
			finger(102, 62, 72, 2),
			finger(125, 70, 64, 14),
			finger(146, 116, 52, 44),
			{
				k: 'path',
				d: 'M64 104 C 64 92, 136 90, 138 104 L138 136 C 138 158, 122 168, 100 168 C 78 168, 62 158, 62 136 Z',
				fill: P.sand,
				shade: true
			},
			{ k: 'line', d: 'M80 128 C 94 136, 110 134, 122 124', color: P.tan, w: 3 },
			{ k: 'rect', x: 66, y: 166, w: 68, h: 24, rx: 6, fill: P.blue, shade: true }
		];
	},

	// A beach ball: coloured panels with white between, a cap at the pole.
	ball: () => [
		...ballPanels(
			100,
			104,
			72,
			-24,
			[-1, -0.97, -0.71, -0.26, 0.26, 0.71, 0.97, 1],
			[P.white, P.red, P.white, P.yellow, P.white, P.blue, P.white]
		),
		{
			k: 'circle',
			o: {
				cx: 100 + 72 * Math.sin((-24 * Math.PI) / 180) * 0.94,
				cy: 104 - 72 * Math.cos((-24 * Math.PI) / 180) * 0.94,
				r: 12
			},
			fill: P.white,
			shade: true,
			soft: true
		},
		{
			k: 'ellipse',
			o: { cx: 62, cy: 96, rx: 6, ry: 12, rot: 20 },
			fill: P.white,
			op: 0.55
		}
	],

	// Three balloons, their strings gathered at the bottom.
	balloon: () => {
		const b = (cx: number, cy: number, fill: string, knot: string): Prim[] => [
			{ k: 'ellipse', o: { cx, cy, rx: 30, ry: 36 }, fill, shade: true },
			{ k: 'path', d: `M${cx} ${cy + 34} L${cx - 6} ${cy + 44} L${cx + 6} ${cy + 44} Z`, fill: knot },
			{ k: 'ellipse', o: { cx: cx - 12, cy: cy - 16, rx: 6, ry: 10, rot: 24 }, fill: P.white, op: 0.5 }
		];
		return [
			{
				k: 'line',
				d: 'M64 114 C 70 140, 90 150, 100 184 M136 114 C 130 140, 110 150, 100 184 M100 140 C 94 156, 106 168, 100 184',
				color: P.slate,
				w: 2.6
			},
			...b(64, 70, P.blue, P.navy),
			...b(136, 70, P.yellow, P.gold),
			...b(100, 92, P.red, P.rust)
		];
	},

	// A big yellow star with a couple of sparkles.
	star: () => [
		{ k: 'path', d: starPath(100, 112, 80, 36), fill: P.yellow, shade: true },
		{ k: 'path', d: starPath(40, 44, 13, 4), fill: P.gold },
		{ k: 'path', d: starPath(162, 52, 10, 3), fill: P.gold },
		{ k: 'path', d: starPath(160, 170, 9, 3), fill: P.gold }
	],

	// A boxy tin robot: antenna, round eyes, ear bolts, a chest panel of dials.
	robot: () => [
		{ k: 'line', d: 'M100 46 V30', color: P.slate, w: 5 },
		{ k: 'circle', o: { cx: 100, cy: 27, r: 7 }, fill: P.red, shade: true },
		{ k: 'rect', x: 50, y: 124, w: 16, h: 40, rx: 8, fill: P.grey, shade: true },
		{ k: 'rect', x: 134, y: 124, w: 16, h: 40, rx: 8, fill: P.grey, shade: true },
		{ k: 'rect', x: 72, y: 168, w: 20, h: 18, rx: 4, fill: P.slate, shade: true },
		{ k: 'rect', x: 108, y: 168, w: 20, h: 18, rx: 4, fill: P.slate, shade: true },
		{ k: 'rect', x: 62, y: 112, w: 76, h: 60, rx: 8, fill: P.teal, shade: true },
		{ k: 'rect', x: 90, y: 100, w: 20, h: 14, fill: P.slate, shade: true },
		{ k: 'rect', x: 56, y: 62, w: 10, h: 22, rx: 4, fill: P.orange },
		{ k: 'rect', x: 134, y: 62, w: 10, h: 22, rx: 4, fill: P.orange },
		{ k: 'rect', x: 62, y: 44, w: 76, h: 58, rx: 10, fill: P.grey, shade: true },
		{ k: 'circle', o: { cx: 82, cy: 68, r: 11 }, fill: P.white },
		{ k: 'circle', o: { cx: 118, cy: 68, r: 11 }, fill: P.white },
		...eye(82, 68, 6),
		...eye(118, 68, 6),
		{ k: 'rect', x: 84, y: 86, w: 32, h: 8, rx: 3, fill: P.dark },
		{ k: 'line', d: 'M92 86 V94 M100 86 V94 M108 86 V94', color: P.grey, w: 2 },
		{ k: 'rect', x: 74, y: 122, w: 52, h: 38, rx: 6, fill: P.cream, shade: true, soft: true },
		{ k: 'circle', o: { cx: 89, cy: 138, r: 9 }, fill: P.yellow },
		{ k: 'line', d: 'M89 138 L94 132', color: P.dark, w: 2.6 },
		{ k: 'circle', o: { cx: 114, cy: 133, r: 4 }, fill: P.red },
		{ k: 'circle', o: { cx: 114, cy: 148, r: 4 }, fill: P.green },
		{ k: 'rect', x: 80, y: 151, w: 18, h: 4, rx: 2, fill: P.slate }
	]
};

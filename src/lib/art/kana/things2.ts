// Kana word pictures: things2. See ./index.ts.
//
// Household objects. Several of them lean on a diagonal, so they are drawn
// upright in local coordinates and turned as a whole with `turn` / `at`; a
// rect is turned by giving it the same pivot as `cx`/`cy`.

import { P } from '../palette';
import type { Prim } from '../render';
import type { Subject } from '../subjects';

const rad = (deg: number) => (deg * Math.PI) / 180;

/** Rotate one point `deg` degrees about (cx, cy), as SVG's rotate() does. */
const at = (x: number, y: number, deg: number, cx: number, cy: number): [number, number] => {
	const c = Math.cos(rad(deg));
	const s = Math.sin(rad(deg));
	const dx = x - cx;
	const dy = y - cy;
	return [+(cx + dx * c - dy * s).toFixed(1), +(cy + dx * s + dy * c).toFixed(1)];
};

/** Rotate a path of absolute M/L/C/Q/Z commands (coordinates in pairs only). */
const turn = (d: string, deg: number, cx: number, cy: number): string => {
	const toks = d.match(/[A-Za-z]|-?\d*\.?\d+/g) ?? [];
	const out: string[] = [];
	let nums: number[] = [];
	for (const t of toks) {
		if (/[A-Za-z]/.test(t)) {
			out.push(t);
			continue;
		}
		nums.push(Number(t));
		if (nums.length === 2) {
			out.push(at(nums[0], nums[1], deg, cx, cy).join(' '));
			nums = [];
		}
	}
	return out.join(' ');
};

/**
 * A hexagonal pencil from eraser end (x1, y1) to point (x2, y2), `w` wide:
 * pink eraser, metal ferrule, yellow body with a darker facet, bare wood cone
 * and a graphite tip.
 */
const pencilAt = (x1: number, y1: number, x2: number, y2: number, w: number): Prim[] => {
	const len = Math.hypot(x2 - x1, y2 - y1);
	const deg = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
	// Build it lying along +x from (x1, y1), then turn it about that end.
	const seg = (a: number, b: number, fill: string, extra: Partial<Prim> = {}): Prim =>
		({
			k: 'rect',
			x: x1 + a * len,
			y: y1 - w / 2,
			w: (b - a) * len,
			h: w,
			rot: deg,
			cx: x1,
			cy: y1,
			fill,
			...extra
		}) as Prim;
	const p = (t: number, s: number) => at(x1 + t * len, y1 + s * w, deg, x1, y1).join(' ');
	return [
		seg(0, 0.16, P.pink, { rx: w * 0.35, shade: true }),
		seg(0.12, 0.22, P.grey, { shade: true }),
		{ k: 'line', d: `M${p(0.17, -0.5)} L${p(0.17, 0.5)}`, color: P.slate, w: 2 },
		seg(0.22, 0.76, P.yellow, { shade: true }),
		{
			k: 'path',
			d: `M${p(0.22, 0.17)} L${p(0.76, 0.17)} L${p(0.76, 0.5)} L${p(0.22, 0.5)} Z`,
			fill: P.gold,
			shade: true,
			soft: true
		},
		{
			k: 'path',
			d: `M${p(0.76, -0.5)} L${p(0.94, -0.11)} L${p(0.94, 0.11)} L${p(0.76, 0.5)} Z`,
			fill: P.sand,
			shade: true
		},
		{
			k: 'path',
			d: `M${p(0.935, -0.12)} L${p(1, 0)} L${p(0.935, 0.12)} Z`,
			fill: P.dark
		}
	];
};

export const THINGS2: Record<string, Subject> = {
	// An open picture book, a picture on each page and the cover showing round
	// the edges.
	book: () => [
		{
			k: 'path',
			d: 'M22 72 C 58 58, 88 60, 100 72 C 112 60, 142 58, 178 72 L178 164 C 142 150, 112 152, 100 166 C 88 152, 58 150, 22 164 Z',
			fill: P.red,
			shade: true
		},
		{
			k: 'path',
			d: 'M30 64 C 62 50, 88 52, 100 64 L100 154 C 88 142, 62 140, 30 152 Z',
			fill: P.white,
			shade: true,
			soft: true
		},
		{
			k: 'path',
			d: 'M170 64 C 138 50, 112 52, 100 64 L100 154 C 112 142, 138 140, 170 152 Z',
			fill: P.white,
			shade: true,
			soft: true
		},
		{ k: 'line', d: 'M100 64 L100 154', color: P.tan, w: 3 },
		// Left page: sun over the sea.
		{ k: 'circle', o: { cx: 64, cy: 88, r: 14 }, fill: P.yellow },
		{
			k: 'path',
			d: 'M40 124 C 54 116, 74 114, 90 118 L90 136 C 74 132, 56 134, 40 140 Z',
			fill: P.blue
		},
		// Right page: a tree on a hill.
		{
			k: 'path',
			d: 'M110 132 C 122 116, 146 112, 160 118 L160 134 C 144 132, 124 136, 110 144 Z',
			fill: P.green
		},
		{ k: 'rect', x: 132, y: 96, w: 6, h: 24, fill: P.brown },
		{ k: 'circle', o: { cx: 135, cy: 92, r: 14 }, fill: P.moss }
	],

	// A Japanese school notebook lying flat at a slant: cloth spine tape, plain
	// cover with a label panel, the page block showing at the edge, and a
	// pencil beside it.
	notebook: () => {
		const r = { rot: -8, cx: 92, cy: 106 };
		return [
			{ k: 'rect', x: 49, y: 44, w: 100, h: 136, rx: 5, fill: P.cream, shade: true, ...r },
			{ k: 'rect', x: 44, y: 38, w: 100, h: 136, rx: 5, fill: P.teal, shade: true, ...r },
			{ k: 'rect', x: 44, y: 38, w: 18, h: 136, rx: 4, fill: P.navy, shade: true, ...r },
			{ k: 'rect', x: 74, y: 112, w: 58, h: 44, rx: 4, fill: P.white, shade: true, soft: true, ...r },
			{ k: 'rect', x: 80, y: 126, w: 46, h: 3, fill: P.grey, ...r },
			{ k: 'rect', x: 80, y: 138, w: 46, h: 3, fill: P.grey, ...r },
			{ k: 'circle', o: { cx: 103, cy: 72, r: 14 }, fill: P.yellow, shade: true, soft: true },
			...pencilAt(166, 180, 164, 54, 18)
		];
	},

	pencil: () => pencilAt(46, 166, 162, 40, 32),

	camera: () => [
		{ k: 'rect', x: 66, y: 44, w: 58, h: 30, rx: 7, fill: P.slate, shade: true },
		{ k: 'rect', x: 132, y: 50, w: 24, h: 16, rx: 4, fill: P.red },
		{ k: 'rect', x: 28, y: 62, w: 144, h: 104, rx: 16, fill: P.slate, shade: true },
		{ k: 'rect', x: 28, y: 92, w: 144, h: 50, fill: P.tan, shade: true, soft: true },
		{ k: 'rect', x: 40, y: 72, w: 26, h: 16, rx: 3, fill: P.white },
		{ k: 'circle', o: { cx: 104, cy: 114, r: 42 }, fill: P.grey, shade: true },
		{ k: 'circle', o: { cx: 104, cy: 114, r: 31 }, fill: P.dark },
		{ k: 'circle', o: { cx: 104, cy: 114, r: 20 }, fill: P.navy, shade: true },
		{ k: 'circle', o: { cx: 96, cy: 106, r: 6 }, fill: P.white, op: 0.85 }
	],

	candle: () => [
		{ k: 'circle', o: { cx: 100, cy: 54, r: 26 }, fill: P.yellow, op: 0.3 },
		// Holder: a saucer with a ring handle.
		{ k: 'line', d: 'M150 166 C 176 160, 178 184, 154 178', color: P.gold, w: 6 },
		{ k: 'ellipse', o: { cx: 100, cy: 170, rx: 58, ry: 14 }, fill: P.gold, shade: true },
		{ k: 'ellipse', o: { cx: 100, cy: 164, rx: 30, ry: 8 }, fill: P.yellow, shade: true, soft: true },
		{ k: 'rect', x: 80, y: 84, w: 40, h: 82, rx: 4, fill: P.red, shade: true },
		// Melted wax pooled over the rim and running down.
		{
			k: 'path',
			d: 'M80 84 L120 84 L120 104 C 120 110, 113 110, 113 104 L113 96 C 113 92, 106 92, 106 96 L106 98 C 106 103, 100 103, 100 98 L100 94 C 100 90, 92 90, 92 94 L92 112 C 92 118, 85 118, 85 112 L85 96 C 85 92, 80 92, 80 96 Z',
			fill: P.pink,
			shade: true,
			soft: true
		},
		{ k: 'ellipse', o: { cx: 100, cy: 84, rx: 20, ry: 5 }, fill: P.pink, shade: true, soft: true },
		{ k: 'line', d: 'M100 84 L100 72', color: P.dark, w: 3 },
		{ k: 'path', d: 'M100 32 C 112 50, 116 62, 110 70 C 106 76, 94 76, 90 70 C 84 62, 88 50, 100 32 Z', fill: P.orange },
		{ k: 'path', d: 'M100 50 C 106 60, 108 66, 104 70 C 102 72, 98 72, 96 70 C 92 66, 94 60, 100 50 Z', fill: P.yellow }
	],

	clock: () => [
		{ k: 'line', d: 'M70 168 L58 182 M130 168 L142 182', color: P.dark, w: 7 },
		{ k: 'ellipse', o: { cx: 58, cy: 56, rx: 26, ry: 20, rot: -38 }, fill: P.yellow, shade: true },
		{ k: 'ellipse', o: { cx: 142, cy: 56, rx: 26, ry: 20, rot: 38 }, fill: P.yellow, shade: true },
		{ k: 'line', d: 'M100 54 L100 40', color: P.dark, w: 5 },
		{ k: 'circle', o: { cx: 100, cy: 38, r: 6 }, fill: P.dark },
		{ k: 'circle', o: { cx: 100, cy: 116, r: 60 }, fill: P.red, shade: true },
		{ k: 'circle', o: { cx: 100, cy: 116, r: 47 }, fill: P.white, shade: true, soft: true },
		...[0, 90, 180, 270].map((deg): Prim => {
			const [x, y] = at(100, 77, deg, 100, 116);
			return { k: 'circle', o: { cx: x, cy: y, r: 4.5 }, fill: P.dark };
		}),
		{ k: 'line', d: 'M100 116 L80 98', color: P.dark, w: 7 },
		{ k: 'line', d: 'M100 116 L124 88', color: P.dark, w: 5 },
		{ k: 'circle', o: { cx: 100, cy: 116, r: 6 }, fill: P.red }
	],

	// Steel head, teal handle, tines up and to the right.
	fork: () => {
		const t = (d: string) => turn(d, 30, 100, 106);
		return [
			{
				k: 'path',
				d: t('M93 112 L107 112 L110 180 C 110 192, 90 192, 90 180 Z'),
				fill: P.teal,
				shade: true
			},
			{
				k: 'path',
				d: t('M93 120 C 92 102, 74 100, 74 86 L74 74 L126 74 L126 86 C 126 100, 108 102, 107 120 Z'),
				fill: P.grey,
				shade: true
			},
			...[0, 1, 2, 3].map(
				(i): Prim => ({
					k: 'rect',
					x: 74 + i * 14.33,
					y: 26,
					w: 9,
					h: 56,
					rx: 4.5,
					rot: 30,
					cx: 100,
					cy: 106,
					fill: P.grey,
					shade: true
				})
			)
		];
	},

	// Steel bowl, red handle, leaning the other way to the fork.
	spoon: () => {
		const t = (d: string) => turn(d, -32, 100, 106);
		const [hx, hy] = at(100, 64, -32, 100, 106);
		const [ix, iy] = at(100, 62, -32, 100, 106);
		return [
			{
				k: 'path',
				d: t('M95 96 L105 96 L110 178 C 110 192, 90 192, 90 178 Z'),
				fill: P.red,
				shade: true
			},
			{ k: 'ellipse', o: { cx: hx, cy: hy, rx: 30, ry: 40, rot: -32 }, fill: P.grey, shade: true },
			{
				k: 'ellipse',
				o: { cx: ix, cy: iy, rx: 21, ry: 30, rot: -32 },
				fill: P.slate,
				shade: true,
				soft: true
			},
			{
				k: 'ellipse',
				o: { cx: ix - 6, cy: iy - 8, rx: 5, ry: 10, rot: -32 },
				fill: P.white,
				op: 0.8
			}
		];
	},

	// Round mesh head up and to the left, handle down to the right.
	microphone: () => {
		const deg = -38;
		const C = [100, 108] as const;
		const t = (d: string) => turn(d, deg, C[0], C[1]);
		const [hx, hy] = at(100, 60, deg, C[0], C[1]);
		const R = 38;
		const mesh = [-24, -12, 0, 12, 24]
			.map((o) => {
				const h = Math.sqrt(R * R - o * o) - 3;
				return (
					`M${100 - h} ${60 + o} L${100 + h} ${60 + o} ` + `M${100 + o} ${60 - h} L${100 + o} ${60 + h}`
				);
			})
			.join(' ');
		return [
			{
				k: 'path',
				d: t('M84 100 L116 100 L108 184 C 108 192, 92 192, 92 184 Z'),
				fill: P.dark,
				shade: true
			},
			{ k: 'rect', x: 95, y: 128, w: 10, h: 18, rx: 3, rot: deg, cx: C[0], cy: C[1], fill: P.red },
			{ k: 'circle', o: { cx: hx, cy: hy, r: R }, fill: P.grey, shade: true },
			{ k: 'line', d: t(mesh), color: P.slate, w: 2.5 },
			{ k: 'rect', x: 80, y: 92, w: 40, h: 14, rx: 4, rot: deg, cx: C[0], cy: C[1], fill: P.navy, shade: true }
		];
	},

	// An old set on legs with rabbit-ear aerials; sun and hills on the screen.
	television: () => [
		{ k: 'line', d: 'M100 66 L66 28 M100 66 L136 26', color: P.slate, w: 4 },
		{ k: 'circle', o: { cx: 66, cy: 28, r: 5 }, fill: P.slate },
		{ k: 'circle', o: { cx: 136, cy: 26, r: 5 }, fill: P.slate },
		{ k: 'line', d: 'M52 168 L46 182 M148 168 L154 182', color: P.brown, w: 7 },
		{ k: 'rect', x: 26, y: 62, w: 148, h: 110, rx: 16, fill: P.orange, shade: true },
		{ k: 'rect', x: 40, y: 76, w: 98, h: 82, rx: 12, fill: P.sky, shade: true, soft: true },
		{ k: 'circle', o: { cx: 66, cy: 100, r: 11 }, fill: P.yellow },
		{
			k: 'path',
			d: 'M40 136 C 60 118, 86 116, 104 132 C 114 124, 128 120, 138 124 L138 146 C 138 153, 133 158, 126 158 L52 158 C 45 158, 40 153, 40 146 Z',
			fill: P.green
		},
		{ k: 'circle', o: { cx: 156, cy: 96, r: 8 }, fill: P.brown, shade: true },
		{ k: 'circle', o: { cx: 156, cy: 120, r: 8 }, fill: P.brown, shade: true },
		{ k: 'line', d: 'M150 140 L162 140 M150 148 L162 148', color: P.brown, w: 3 }
	],

	// A toy bugle, side on: mouthpiece left, one loop of tubing, bell flaring
	// right.
	trumpet: () => [
		{
			k: 'line',
			d: 'M66 102 C 44 102, 44 140, 66 140 L120 140 C 140 140, 140 102, 120 102',
			color: P.gold,
			w: 10
		},
		{ k: 'line', d: 'M40 102 L124 102', color: P.yellow, w: 12, cap: 'butt' },
		{ k: 'rect', x: 22, y: 94, w: 18, h: 16, rx: 5, fill: P.gold, shade: true },
		{
			k: 'path',
			d: 'M118 95 C 140 93, 158 80, 168 52 L168 152 C 158 124, 140 111, 118 109 Z',
			fill: P.yellow,
			shade: true
		},
		{ k: 'ellipse', o: { cx: 168, cy: 102, rx: 11, ry: 50 }, fill: P.gold, shade: true },
		{ k: 'ellipse', o: { cx: 170, cy: 102, rx: 6, ry: 40 }, fill: P.brown, shade: true, soft: true },
		...[72, 88, 104].map((x): Prim => ({ k: 'rect', x, y: 74, w: 10, h: 24, rx: 2, fill: P.gold, shade: true })),
		...[72, 88, 104].map((x): Prim => ({ k: 'circle', o: { cx: x + 5, cy: 72, r: 6.5 }, fill: P.yellow })),
		// A red cord with a tassel, as toy bugles have.
		{ k: 'line', d: 'M62 108 C 70 130, 92 150, 110 146', color: P.red, w: 4 },
		{ k: 'circle', o: { cx: 110, cy: 146, r: 5 }, fill: P.red },
		{ k: 'path', d: 'M107 148 L113 148 L120 172 C 114 176, 106 176, 100 172 Z', fill: P.red }
	],

	// Small and round, tilted, with four strings and no bow -- not the violin.
	ukulele: () => {
		const deg = 34;
		const C = [100, 104] as const;
		const R = { rot: deg, cx: C[0], cy: C[1] };
		const c = (x: number, y: number) => {
			const [cx, cy] = at(x, y, deg, C[0], C[1]);
			return { cx, cy };
		};
		const strings = [94, 98, 102, 106].map((x) => `M${x} 40 L${x} 160`).join(' ');
		return [
			{ k: 'rect', x: 92, y: 38, w: 16, h: 70, rx: 3, fill: P.brown, shade: true, ...R },
			{ k: 'rect', x: 86, y: 18, w: 28, h: 26, rx: 6, fill: P.brown, shade: true, ...R },
			...[24, 36].flatMap((y): Prim[] => [
				{ k: 'circle', o: { ...c(82, y), r: 4.5 }, fill: P.cream },
				{ k: 'circle', o: { ...c(118, y), r: 4.5 }, fill: P.cream }
			]),
			{ k: 'circle', o: { ...c(100, 140), r: 42 }, fill: P.orange, shade: true },
			{ k: 'circle', o: { ...c(100, 98), r: 31 }, fill: P.orange, shade: true },
			{ k: 'circle', o: { ...c(100, 116), r: 13 }, fill: P.dark },
			{ k: 'rect', x: 82, y: 154, w: 36, h: 9, rx: 3, fill: P.brown, ...R },
			{ k: 'line', d: turn(strings, deg, C[0], C[1]), color: P.cream, w: 1.6 }
		];
	}
};

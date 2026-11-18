// Kana word pictures: nature. See ./index.ts.

import { P } from '../palette';
import { eye } from '../parts';
import type { Prim } from '../render';
import type { Subject } from '../subjects';

type Pt = [number, number];

/**
 * Apply `f` to every coordinate pair of a path written with absolute M, L, C,
 * Q and Z only -- enough to mirror a wing or tilt a fruit without redrawing it.
 */
const xf = (d: string, f: (p: Pt) => Pt): string => {
	const nums = d.match(/-?\d*\.?\d+/g)!.map(Number);
	const cmds = d.match(/[MLCQZ]/g)!;
	const arity: Record<string, number> = { M: 1, L: 1, C: 3, Q: 2, Z: 0 };
	let i = 0;
	return cmds
		.map((c) => {
			const pts: string[] = [];
			for (let n = 0; n < arity[c]; n++) {
				const [x, y] = f([nums[i++], nums[i++]]);
				pts.push(`${x.toFixed(1)} ${y.toFixed(1)}`);
			}
			return c + pts.join(' ');
		})
		.join(' ');
};

const rot =
	(deg: number, cx: number, cy: number) =>
	([x, y]: Pt): Pt => {
		const a = (deg * Math.PI) / 180;
		const dx = x - cx;
		const dy = y - cy;
		return [cx + dx * Math.cos(a) - dy * Math.sin(a), cy + dx * Math.sin(a) + dy * Math.cos(a)];
	};

const mirror = ([x, y]: Pt): Pt => [200 - x, y];

/** The same path and its mirror image about x = 100. */
const pair = (d: string): string[] => [d, xf(d, mirror)];

/** A point-ish dot, for seeds and specks: a zero-length round-capped stroke. */
const dots = (pts: Pt[]): string => pts.map(([x, y]) => `M${x} ${y} L${x + 0.4} ${y}`).join(' ');

/** A five-pointed star centred on (cx, cy). */
const star = (cx: number, cy: number, r: number, inner = 0.45, squash = 1): string =>
	Array.from({ length: 10 }, (_, i) => {
		const a = -Math.PI / 2 + (i * Math.PI) / 5;
		const rr = i % 2 ? r * inner : r;
		return `${i ? 'L' : 'M'}${(cx + rr * Math.cos(a)).toFixed(1)} ${(cy + rr * Math.sin(a) * squash).toFixed(1)}`;
	}).join(' ') + ' Z';

export const NATURE: Record<string, Subject> = {
	// A ladybird from above: the archetypal friendly bug.
	bug: () => [
		{
			k: 'line',
			d: 'M52 96 L30 84 M46 124 L24 126 M54 152 L34 168 M148 96 L170 84 M154 124 L176 126 M146 152 L166 168',
			color: P.dark,
			w: 7
		},
		{
			k: 'line',
			d: 'M88 46 C 82 32, 74 28, 66 30 M112 46 C 118 32, 126 28, 134 30',
			color: P.dark,
			w: 5
		},
		{ k: 'circle', o: { cx: 64, cy: 30, r: 6 }, fill: P.dark },
		{ k: 'circle', o: { cx: 136, cy: 30, r: 6 }, fill: P.dark },
		{ k: 'circle', o: { cx: 100, cy: 122, r: 60 }, fill: P.red, shade: true },
		{ k: 'line', d: 'M100 80 L100 180', color: P.dark, w: 5 },
		{
			k: 'line',
			d: dots([
				[72, 108],
				[128, 108],
				[66, 146],
				[134, 146],
				[86, 168],
				[114, 168]
			]),
			color: P.dark,
			w: 20
		},
		{ k: 'ellipse', o: { cx: 100, cy: 72, rx: 36, ry: 28 }, fill: P.dark, shade: true },
		{ k: 'circle', o: { cx: 86, cy: 68, r: 9 }, fill: P.white },
		{ k: 'circle', o: { cx: 114, cy: 68, r: 9 }, fill: P.white },
		...eye(87, 69, 5.5),
		...eye(113, 69, 5.5),
		{ k: 'line', d: 'M90 84 Q 100 92, 110 84', color: P.white, w: 3.4 }
	],

	butterfly: () => [
		{
			k: 'line',
			d: 'M96 70 C 90 50, 80 40, 70 36 M104 70 C 110 50, 120 40, 130 36',
			color: P.dark,
			w: 4
		},
		{ k: 'circle', o: { cx: 68, cy: 35, r: 5.5 }, fill: P.dark },
		{ k: 'circle', o: { cx: 132, cy: 35, r: 5.5 }, fill: P.dark },
		...pair('M98 104 C 86 64, 56 40, 36 50 C 18 60, 26 98, 48 110 C 64 118, 84 114, 98 104 Z').map(
			(d): Prim => ({ k: 'path', d, fill: P.orange, shade: true })
		),
		...pair(
			'M98 110 C 74 112, 46 122, 46 148 C 46 172, 76 176, 90 156 C 98 144, 100 126, 98 110 Z'
		).map((d): Prim => ({ k: 'path', d, fill: P.purple, shade: true })),
		{ k: 'circle', o: { cx: 54, cy: 76, r: 12 }, fill: P.yellow, shade: true, soft: true },
		{ k: 'circle', o: { cx: 146, cy: 76, r: 12 }, fill: P.yellow, shade: true, soft: true },
		{ k: 'circle', o: { cx: 68, cy: 148, r: 9 }, fill: P.pink, shade: true, soft: true },
		{ k: 'circle', o: { cx: 132, cy: 148, r: 9 }, fill: P.pink, shade: true, soft: true },
		{ k: 'ellipse', o: { cx: 100, cy: 116, rx: 9, ry: 46 }, fill: P.dark, shade: true },
		{ k: 'circle', o: { cx: 100, cy: 72, r: 11 }, fill: P.dark, shade: true }
	],

	caterpillar: () => {
		const segs: [number, number, string][] = [
			[44, 140, P.green],
			[72, 128, P.moss],
			[100, 136, P.green],
			[127, 124, P.moss]
		];
		const r = 23;
		const hairs = segs
			.map(([x, y]) =>
				[-50, -90, -130]
					.map((a) => {
						const t = (a * Math.PI) / 180;
						const p = (k: number) =>
							`${(x + Math.cos(t) * r * k).toFixed(1)} ${(y + Math.sin(t) * r * k).toFixed(1)}`;
						return `M${p(0.9)} L${p(1.4)}`;
					})
					.join(' ')
			)
			.join(' ');
		return [
			{
				k: 'line',
				d:
					dots(segs.map(([x, y]) => [x - 6, y + r + 2])) +
					' ' +
					dots(segs.map(([x, y]) => [x + 8, y + r + 1])),
				color: P.dark,
				w: 9
			},
			{ k: 'line', d: hairs, color: P.moss, w: 3.4 },
			...segs.map(([cx, cy, fill]): Prim => ({ k: 'circle', o: { cx, cy, r }, fill, shade: true })),
			{
				k: 'line',
				d: 'M142 78 C 138 62, 132 56, 124 54 M162 76 C 166 60, 172 54, 178 52',
				color: P.dark,
				w: 4
			},
			{ k: 'circle', o: { cx: 123, cy: 54, r: 5 }, fill: P.dark },
			{ k: 'circle', o: { cx: 176, cy: 52, r: 5 }, fill: P.dark },
			{ k: 'circle', o: { cx: 150, cy: 102, r: 29 }, fill: P.green, shade: true },
			...eye(140, 96, 5.5),
			...eye(162, 96, 5.5),
			{ k: 'circle', o: { cx: 134, cy: 110, r: 5 }, fill: P.pink, op: 0.8 },
			{ k: 'circle', o: { cx: 168, cy: 110, r: 5 }, fill: P.pink, op: 0.8 },
			{ k: 'line', d: 'M142 110 Q 151 119, 160 110', color: P.dark, w: 3.4 }
		];
	},

	// A cicada clinging to a trunk, head up, its clear wings folded like a roof
	// over the body -- broad and blunt, so it does not read as a fly or a bee.
	cicada: () => [
		// The trunk runs off the top and bottom of the backdrop disc, so its ends
		// are arcs of that disc rather than a box.
		{
			k: 'path',
			d: 'M52 9.8 A 104 104 0 0 1 148 9.8 L 148 194.2 A 104 104 0 0 1 52 194.2 Z',
			fill: P.brown,
			shade: true
		},
		{
			k: 'line',
			d: 'M62 20 C 58 70, 64 100, 60 186 M140 22 C 144 80, 136 120, 140 188 M120 162 C 118 172, 122 180, 120 192',
			color: P.dark,
			w: 3
		},
		{
			k: 'line',
			d: 'M84 96 L60 86 M82 114 L56 120 M86 132 L64 148 M116 96 L140 86 M118 114 L144 120 M114 132 L136 148',
			color: P.dark,
			w: 5
		},
		{ k: 'ellipse', o: { cx: 100, cy: 128, rx: 26, ry: 44 }, fill: P.slate, shade: true },
		...pair(
			'M100 88 C 76 92, 58 124, 60 156 C 60 174, 70 184, 80 180 C 92 170, 98 132, 100 88 Z'
		).map((d): Prim => ({ k: 'path', d, fill: P.sky, op: 0.8, shade: true })),
		{
			k: 'line',
			d: [
				'M98 92 C 80 110, 66 140, 66 172',
				'M98 104 C 90 130, 84 156, 80 178',
				'M70 128 C 78 132, 86 134, 95 134',
				'M66 154 C 74 156, 82 158, 88 158'
			]
				.flatMap(pair)
				.join(' '),
			color: P.dark,
			w: 2.6
		},
		{ k: 'ellipse', o: { cx: 100, cy: 80, rx: 30, ry: 17 }, fill: P.dark, shade: true },
		{ k: 'path', d: 'M86 76 L100 88 L114 76 Z', fill: P.teal },
		{ k: 'ellipse', o: { cx: 100, cy: 58, rx: 32, ry: 14 }, fill: P.dark, shade: true },
		{ k: 'circle', o: { cx: 68, cy: 56, r: 10 }, fill: P.tan, shade: true },
		{ k: 'circle', o: { cx: 132, cy: 56, r: 10 }, fill: P.tan, shade: true },
		...eye(69, 56, 5),
		...eye(131, 56, 5)
	],

	sunflower: () => {
		const c: Pt = [100, 86];
		const petals = Array.from({ length: 14 }, (_, i): Prim => {
			const a = (i * 360) / 14;
			const [cx, cy] = rot(a, c[0], c[1])([c[0], c[1] - 43]);
			return {
				k: 'ellipse',
				o: { cx, cy, rx: 13, ry: 21, rot: a },
				fill: i % 2 ? P.gold : P.yellow,
				shade: true
			};
		});
		return [
			{ k: 'line', d: 'M100 120 C 98 150, 104 168, 100 186', color: P.moss, w: 11 },
			{ k: 'ellipse', o: { cx: 70, cy: 160, rx: 28, ry: 12, rot: 24 }, fill: P.green, shade: true },
			{
				k: 'ellipse',
				o: { cx: 130, cy: 150, rx: 28, ry: 12, rot: -24 },
				fill: P.green,
				shade: true
			},
			...petals.filter((_, i) => i % 2),
			...petals.filter((_, i) => !(i % 2)),
			{ k: 'circle', o: { cx: 100, cy: 86, r: 32 }, fill: P.brown, shade: true },
			{
				k: 'line',
				d: dots([
					[100, 86],
					[88, 80],
					[112, 80],
					[90, 96],
					[110, 96],
					[100, 70],
					[100, 102],
					[80, 90],
					[120, 90],
					[86, 68],
					[114, 68],
					[100, 108]
				]),
				color: P.dark,
				w: 5
			}
		];
	},

	// Tiers, star and baubles: deliberately unlike the plain round `tree`.
	'christmas tree': () => [
		{ k: 'rect', x: 89, y: 154, w: 22, h: 30, rx: 4, fill: P.brown, shade: true },
		{ k: 'path', d: 'M100 86 L164 162 L36 162 Z', fill: P.moss, shade: true },
		{ k: 'path', d: 'M100 64 L148 124 L52 124 Z', fill: P.green, shade: true },
		{ k: 'path', d: 'M100 44 L132 90 L68 90 Z', fill: P.green, shade: true },
		{
			k: 'line',
			d: 'M78 112 Q 100 120, 128 104 M60 150 Q 100 158, 146 138',
			color: P.yellow,
			w: 3.4
		},
		{ k: 'circle', o: { cx: 92, cy: 78, r: 6.5 }, fill: P.red, shade: true },
		{ k: 'circle', o: { cx: 116, cy: 100, r: 6.5 }, fill: P.blue, shade: true },
		{ k: 'circle', o: { cx: 76, cy: 114, r: 6.5 }, fill: P.yellow, shade: true },
		{ k: 'circle', o: { cx: 100, cy: 132, r: 7 }, fill: P.red, shade: true },
		{ k: 'circle', o: { cx: 134, cy: 150, r: 7 }, fill: P.yellow, shade: true },
		{ k: 'circle', o: { cx: 68, cy: 148, r: 7 }, fill: P.blue, shade: true },
		{ k: 'circle', o: { cx: 122, cy: 124, r: 6 }, fill: P.pink, shade: true },
		{ k: 'path', d: star(100, 40, 17), fill: P.yellow, shade: true }
	],

	banana: () => {
		const one =
			'M64 54 C 58 110, 92 166, 166 150 C 172 148, 172 140, 164 140 C 112 142, 82 108, 80 56 Z';
		// Each banana is the same one, shrunk a touch and swung about the stalk.
		const swing =
			(deg: number) =>
			([x, y]: Pt): Pt =>
				rot(deg, 64, 58)([64 + (x - 72) * 0.86, 58 + (y - 50) * 0.86]);
		const tip = (deg: number): Prim => {
			const [cx, cy] = swing(deg)([165, 145]);
			return { k: 'circle', o: { cx, cy, r: 4.5 }, fill: P.brown };
		};
		return [
			{ k: 'path', d: xf(one, swing(-20)), fill: P.gold, shade: true },
			tip(-20),
			{ k: 'path', d: xf(one, swing(-4)), fill: P.yellow, shade: true },
			tip(-4),
			{ k: 'path', d: xf(one, swing(12)), fill: P.yellow, shade: true },
			tip(12),
			{ k: 'line', d: xf('M72 74 C 78 118, 106 140, 150 144', swing(12)), color: P.gold, w: 3 },
			{ k: 'rect', x: 55, y: 40, w: 18, h: 24, rx: 4, fill: P.moss, shade: true }
		];
	},

	// An open edamame pod with three plump beans, and two that have escaped.
	// The beans get a wash of yellow so they stand out bright against the pod.
	beans: () => {
		const tilt = (d: string) => xf(d, rot(-24, 100, 96));
		const bean = (cx: number, cy: number, rx: number, ry: number, rot: number): Prim[] => [
			{ k: 'ellipse', o: { cx, cy, rx, ry, rot }, fill: P.green, shade: true, soft: true },
			{ k: 'ellipse', o: { cx, cy, rx, ry, rot }, fill: P.yellow, op: 0.3 },
			{
				k: 'circle',
				o: { cx: cx - rx * 0.35, cy: cy - ry * 0.4, r: rx * 0.2 },
				fill: P.white,
				op: 0.75
			}
		];
		const inPod = (
			[
				[64, 92],
				[100, 90],
				[136, 92]
			] as Pt[]
		).map(rot(-24, 100, 96));
		return [
			{
				k: 'path',
				d: tilt('M22 96 C 30 62, 170 58, 180 92 C 174 130, 30 136, 22 96 Z'),
				fill: P.moss,
				shade: true
			},
			{ k: 'line', d: tilt('M180 92 L188 82'), color: P.moss, w: 7 },
			{
				k: 'path',
				d: tilt('M34 96 C 46 74, 154 70, 170 90 C 154 102, 48 106, 34 96 Z'),
				fill: P.dark,
				op: 0.7
			},
			...inPod.flatMap(([cx, cy]) => bean(cx, cy, 21, 19, -24)),
			{
				k: 'path',
				d: tilt('M24 102 C 60 116, 140 114, 178 98 C 166 128, 40 134, 24 102 Z'),
				fill: P.moss,
				shade: true
			},
			...bean(108, 160, 17, 15, 20),
			...bean(144, 148, 16, 14, -10)
		];
	},

	carrot: () => [
		{ k: 'ellipse', o: { cx: 84, cy: 46, rx: 9, ry: 24, rot: -26 }, fill: P.moss, shade: true },
		{ k: 'ellipse', o: { cx: 116, cy: 46, rx: 9, ry: 24, rot: 26 }, fill: P.moss, shade: true },
		{ k: 'ellipse', o: { cx: 100, cy: 40, rx: 10, ry: 28 }, fill: P.green, shade: true },
		{
			k: 'path',
			d: 'M62 74 C 62 58, 138 58, 138 74 C 136 112, 110 166, 100 184 C 90 166, 64 112, 62 74 Z',
			fill: P.orange,
			shade: true
		},
		{
			k: 'line',
			d: 'M74 98 L88 98 M114 116 L126 116 M84 136 L96 136 M108 154 L114 154',
			color: P.rust,
			w: 3.4
		}
	],

	// A Japanese nasu: slim teardrop, with the spiky green cap.
	eggplant: () => {
		const tilt = (d: string) => xf(d, rot(28, 100, 112));
		const [cx, cy] = rot(28, 100, 112)([84, 120]);
		return [
			{
				k: 'path',
				d: tilt(
					'M100 58 C 122 58, 134 84, 136 122 C 138 160, 122 184, 100 184 C 78 184, 62 160, 64 122 C 66 84, 78 58, 100 58 Z'
				),
				fill: P.purple,
				shade: true
			},
			{ k: 'ellipse', o: { cx, cy, rx: 7, ry: 30, rot: 28 }, fill: P.white, op: 0.28 },
			{ k: 'line', d: tilt('M100 60 L100 30'), color: P.moss, w: 11 },
			{
				k: 'path',
				d: tilt('M70 74 C 76 52, 124 52, 130 74 L 120 92 L 112 74 L 100 98 L 88 74 L 80 92 Z'),
				fill: P.moss,
				shade: true
			}
		];
	},

	// Pointed at both ends and yellow, so it never reads as the round orange.
	lemon: () => {
		const tilt = (d: string) => xf(d, rot(-18, 100, 116));
		return [
			{ k: 'line', d: tilt('M168 112 C 172 100, 170 90, 164 84'), color: P.brown, w: 6 },
			{
				k: 'ellipse',
				o: { cx: 140, cy: 58, rx: 26, ry: 12, rot: -38 },
				fill: P.green,
				shade: true
			},
			{ k: 'line', d: 'M120 74 L 158 44', color: P.moss, w: 2.6 },
			{
				k: 'path',
				d: tilt(
					'M24 116 Q 30 106, 40 106 C 56 64, 144 64, 160 106 Q 170 106, 176 116 Q 170 126, 160 126 C 144 168, 56 168, 40 126 Q 30 126, 24 116 Z'
				),
				fill: P.yellow,
				shade: true
			},
			{
				k: 'line',
				d: dots(
					(
						[
							[70, 104],
							[86, 96],
							[60, 120],
							[118, 132],
							[134, 120],
							[104, 140]
						] as Pt[]
					).map(rot(-18, 100, 116))
				),
				color: P.gold,
				w: 4
			}
		];
	},

	// A Japanese muskmelon: netted rind and the T-shaped stem.
	melon: () => {
		const C: Pt = [100, 118];
		const R = 64;
		// Points on the visible hemisphere, laid out by latitude and longitude and
		// nudged a little so the net looks grown rather than ruled.
		const P3 = (lat: number, lon: number): Pt => {
			const j = 0.1 * Math.sin(lat * 7.1 + lon * 3.3);
			const la = lat + j;
			const lo = lon + 0.12 * Math.cos(lat * 4.3 - lon * 5.9);
			return [C[0] + R * 0.93 * Math.cos(la) * Math.sin(lo), C[1] - R * 0.93 * Math.sin(la)];
		};
		const lats = [-1.2, -0.9, -0.6, -0.3, 0, 0.3, 0.6, 0.9, 1.2];
		const lons = [-1.35, -1.0, -0.66, -0.33, 0, 0.33, 0.66, 1.0, 1.35];
		const f = ([x, y]: Pt) => `${x.toFixed(1)} ${y.toFixed(1)}`;
		const net: string[] = [];
		for (const la of lats) net.push('M' + lons.map((lo) => f(P3(la, lo))).join(' L'));
		for (const lo of lons) net.push('M' + lats.map((la) => f(P3(la, lo))).join(' L'));
		return [
			{ k: 'circle', o: { cx: C[0], cy: C[1], r: R }, fill: P.green, shade: true },
			{ k: 'line', d: net.join(' '), color: P.cream, w: 2 },
			{ k: 'line', d: 'M100 58 L100 40 M84 36 L116 36', color: P.moss, w: 8, cap: 'round' }
		];
	},

	peach: () => [
		{ k: 'line', d: 'M100 62 L102 46', color: P.brown, w: 7 },
		{ k: 'ellipse', o: { cx: 78, cy: 46, rx: 24, ry: 11, rot: 20 }, fill: P.green, shade: true },
		{ k: 'ellipse', o: { cx: 126, cy: 44, rx: 26, ry: 12, rot: -24 }, fill: P.moss, shade: true },
		{
			k: 'path',
			d: 'M104 56 C 132 54, 162 82, 162 122 C 162 160, 134 184, 100 184 C 66 184, 38 160, 38 122 C 38 84, 70 60, 100 66 C 100 62, 102 58, 104 56 Z',
			fill: P.pink,
			shade: true
		},
		{ k: 'line', d: 'M102 66 C 84 92, 82 140, 98 180', color: P.rust, w: 3.4 }
	],

	// Wide and squat with a star-shaped green cap: not the apple's heart shape.
	tomato: () => [
		{
			k: 'path',
			d: 'M100 70 C 120 60, 168 66, 170 112 C 172 156, 138 178, 100 178 C 62 178, 28 156, 30 112 C 32 66, 80 60, 100 70 Z',
			fill: P.red,
			shade: true
		},
		{ k: 'ellipse', o: { cx: 66, cy: 104, rx: 9, ry: 16, rot: 20 }, fill: P.white, op: 0.35 },
		{ k: 'path', d: star(100, 72, 34, 0.32, 0.5), fill: P.green, shade: true },
		{ k: 'line', d: 'M100 72 C 100 60, 104 52, 110 48', color: P.moss, w: 7 }
	],

	// A whole striped melon with a red slice leaning in front of it.
	watermelon: () => {
		const stripes = [-44, -22, 0, 22, 44]
			.map((dx) => {
				const top = 84 - 52 * Math.sqrt(1 - (dx / 64) ** 2) + 6;
				const x = 100 + dx;
				const w = dx * 0.25;
				return `M${x} ${top.toFixed(1)} C ${x + w - 7} ${top + 22}, ${x + w + 7} ${top + 44}, ${x + w} 118`;
			})
			.join(' ');
		return [
			{ k: 'ellipse', o: { cx: 100, cy: 84, rx: 64, ry: 52 }, fill: P.green, shade: true },
			{ k: 'line', d: stripes, color: P.moss, w: 8 },
			{
				k: 'path',
				d: 'M28 116 L172 116 C 172 160, 140 186, 100 186 C 60 186, 28 160, 28 116 Z',
				fill: P.moss,
				shade: true
			},
			{
				k: 'path',
				d: 'M34 116 L166 116 C 166 154, 136 178, 100 178 C 64 178, 34 154, 34 116 Z',
				fill: P.cream
			},
			{
				k: 'path',
				d: 'M40 116 L160 116 C 160 148, 134 170, 100 170 C 66 170, 40 148, 40 116 Z',
				fill: P.red,
				shade: true
			},
			{
				k: 'line',
				d: dots([
					[66, 130],
					[86, 140],
					[100, 128],
					[114, 140],
					[134, 130],
					[78, 154],
					[100, 156],
					[122, 154]
				]),
				color: P.dark,
				w: 6.5
			}
		];
	}
};

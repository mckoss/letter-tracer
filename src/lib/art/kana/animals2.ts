// Kana word pictures: animals2. See ./index.ts.

import { P } from '../palette';
import { eye } from '../parts';
import type { Prim } from '../render';
import type { Subject } from '../subjects';

type Pt = [number, number];

/**
 * A filled band of tapering width along one cubic Bézier: a tail, a tentacle,
 * a snake's neck. Drawn as a path rather than a stroked line so it can take
 * part in the shading like any other body mass. Both ends are rounded.
 */
const tube = (a: Pt, b: Pt, c: Pt, d: Pt, w0: number, w1: number, n = 24): string => {
	const at = (t: number): Pt => {
		const u = 1 - t;
		return [
			u * u * u * a[0] + 3 * u * u * t * b[0] + 3 * u * t * t * c[0] + t * t * t * d[0],
			u * u * u * a[1] + 3 * u * u * t * b[1] + 3 * u * t * t * c[1] + t * t * t * d[1]
		];
	};
	const left: Pt[] = [];
	const right: Pt[] = [];
	for (let i = 0; i <= n; i++) {
		const t = i / n;
		const p = at(t);
		const q = at(Math.min(1, t + 0.01));
		const r = at(Math.max(0, t - 0.01));
		const dx = q[0] - r[0];
		const dy = q[1] - r[1];
		const len = Math.hypot(dx, dy) || 1;
		const h = (w0 + (w1 - w0) * t) / 2;
		left.push([p[0] - (dy / len) * h, p[1] + (dx / len) * h]);
		right.push([p[0] + (dy / len) * h, p[1] - (dx / len) * h]);
	}
	const f = (p: Pt) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`;
	const r0 = (w0 / 2).toFixed(1);
	const r1 = (w1 / 2).toFixed(1);
	return (
		`M${f(left[0])} ` +
		left
			.slice(1)
			.map((p) => `L${f(p)}`)
			.join(' ') +
		` A${r1} ${r1} 0 0 0 ${f(right[n])} ` +
		right
			.slice(0, n)
			.reverse()
			.map((p) => `L${f(p)}`)
			.join(' ') +
		` A${r0} ${r0} 0 0 0 ${f(left[0])} Z`
	);
};

/** Shift absolute coordinates in an SVG path string; relative ones move with them. */
const shiftPath = (d: string, dx: number, dy: number): string => {
	let cmd = '';
	let i = 0;
	return d.replace(/[A-Za-z]|-?\d*\.?\d+/g, (tok) => {
		if (/[A-Za-z]/.test(tok)) {
			cmd = tok;
			i = 0;
			return tok;
		}
		const n = Number(tok);
		const k = i++;
		if (cmd !== cmd.toUpperCase() || cmd === 'Z') return tok;
		const axis =
			cmd === 'H'
				? 0
				: cmd === 'V'
					? 1
					: cmd === 'A'
						? k % 7 === 5
							? 0
							: k % 7 === 6
								? 1
								: -1
						: k % 2;
		return axis === 0 ? String(n + dx) : axis === 1 ? String(n + dy) : tok;
	});
};

/** Move a whole picture, to centre it on the backdrop. */
const nudge = (dx: number, dy: number, prims: Prim[]): Prim[] =>
	prims.map((p): Prim => {
		switch (p.k) {
			case 'path':
				return { ...p, d: shiftPath(p.d, dx, dy) };
			case 'line':
				return { ...p, d: shiftPath(p.d, dx, dy) };
			case 'ellipse':
				return { ...p, o: { ...p.o, cx: p.o.cx + dx, cy: p.o.cy + dy } };
			case 'circle':
				return { ...p, o: { ...p.o, cx: p.o.cx + dx, cy: p.o.cy + dy } };
			case 'rect':
				return {
					...p,
					x: p.x + dx,
					y: p.y + dy,
					cx: p.cx === undefined ? undefined : p.cx + dx,
					cy: p.cy === undefined ? undefined : p.cy + dy
				};
		}
	});

export const ANIMALS2: Record<string, Subject> = {
	// Side view, facing left, mouth open in a grin.
	crocodile: () =>
		nudge(0, -12, [
			// Far legs, behind the body.
			{ k: 'rect', x: 86, y: 130, w: 18, h: 34, rx: 9, fill: P.moss, shade: true },
			{ k: 'rect', x: 144, y: 130, w: 18, h: 34, rx: 9, fill: P.moss, shade: true },
			{
				k: 'path',
				d: tube([140, 124], [164, 126], [178, 114], [174, 88], 30, 8),
				fill: P.green,
				shade: true
			},
			{ k: 'ellipse', o: { cx: 116, cy: 120, rx: 52, ry: 30 }, fill: P.green, shade: true },
			{
				k: 'ellipse',
				o: { cx: 116, cy: 142, rx: 36, ry: 6 },
				fill: P.sand,
				shade: true,
				soft: true
			},
			// Ridges down the back.
			{
				k: 'path',
				d: 'M94 96 l6 -10 l6 10 Z M112 92 l6 -10 l6 10 Z M130 92 l6 -10 l6 10 Z M148 97 l6 -10 l6 10 Z',
				fill: P.moss
			},
			// Inside of the mouth, then the teeth, then the jaws over them.
			{ k: 'path', d: 'M30 112 L96 112 C 104 116, 104 130, 96 134 L34 132 Z', fill: P.pink },
			{
				k: 'path',
				d: 'M36 115 l5 8 l5 -8 Z M52 115 l5 8 l5 -8 Z M68 115 l5 8 l5 -8 Z M44 133 l5 -8 l5 8 Z M60 133 l5 -8 l5 8 Z M76 133 l5 -8 l5 8 Z',
				fill: P.white
			},
			{
				k: 'path',
				d: 'M106 118 C 100 96, 80 90, 60 94 C 44 97, 30 99, 24 104 C 20 109, 22 116, 30 116 L 106 116 Z',
				fill: P.green,
				shade: true
			},
			{
				k: 'path',
				d: 'M106 128 C 96 144, 64 146, 40 142 C 28 140, 24 134, 30 131 L 106 132 Z',
				fill: P.green,
				shade: true
			},
			// Near legs.
			{ k: 'rect', x: 74, y: 136, w: 20, h: 34, rx: 10, fill: P.green, shade: true },
			{ k: 'rect', x: 130, y: 136, w: 20, h: 34, rx: 10, fill: P.green, shade: true },
			// The eye sits on a bump on top of the head.
			{ k: 'circle', o: { cx: 80, cy: 90, r: 15 }, fill: P.green, shade: true },
			{ k: 'circle', o: { cx: 32, cy: 102, r: 3 }, fill: P.dark },
			...eye(81, 88, 7)
		]),

	// Leaping over a wave: an arched grey body with a beak and a dorsal fin, so
	// it reads apart from the round blue whale.
	dolphin: () => [
		// Wave, with a curl and spray.
		{
			k: 'path',
			d: 'M28 170 C 30 152, 46 140, 62 146 C 52 150, 52 162, 64 162 C 82 150, 108 146, 124 158 C 136 148, 160 150, 172 168 C 140 190, 60 190, 28 170 Z',
			fill: P.blue,
			shade: true
		},
		{
			k: 'path',
			d: 'M34 172 C 70 160, 130 160, 166 172 C 130 182, 70 182, 34 172 Z',
			fill: P.navy,
			shade: true,
			soft: true
		},
		{ k: 'circle', o: { cx: 128, cy: 138, r: 5 }, fill: P.sky },
		{ k: 'circle', o: { cx: 118, cy: 128, r: 4 }, fill: P.sky },
		{ k: 'circle', o: { cx: 44, cy: 136, r: 4.5 }, fill: P.sky },
		// Dorsal fin, behind the back.
		{
			k: 'path',
			d: 'M98 56 C 104 38, 116 28, 130 26 C 122 36, 120 48, 124 60 Z',
			fill: P.slate,
			shade: true
		},
		// Flukes, at the end of the arch.
		{
			k: 'path',
			d: 'M144 112 C 154 108, 164 98, 174 90 C 172 104, 166 116, 160 124 C 168 130, 172 140, 172 152 C 162 144, 150 132, 142 122 Z',
			fill: P.slate,
			shade: true
		},
		// Body: the beak, the melon, the back arching over to the tail.
		{
			k: 'path',
			d: 'M26 96 C 32 90, 42 86, 52 82 C 62 56, 122 36, 156 112 L 142 120 C 124 88, 92 80, 64 100 C 52 104, 36 102, 26 96 Z',
			fill: P.grey,
			shade: true
		},
		{
			k: 'path',
			d: 'M46 98 C 70 80, 116 82, 144 118 C 116 94, 84 90, 60 104 C 54 104, 50 102, 46 98 Z',
			fill: P.white,
			shade: true,
			soft: true
		},
		// Near flipper.
		{
			k: 'path',
			d: 'M82 92 C 90 102, 92 114, 86 124 C 80 114, 74 104, 72 94 Z',
			fill: P.slate,
			shade: true
		},
		{ k: 'line', d: 'M30 96 C 38 98, 46 96, 52 92', color: P.slate, w: 3, cap: 'round' },
		...eye(62, 78, 5.5)
	],

	koala: () => [
		{
			k: 'ellipse',
			o: { cx: 100, cy: 146, rx: 40, ry: 34 },
			fill: P.grey,
			shade: true
		},
		// Branch, with a couple of gum leaves.
		{ k: 'line', d: 'M22 160 C 70 150, 130 146, 178 138', color: P.brown, w: 18 },
		{
			k: 'ellipse',
			o: { cx: 160, cy: 156, rx: 16, ry: 7, rot: 30 },
			fill: P.green,
			shade: true,
			soft: true
		},
		{
			k: 'ellipse',
			o: { cx: 36, cy: 172, rx: 15, ry: 7, rot: -24 },
			fill: P.green,
			shade: true,
			soft: true
		},
		// Arms wrapped over the branch.
		{ k: 'ellipse', o: { cx: 70, cy: 150, rx: 13, ry: 22, rot: -20 }, fill: P.grey, shade: true },
		{ k: 'ellipse', o: { cx: 130, cy: 146, rx: 13, ry: 22, rot: 20 }, fill: P.grey, shade: true },
		// Big fluffy ears, then the head over them.
		{ k: 'circle', o: { cx: 52, cy: 62, r: 28 }, fill: P.grey, shade: true },
		{ k: 'circle', o: { cx: 148, cy: 62, r: 28 }, fill: P.grey, shade: true },
		{ k: 'circle', o: { cx: 54, cy: 64, r: 16 }, fill: P.white, shade: true, soft: true },
		{ k: 'circle', o: { cx: 146, cy: 64, r: 16 }, fill: P.white, shade: true, soft: true },
		{ k: 'ellipse', o: { cx: 100, cy: 88, rx: 46, ry: 42 }, fill: P.grey, shade: true },
		{ k: 'ellipse', o: { cx: 100, cy: 96, rx: 13, ry: 18 }, fill: P.dark, shade: true },
		{ k: 'line', d: 'M92 120 q 8 6 16 0', color: P.dark, w: 3 },
		...eye(76, 84, 6),
		...eye(124, 84, 6)
	],

	// Popping out of a molehill, front view.
	mole: () => [
		{
			k: 'path',
			d: 'M28 178 C 38 148, 64 132, 100 132 C 136 132, 162 148, 172 178 C 132 190, 68 190, 28 178 Z',
			fill: P.brown,
			shade: true
		},
		{ k: 'ellipse', o: { cx: 100, cy: 138, rx: 44, ry: 10 }, fill: P.dark },
		{
			k: 'path',
			d: 'M58 140 C 52 90, 70 44, 100 44 C 130 44, 148 90, 142 140 Z',
			fill: P.slate,
			shade: true
		},
		{
			k: 'ellipse',
			o: { cx: 100, cy: 98, rx: 22, ry: 19 },
			fill: P.tan,
			shade: true,
			soft: true
		},
		{ k: 'ellipse', o: { cx: 100, cy: 89, rx: 15, ry: 11 }, fill: P.pink, shade: true },
		{ k: 'line', d: 'M93 106 q 7 6 14 0', color: P.dark, w: 3 },
		// Front lip of the hole, over the body.
		{
			k: 'path',
			d: 'M52 136 C 72 148, 128 148, 148 136 C 146 152, 54 152, 52 136 Z',
			fill: P.brown,
			shade: true,
			soft: true
		},
		// Big digging paws resting on the rim, claws out.
		{ k: 'ellipse', o: { cx: 62, cy: 136, rx: 21, ry: 15, rot: -10 }, fill: P.pink, shade: true },
		{ k: 'ellipse', o: { cx: 138, cy: 136, rx: 21, ry: 15, rot: 10 }, fill: P.pink, shade: true },
		{
			k: 'line',
			d: 'M48 145 l -3 7 M57 149 l -1 7 M66 150 l 1 7 M152 145 l 3 7 M143 149 l 1 7 M134 150 l -1 7',
			color: P.cream,
			w: 3
		},
		// Clods of earth.
		{ k: 'circle', o: { cx: 40, cy: 104, r: 5 }, fill: P.brown },
		{ k: 'circle', o: { cx: 160, cy: 96, r: 6 }, fill: P.brown },
		{ k: 'circle', o: { cx: 166, cy: 116, r: 4 }, fill: P.brown },
		...eye(84, 72, 5.5),
		...eye(116, 72, 5.5)
	],

	// Japanese tako: round red head, a twisted headband, a pursed mouth.
	octopus: () => [
		...(
			[
				[
					[72, 116],
					[54, 140],
					[30, 150],
					[36, 172]
				],
				[
					[86, 122],
					[78, 150],
					[62, 168],
					[72, 182]
				],
				[
					[114, 122],
					[122, 150],
					[138, 168],
					[128, 182]
				],
				[
					[128, 116],
					[146, 140],
					[170, 150],
					[164, 172]
				]
			] as Pt[][]
		).map(([a, b, c, d]): Prim => ({
			k: 'path',
			d: tube(a, b, c, d, 22, 10),
			fill: P.red,
			shade: true
		})),
		// Each tip curls back up on itself.
		...(
			[
				[
					[36, 170],
					[34, 186],
					[54, 186],
					[50, 170]
				],
				[
					[72, 180],
					[80, 190],
					[94, 180],
					[86, 170]
				],
				[
					[128, 180],
					[120, 190],
					[106, 180],
					[114, 170]
				],
				[
					[164, 170],
					[166, 186],
					[146, 186],
					[150, 170]
				]
			] as Pt[][]
		).map(([a, b, c, d]): Prim => ({
			k: 'path',
			d: tube(a, b, c, d, 10, 6),
			fill: P.red,
			shade: true
		})),
		{ k: 'ellipse', o: { cx: 100, cy: 82, rx: 54, ry: 52 }, fill: P.red, shade: true },
		// Headband, knotted at the side.
		{
			k: 'path',
			d: 'M48 64 C 76 52, 124 52, 152 64 L 152 78 C 124 66, 76 66, 48 78 Z',
			fill: P.white,
			shade: true,
			soft: true
		},
		{ k: 'path', d: 'M150 64 L170 54 L166 70 Z M150 72 L172 78 L160 86 Z', fill: P.white },
		{ k: 'circle', o: { cx: 152, cy: 70, r: 7 }, fill: P.white },
		{ k: 'circle', o: { cx: 100, cy: 118, r: 11 }, fill: P.rust, shade: true },
		{ k: 'circle', o: { cx: 100, cy: 118, r: 5 }, fill: P.dark },
		{ k: 'ellipse', o: { cx: 70, cy: 108, rx: 9, ry: 5 }, fill: P.pink },
		{ k: 'ellipse', o: { cx: 130, cy: 108, rx: 9, ry: 5 }, fill: P.pink },
		...eye(80, 94, 7),
		...eye(120, 94, 7)
	],

	// Coiled up, head raised, tongue out.
	snake: () => [
		{
			k: 'path',
			d: tube([150, 168], [166, 170], [176, 162], [178, 150], 16, 4),
			fill: P.green,
			shade: true
		},
		{ k: 'ellipse', o: { cx: 100, cy: 162, rx: 62, ry: 20 }, fill: P.green, shade: true },
		{ k: 'ellipse', o: { cx: 100, cy: 140, rx: 50, ry: 18 }, fill: P.green, shade: true },
		{
			k: 'path',
			d: tube([110, 136], [60, 120], [66, 80], [100, 74], 28, 24),
			fill: P.green,
			shade: true
		},
		// Yellow spots along the coils.
		{
			k: 'path',
			d: 'M56 160 l6 -5 l6 5 l-6 5 Z M88 166 l6 -5 l6 5 l-6 5 Z M120 166 l6 -5 l6 5 l-6 5 Z M146 158 l6 -5 l6 5 l-6 5 Z M70 138 l6 -5 l6 5 l-6 5 Z M110 142 l6 -5 l6 5 l-6 5 Z',
			fill: P.yellow
		},
		{ k: 'line', d: 'M138 76 l 14 2 l 6 -6 M152 78 l 6 6', color: P.red, w: 3 },
		{ k: 'ellipse', o: { cx: 114, cy: 70, rx: 30, ry: 22 }, fill: P.green, shade: true },
		{ k: 'line', d: 'M124 80 q 10 2 18 -4', color: P.moss, w: 3 },
		...eye(104, 64, 6.5),
		...eye(126, 62, 5.5)
	],

	// A generic stuffed bear, sitting: seams, foot pads and a ribbon bow.
	'teddy bear': () => [
		{ k: 'circle', o: { cx: 62, cy: 46, r: 18 }, fill: P.brown, shade: true },
		{ k: 'circle', o: { cx: 138, cy: 46, r: 18 }, fill: P.brown, shade: true },
		{ k: 'circle', o: { cx: 62, cy: 46, r: 9 }, fill: P.tan, shade: true, soft: true },
		{ k: 'circle', o: { cx: 138, cy: 46, r: 9 }, fill: P.tan, shade: true, soft: true },
		{ k: 'ellipse', o: { cx: 100, cy: 142, rx: 42, ry: 40 }, fill: P.brown, shade: true },
		{
			k: 'ellipse',
			o: { cx: 100, cy: 148, rx: 24, ry: 26 },
			fill: P.tan,
			shade: true,
			soft: true
		},
		{ k: 'line', d: 'M100 124 v6 M100 136 v6 M100 148 v6 M100 160 v6', color: P.brown, w: 3 },
		// Arms.
		{ k: 'ellipse', o: { cx: 58, cy: 132, rx: 14, ry: 26, rot: 28 }, fill: P.brown, shade: true },
		{ k: 'ellipse', o: { cx: 142, cy: 132, rx: 14, ry: 26, rot: -28 }, fill: P.brown, shade: true },
		// Legs out in front, with paw pads.
		{ k: 'ellipse', o: { cx: 66, cy: 172, rx: 22, ry: 16 }, fill: P.brown, shade: true },
		{ k: 'ellipse', o: { cx: 134, cy: 172, rx: 22, ry: 16 }, fill: P.brown, shade: true },
		{ k: 'ellipse', o: { cx: 60, cy: 174, rx: 11, ry: 12 }, fill: P.tan, shade: true, soft: true },
		{ k: 'ellipse', o: { cx: 140, cy: 174, rx: 11, ry: 12 }, fill: P.tan, shade: true, soft: true },
		{ k: 'circle', o: { cx: 100, cy: 74, r: 40 }, fill: P.brown, shade: true },
		{ k: 'ellipse', o: { cx: 100, cy: 90, rx: 20, ry: 15 }, fill: P.tan, shade: true, soft: true },
		{ k: 'ellipse', o: { cx: 100, cy: 83, rx: 8, ry: 6 }, fill: P.dark },
		{
			k: 'line',
			d: 'M100 89 v6 M100 95 q -6 5 -10 1 M100 95 q 6 5 10 1',
			color: P.dark,
			w: 2.6
		},
		// Seam down the forehead.
		{ k: 'line', d: 'M100 38 v5 M100 48 v5 M100 58 v5', color: P.tan, w: 2.4 },
		// Bow at the neck.
		{
			k: 'path',
			d: 'M100 114 L76 102 L78 128 Z M100 114 L124 102 L122 128 Z',
			fill: P.red,
			shade: true
		},
		{ k: 'circle', o: { cx: 100, cy: 114, r: 7 }, fill: P.red, shade: true },
		...eye(84, 68, 5.5),
		...eye(116, 68, 5.5)
	],

	// Japanese yukidaruma: two snowballs and an upturned bucket for a hat.
	snowman: () => [
		{ k: 'line', d: 'M66 132 L34 112 M44 118 L36 104', color: P.brown, w: 5 },
		{ k: 'line', d: 'M134 132 L166 112 M156 118 L164 104', color: P.brown, w: 5 },
		{ k: 'circle', o: { cx: 100, cy: 146, r: 40 }, fill: P.white, shade: true },
		{ k: 'circle', o: { cx: 100, cy: 88, r: 32 }, fill: P.white, shade: true },
		// Bucket, open end down, with its handle.
		{ k: 'line', d: 'M76 56 C 74 30, 126 30, 124 56', color: P.slate, w: 3 },
		{
			k: 'path',
			d: 'M76 64 L84 28 L116 28 L124 64 Z',
			fill: P.red,
			shade: true
		},
		{ k: 'rect', x: 72, y: 58, w: 56, h: 9, rx: 4, fill: P.rust, shade: true },
		{ k: 'path', d: 'M98 92 L118 96 L98 100 Z', fill: P.orange },
		{ k: 'ellipse', o: { cx: 78, cy: 98, rx: 6, ry: 4 }, fill: P.pink },
		{ k: 'ellipse', o: { cx: 122, cy: 98, rx: 6, ry: 4 }, fill: P.pink },
		{ k: 'line', d: 'M88 108 q 12 8 24 0', color: P.dark, w: 3 },
		{ k: 'circle', o: { cx: 100, cy: 132, r: 4.5 }, fill: P.dark },
		{ k: 'circle', o: { cx: 100, cy: 150, r: 4.5 }, fill: P.dark },
		...eye(86, 84, 5.5),
		...eye(114, 84, 5.5)
	]
};

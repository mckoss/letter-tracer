// Kana word pictures: rails. See ./index.ts.

import { P } from '../palette';
import { glazing, wheel } from '../parts';
import type { Prim } from '../render';
import type { Subject } from '../subjects';

/** Two wavy strokes of water under a hull, as the yacht and kayak have. */
const water = (y: number): Prim[] => [
	{ k: 'line', d: `M30 ${y} Q 58 ${y - 8} 86 ${y} T 142 ${y} T 170 ${y - 4}`, color: P.sky, w: 7 },
	{ k: 'line', d: `M52 ${y + 16} Q 78 ${y + 8} 104 ${y + 16} T 152 ${y + 16}`, color: P.sky, w: 7 }
];

// The funicular climbs a slope; everything hangs off this one rail line.
const RISE = 0.62;
const railY = (x: number) => 172 - (x - 24) * RISE;

export const RAILS: Record<string, Subject> = {
	// A tug-like little ship: chunky hull, one cabin, a fat funnel. No sail, so
	// it never reads as the yacht; one low deck, so it never reads as the ferry.
	boat: () => [
		{ k: 'circle', o: { cx: 132, cy: 50, r: 10 }, fill: P.white, shade: true },
		{ k: 'circle', o: { cx: 148, cy: 36, r: 7 }, fill: P.white, shade: true },
		{ k: 'rect', x: 112, y: 64, w: 24, h: 40, rx: 3, fill: P.yellow, shade: true },
		{ k: 'rect', x: 112, y: 64, w: 24, h: 9, rx: 2, fill: P.dark },
		{ k: 'rect', x: 50, y: 82, w: 62, h: 40, rx: 6, fill: P.cream, shade: true },
		{ k: 'rect', x: 60, y: 90, w: 18, h: 16, rx: 3, fill: P.sky, shade: true, soft: true },
		{ k: 'rect', x: 84, y: 90, w: 18, h: 16, rx: 3, fill: P.sky, shade: true, soft: true },
		{ k: 'path', d: 'M26 118 L174 112 L154 152 L46 152 Z', fill: P.red, shade: true },
		{ k: 'line', d: 'M38 128 L166 123', color: P.cream, w: 6 },
		{ k: 'circle', o: { cx: 140, cy: 138, r: 5 }, fill: P.cream },
		...water(166)
	],

	// A Japanese ケーブルカー is a funicular: one stepped car hauled up a steep
	// track by a cable. The steps -- each compartment level while the floor
	// slopes -- are the whole tell, so the car is built from level boxes.
	'cable car': () => {
		const steps: Prim[] = [];
		const x0 = 42;
		const sw = 33;
		const cols = [P.red, P.red, P.red];
		for (let i = 0; i < 3; i++) {
			const a = x0 + i * sw;
			const b = a + sw;
			const top = railY(a) - 56;
			steps.push({
				k: 'path',
				d: `M${a} ${railY(a) - 12} L${a} ${top} L${b} ${top} L${b} ${railY(b) - 12} Z`,
				fill: cols[i],
				shade: true
			});
		}
		const wins: Prim[] = [0, 1, 2].map((i) => {
			const a = x0 + i * sw + 5;
			return {
				k: 'rect',
				x: a,
				y: railY(a) - 48,
				w: sw - 10,
				h: 18,
				rx: 3,
				fill: P.sky,
				shade: true,
				soft: true
			};
		});
		const xEnd = x0 + 3 * sw;
		return [
			// The hillside under the track.
			{
				k: 'path',
				d: `M28 ${railY(28) + 2} L172 ${railY(172) + 2} L174 150 Q 150 184 100 186 Q 56 186 28 ${railY(28) + 2} Z`,
				fill: P.green,
				shade: true
			},
			// The cable, from the top of the car up to the winding house.
			{
				k: 'line',
				d: `M${xEnd} ${railY(xEnd) - 14} L156 ${railY(156) - 14}`,
				color: P.dark,
				w: 3
			},
			{ k: 'rect', x: 148, y: 50, w: 28, h: 34, rx: 3, fill: P.cream, shade: true },
			{ k: 'path', d: 'M144 52 L162 36 L180 52 Z', fill: P.rust, shade: true },
			{ k: 'circle', o: { cx: 162, cy: 68, r: 7 }, fill: P.slate },
			{
				k: 'line',
				d: `M28 ${railY(28)} L172 ${railY(172)}`,
				color: P.slate,
				w: 7
			},
			...steps,
			{
				k: 'line',
				d: `M${x0} ${railY(x0) - 22} L${xEnd} ${railY(xEnd) - 22}`,
				color: P.cream,
				w: 5,
				cap: 'butt'
			},
			...wins,
			...wheel(x0 + 16, railY(x0 + 16) - 10, 7),
			...wheel(xEnd - 16, railY(xEnd - 16) - 10, 7)
		];
	},

	// A commuter car on rails with a pantograph pressed to the wire overhead:
	// the wire and pantograph are what say "electric" rather than "train".
	'electric train': () => [
		{ k: 'line', d: 'M22 42 H178', color: P.dark, w: 3 },
		{ k: 'line', d: 'M86 80 L104 62 L86 46 M104 80 L86 62 L104 46', color: P.slate, w: 4 },
		{ k: 'line', d: 'M78 45 H112', color: P.slate, w: 5 },
		{ k: 'rect', x: 84, y: 76, w: 22, h: 7, rx: 2, fill: P.slate },
		{
			k: 'path',
			d: 'M22 82 L150 82 Q 166 82 172 100 L178 124 Q 180 146 164 146 L22 146 Z',
			fill: P.white,
			shade: true
		},
		{
			k: 'path',
			d: 'M152 90 Q 164 90 168 104 L171 116 L152 116 Z',
			fill: P.sky,
			shade: true,
			soft: true
		},
		...glazing(30, 94, 22, 22, 4, 8),
		{ k: 'rect', x: 22, y: 124, w: 156, h: 10, fill: P.green, shade: true, soft: true },
		{ k: 'circle', o: { cx: 170, cy: 138, r: 4 }, fill: P.yellow },
		{ k: 'line', d: 'M22 162 H178', color: P.slate, w: 6 },
		...wheel(42, 152, 10),
		...wheel(66, 152, 10),
		...wheel(126, 152, 10),
		...wheel(150, 152, 10)
	],

	// Tall and white with tiers of windows: tiers, not size, are what make it a
	// ferry beside the boat. A navy hull keeps the white off the pale disc.
	ferry: () => [
		{ k: 'rect', x: 116, y: 50, w: 22, h: 30, rx: 3, fill: P.red, shade: true },
		{ k: 'rect', x: 116, y: 50, w: 22, h: 8, rx: 2, fill: P.dark },
		{ k: 'path', d: 'M54 78 L150 78 L160 100 L48 100 Z', fill: P.white, shade: true },
		{ k: 'path', d: 'M40 100 L164 100 L172 124 L34 124 Z', fill: P.white, shade: true },
		...[0, 1, 2, 3, 4, 5].map((i): Prim => ({
			k: 'rect',
			x: 62 + i * 14,
			y: 84,
			w: 9,
			h: 9,
			rx: 2,
			fill: P.navy
		})),
		...[0, 1, 2, 3, 4, 5, 6, 7].map((i): Prim => ({
			k: 'rect',
			x: 48 + i * 14,
			y: 106,
			w: 9,
			h: 10,
			rx: 2,
			fill: P.navy
		})),
		{ k: 'path', d: 'M24 124 L178 124 L160 158 L40 158 Z', fill: P.navy, shade: true },
		{ k: 'line', d: 'M30 134 H172', color: P.red, w: 6 },
		...water(170)
	],

	// One concrete beam on T-pillars, with the car straddling it: the skirt
	// hanging down over the beam is what says monorail rather than train.
	monorail: () => [
		{ k: 'rect', x: 50, y: 140, w: 16, h: 46, fill: P.grey, shade: true },
		{ k: 'rect', x: 134, y: 140, w: 16, h: 46, fill: P.grey, shade: true },
		{ k: 'rect', x: 22, y: 128, w: 156, h: 18, rx: 2, fill: P.grey, shade: true },
		{
			k: 'path',
			d: 'M24 70 L140 70 Q 172 70 176 104 Q 178 132 160 134 L24 134 Z',
			fill: P.blue,
			shade: true
		},
		{ k: 'rect', x: 24, y: 112, w: 150, h: 22, fill: P.white, shade: true, soft: true },
		{
			k: 'path',
			d: 'M146 80 Q 164 82 168 104 L146 104 Z',
			fill: P.sky,
			shade: true,
			soft: true
		},
		...glazing(32, 82, 22, 20, 4, 6),
		{ k: 'line', d: 'M24 112 H172', color: P.navy, w: 4 },
		{ k: 'circle', o: { cx: 166, cy: 120, r: 4 }, fill: P.yellow }
	],

	// Underwater by its bubbles and the waterline above it; the conning tower
	// and periscope do the rest.
	submarine: () => [
		{ k: 'line', d: 'M24 40 Q 50 32 76 40 T 128 40 T 178 40', color: P.blue, w: 5 },
		{ k: 'line', d: 'M118 40 V64 M118 40 H130', color: P.slate, w: 6 },
		{ k: 'path', d: 'M84 98 L90 62 L132 62 L136 98 Z', fill: P.yellow, shade: true },
		{ k: 'path', d: 'M34 112 L22 92 L22 132 Z', fill: P.slate, shade: true },
		{ k: 'ellipse', o: { cx: 102, cy: 112, rx: 72, ry: 30 }, fill: P.yellow, shade: true },
		{ k: 'circle', o: { cx: 76, cy: 112, r: 9 }, fill: P.slate },
		{ k: 'circle', o: { cx: 76, cy: 112, r: 6 }, fill: P.sky },
		{ k: 'circle', o: { cx: 106, cy: 112, r: 9 }, fill: P.slate },
		{ k: 'circle', o: { cx: 106, cy: 112, r: 6 }, fill: P.sky },
		{ k: 'circle', o: { cx: 136, cy: 112, r: 9 }, fill: P.slate },
		{ k: 'circle', o: { cx: 136, cy: 112, r: 6 }, fill: P.sky },
		{ k: 'line', d: 'M44 130 H160', color: P.gold, w: 5 },
		{ k: 'circle', o: { cx: 160, cy: 72, r: 6 }, fill: P.sky },
		{ k: 'circle', o: { cx: 170, cy: 56, r: 4 }, fill: P.sky },
		{ k: 'circle', o: { cx: 50, cy: 74, r: 5 }, fill: P.sky },
		{ k: 'path', d: 'M40 186 Q 30 168 40 152 Q 48 168 46 186 Z', fill: P.green, shade: true },
		{ k: 'path', d: 'M148 186 Q 140 166 152 150 Q 158 168 156 186 Z', fill: P.moss, shade: true },
		{ k: 'path', d: 'M40 174 Q 100 160 160 174 L154 186 L46 186 Z', fill: P.sand, shade: true }
	],

	// Head-on out of a round tunnel mouth, so the dark arch around it says
	// "underground"; the electric train is the side view in daylight.
	subway: () => [
		{ k: 'path', d: 'M24 170 L24 96 A 76 76 0 0 1 176 96 L176 170 Z', fill: P.tan, shade: true },
		{ k: 'path', d: 'M42 170 L42 98 A 58 58 0 0 1 158 98 L158 170 Z', fill: P.dark },
		{ k: 'line', d: 'M66 170 L84 120 M134 170 L116 120', color: P.grey, w: 5 },
		{
			k: 'path',
			d: 'M58 160 L58 84 Q 58 64 80 64 L120 64 Q 142 64 142 84 L142 160 Z',
			fill: P.white,
			shade: true
		},
		{ k: 'rect', x: 68, y: 74, w: 64, h: 40, rx: 8, fill: P.sky, shade: true, soft: true },
		{ k: 'rect', x: 58, y: 122, w: 84, h: 10, fill: P.orange, shade: true, soft: true },
		{ k: 'circle', o: { cx: 72, cy: 146, r: 7 }, fill: P.yellow },
		{ k: 'circle', o: { cx: 128, cy: 146, r: 7 }, fill: P.yellow },
		{ k: 'rect', x: 66, y: 160, w: 68, h: 8, rx: 2, fill: P.slate },
		{ k: 'line', d: 'M30 176 H170', color: P.slate, w: 6 }
	],

	// Wooden slats on curling runners, in a drift of snow.
	sled: () => [
		{
			k: 'path',
			d: 'M30 162 Q 100 140 170 162 Q 168 186 140 186 L60 186 Q 32 186 30 162 Z',
			fill: P.white,
			shade: true,
			soft: true
		},
		{ k: 'line', d: 'M32 162 Q 100 140 168 162', color: P.sky, w: 4 },
		{ k: 'line', d: 'M54 128 V150 M96 128 V150 M138 128 V150', color: P.rust, w: 8 },
		{
			k: 'line',
			d: 'M36 150 L144 150 Q 172 150 172 124 Q 172 104 156 108',
			color: P.red,
			w: 9
		},
		{ k: 'rect', x: 28, y: 112, w: 130, h: 20, rx: 6, fill: P.tan, shade: true },
		{ k: 'line', d: 'M60 113 V131 M92 113 V131 M124 113 V131', color: P.brown, w: 3 }
	]
};

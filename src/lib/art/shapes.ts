// Subject silhouettes for the word illustrations, drawn in a shared 200x210 box.
// Geometry is style-independent: the three styles in `styles.ts` re-colour and
// re-outline these same forms so they can be compared like for like.

export type Ellipse = { cx: number; cy: number; rx: number; ry: number; rot?: number };
export type Circle = { cx: number; cy: number; r: number };
export type Anchor = { cx: number; cy: number; rot: number };

export const APPLE = {
	body: 'M100 78 C 78 56, 40 66, 38 108 C 36 152, 72 184, 100 170 C 128 184, 164 152, 162 108 C 160 66, 122 56, 100 78 Z',
	stem: 'M100 80 C 103 62, 111 50, 126 44',
	leaf: { cx: 138, cy: 46, rx: 24, ry: 13, rot: -28 } as Ellipse,
	shine: { cx: 70, cy: 104, rx: 15, ry: 22, rot: -20 } as Ellipse
};

export const DOG = {
	earL: { cx: 54, cy: 84, rx: 25, ry: 43, rot: -8 } as Ellipse,
	earR: { cx: 146, cy: 84, rx: 25, ry: 43, rot: 8 } as Ellipse,
	body: 'M68 116 C 60 148, 57 174, 62 182 L 138 182 C 143 174, 140 148, 132 116 Z',
	pawL: { cx: 78, cy: 177, rx: 17, ry: 10 } as Ellipse,
	pawR: { cx: 122, cy: 177, rx: 17, ry: 10 } as Ellipse,
	belly: { cx: 100, cy: 154, rx: 21, ry: 27 } as Ellipse,
	head: { cx: 100, cy: 84, r: 46 } as Circle,
	muzzle: { cx: 100, cy: 102, rx: 27, ry: 21 } as Ellipse,
	nose: { cx: 100, cy: 92, rx: 11, ry: 8 } as Ellipse,
	mouth: 'M100 100 v 7 M100 107 q -10 9 -17 1 M100 107 q 10 9 17 1',
	eyeL: { cx: 81, cy: 72, r: 6.5 } as Circle,
	eyeR: { cx: 119, cy: 72, r: 6.5 } as Circle
};

export const KITE = {
	q1: 'M90 14 L 44 70 L 90 70 Z',
	q2: 'M90 14 L 136 70 L 90 70 Z',
	q3: 'M44 70 L 90 124 L 90 70 Z',
	q4: 'M136 70 L 90 124 L 90 70 Z',
	frame: 'M90 14 L 136 70 L 90 124 L 44 70 Z',
	spars: 'M90 14 L 90 124 M44 70 L 136 70',
	tail: 'M90 124 C 100 152, 128 156, 130 176 C 132 192, 150 196, 162 189',
	// Ribbon anchors are points sampled off the tail curve; `rot` is perpendicular
	// to the tangent there, so each ribbon sits across the string.
	bows: [
		{ cx: 105, cy: 146, rot: -46 },
		{ cx: 127, cy: 168, rot: -27 },
		{ cx: 142, cy: 191, rot: -71 }
	] as Anchor[]
};

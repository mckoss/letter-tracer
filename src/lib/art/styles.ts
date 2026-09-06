// Candidate art directions for the word illustrations.
//
// Subject geometry lives in `shapes.ts` and is shared: a subject describes
// itself as a list of primitives, and a style decides how those primitives are
// filled, outlined and shaded. Adding a style therefore never touches a drawing.
//
// Posterised styles get their depth from one global light source rather than
// per-shape shadow paths: each shaded primitive is used as a clip, and three
// concentric discs centred up and to the left paint a light band, the base
// tone, and a shadow tone across it. Every object in the scene is lit by the
// same discs, so the whole picture reads as one consistent light -- the trick
// behind WPA / national-park poster art.

import { APPLE, DOG, KITE, type Circle, type Ellipse } from './shapes';

/** Light source for posterised styles, in the shared 200x210 box. */
const LIGHT = { cx: 55, cy: 38, rLight: 70, rBase: 132 };
const BOX = { w: 200, h: 210 };

export type Palette = {
	apple: string;
	stem: string;
	leaf: string;
	dog: string;
	dogDk: string;
	cream: string;
	dark: string;
	k1: string;
	k2: string;
	k3: string;
	k4: string;
	tail: string;
	shine: string;
	shineOp: number;
};

export type Shading = {
	/** Colour the shadow band is mixed toward, and how far. */
	dark: string;
	darkAmt: number;
	/** Colour the lit band is mixed toward, and how far. */
	light: string;
	lightAmt: number;
};

export type Style = {
	name: string;
	blurb: string;
	/** Attributes stamped on outlined primitives. Empty for outline-free styles. */
	ink: string;
	/** Filter reference such as `url(#softCut)`, or empty. Ids are made unique per instance. */
	filter: string;
	/** Present on posterised styles; absent means flat fills. */
	shade?: Shading;
	/** Optional flat disc behind the subject. */
	backdrop?: string;
	chips: string[];
	p: Palette;
};

export type Subject = 'apple' | 'dog' | 'kite';

// --- primitives -------------------------------------------------------------

type Common = {
	fill: string;
	/** Take part in posterised shading. Small features look like noise if they do. */
	shade?: boolean;
	/** Set false to skip this style's outline (inner markings, eyes). */
	ink?: boolean;
	/** Override the outline weight, for small parts. */
	inkW?: number;
	op?: number;
	/** Drop this primitive in posterised styles, where shading already does the job. */
	flatOnly?: boolean;
	/** Shade at reduced strength. Inner markings go muddy at full strength, because
	 *  they are already a light tint sitting on top of an already-shaded body. */
	soft?: boolean;
};
export type Prim =
	| ({ k: 'path'; d: string } & Common)
	| ({ k: 'ellipse'; o: Ellipse } & Common)
	| ({ k: 'circle'; o: Circle } & Common)
	| ({
			k: 'rect';
			x: number;
			y: number;
			w: number;
			h: number;
			rx: number;
			rot?: number;
			cx?: number;
			cy?: number;
	  } & Common)
	| { k: 'line'; d: string; color: string; w: number };

// --- colour -----------------------------------------------------------------

const chan = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));

/** Linear blend of two hex colours; `t` is how far to travel from `a` to `b`. */
export function mix(a: string, b: string, t: number): string {
	const [ar, ag, ab] = chan(a);
	const [br, bg, bb] = chan(b);
	return (
		'#' +
		[ar + (br - ar) * t, ag + (bg - ag) * t, ab + (bb - ab) * t]
			.map((v) => Math.round(v).toString(16).padStart(2, '0'))
			.join('')
	);
}

// --- styles -----------------------------------------------------------------

export const STYLES = {
	poster: {
		name: 'Poster',
		blurb:
			'National-park poster: a muted retro palette, three hard tone bands per shape, one light source across the whole picture.',
		ink: '',
		filter: '',
		shade: { dark: '#6E3F52', darkAmt: 0.3, light: '#FFEFC9', lightAmt: 0.22 },
		backdrop: '#DCE6E4',
		chips: ['#C34C3E', '#D89A4A', '#3E7C7B', '#4C7A4A', '#DCE6E4'],
		p: {
			apple: '#C34C3E',
			stem: '#7A5233',
			leaf: '#4C7A4A',
			dog: '#D89A4A',
			dogDk: '#B87B36',
			cream: '#F0DCB4',
			dark: '#3B3039',
			k1: '#3E7C7B',
			k2: '#D9A93F',
			k3: '#C34C3E',
			k4: '#5C8C57',
			tail: '#7C6B9E',
			shine: '#FFF3D6',
			shineOp: 0.3
		}
	},
	cel: {
		name: 'Cel Cartoon',
		blurb:
			'Saturated cartoon colour with a hard cel shadow and a dark outline. Punchier and more animated than the poster.',
		ink: 'stroke="#3A2233" stroke-width="6" stroke-linejoin="round" stroke-linecap="round"',
		filter: '',
		shade: { dark: '#4B2E83', darkAmt: 0.3, light: '#FFFFFF', lightAmt: 0.2 },
		chips: ['#EF4B3C', '#F5A623', '#2FA8E0', '#45C167', '#3A2233'],
		p: {
			apple: '#EF4B3C',
			stem: '#8B5A2B',
			leaf: '#45C167',
			dog: '#F5A623',
			dogDk: '#DA8714',
			cream: '#FFE7C2',
			dark: '#3A2233',
			k1: '#2FA8E0',
			k2: '#FFD23F',
			k3: '#EF4B3C',
			k4: '#45C167',
			tail: '#8B5CF6',
			shine: '#FFFFFF',
			shineOp: 0.35
		}
	},
	flat: {
		name: 'Flat Geometric',
		blurb: 'The unshaded baseline: bold saturated shapes, no outlines, one soft highlight.',
		ink: '',
		filter: '',
		chips: ['#E8453C', '#F2A65A', '#2D9CDB', '#43B34A', '#F7D046'],
		p: {
			apple: '#E8453C',
			stem: '#7A4A2B',
			leaf: '#43B34A',
			dog: '#F2A65A',
			dogDk: '#D9873C',
			cream: '#FFE3BE',
			dark: '#3A2E33',
			k1: '#2D9CDB',
			k2: '#F7D046',
			k3: '#E8453C',
			k4: '#43B34A',
			tail: '#7B61FF',
			shine: '#FFFFFF',
			shineOp: 0.34
		}
	},
	sticker: {
		name: 'Sticker Outline',
		blurb: 'Chunky dark outlines plus a white sticker rim punched around the whole shape.',
		ink: 'stroke="#2B2233" stroke-width="6.5" stroke-linejoin="round" stroke-linecap="round"',
		filter: 'url(#stickerRim)',
		chips: ['#FF4D45', '#FFB259', '#35A9EE', '#4CD269', '#2B2233'],
		p: {
			apple: '#FF4D45',
			stem: '#8B5A2B',
			leaf: '#3FCB5B',
			dog: '#FFB259',
			dogDk: '#E8913F',
			cream: '#FFF0DC',
			dark: '#2B2233',
			k1: '#35A9EE',
			k2: '#FFD84D',
			k3: '#FF5A4E',
			k4: '#4CD269',
			tail: '#9B7BFF',
			shine: '#FFFFFF',
			shineOp: 0.4
		}
	}
} satisfies Record<string, Style>;

export type StyleKey = keyof typeof STYLES;
export const STYLE_KEYS = Object.keys(STYLES) as StyleKey[];

// --- subjects ---------------------------------------------------------------

const subjects: Record<Subject, (p: Palette) => Prim[]> = {
	apple: (p) => [
		{ k: 'line', d: APPLE.stem, color: p.stem, w: 9 },
		{ k: 'ellipse', o: APPLE.leaf, fill: p.leaf, shade: true, soft: true },
		{ k: 'path', d: APPLE.body, fill: p.apple, shade: true },
		{ k: 'ellipse', o: APPLE.shine, fill: p.shine, op: p.shineOp, ink: false, flatOnly: true }
	],

	dog: (p) => [
		{ k: 'ellipse', o: DOG.earL, fill: p.dogDk, shade: true },
		{ k: 'ellipse', o: DOG.earR, fill: p.dogDk, shade: true },
		{ k: 'path', d: DOG.body, fill: p.dog, shade: true },
		{ k: 'ellipse', o: DOG.pawL, fill: p.cream, shade: true, soft: true },
		{ k: 'ellipse', o: DOG.pawR, fill: p.cream, shade: true, soft: true },
		{ k: 'ellipse', o: DOG.belly, fill: p.cream, shade: true, soft: true, ink: false },
		{ k: 'circle', o: DOG.head, fill: p.dog, shade: true },
		{ k: 'ellipse', o: DOG.muzzle, fill: p.cream, shade: true, soft: true, ink: false },
		{ k: 'line', d: DOG.mouth, color: p.dark, w: 5 },
		{ k: 'ellipse', o: DOG.nose, fill: p.dark, ink: false },
		{ k: 'circle', o: DOG.eyeL, fill: p.dark, ink: false },
		{ k: 'circle', o: DOG.eyeR, fill: p.dark, ink: false },
		{
			k: 'circle',
			o: { cx: DOG.eyeL.cx + 2.4, cy: DOG.eyeL.cy - 2.4, r: 2.2 },
			fill: '#fff',
			ink: false
		},
		{
			k: 'circle',
			o: { cx: DOG.eyeR.cx + 2.4, cy: DOG.eyeR.cy - 2.4, r: 2.2 },
			fill: '#fff',
			ink: false
		}
	],

	kite: (p) => [
		{ k: 'line', d: KITE.tail, color: p.stem, w: 4.5 },
		// Ribbons read better than bow-ties at thumbnail size: short rounded bars
		// laid across the string, perpendicular to its tangent.
		...KITE.bows.map((b): Prim => ({
			k: 'rect',
			x: b.cx - 15,
			y: b.cy - 6,
			w: 30,
			h: 12,
			rx: 6,
			rot: b.rot,
			cx: b.cx,
			cy: b.cy,
			fill: p.tail,
			inkW: 4
		})),
		{ k: 'path', d: KITE.q1, fill: p.k1, shade: true },
		{ k: 'path', d: KITE.q2, fill: p.k2, shade: true },
		{ k: 'path', d: KITE.q3, fill: p.k3, shade: true },
		{ k: 'path', d: KITE.q4, fill: p.k4, shade: true },
		{ k: 'line', d: KITE.spars, color: p.dark, w: 2.5 }
	]
};

// --- rendering --------------------------------------------------------------

function shapeEl(prim: Prim, fill: string, attrs: string): string {
	switch (prim.k) {
		case 'path':
			return `<path d="${prim.d}" fill="${fill}" ${attrs}/>`;
		case 'ellipse': {
			const o = prim.o;
			const t = o.rot ? ` transform="rotate(${o.rot} ${o.cx} ${o.cy})"` : '';
			return `<ellipse cx="${o.cx}" cy="${o.cy}" rx="${o.rx}" ry="${o.ry}"${t} fill="${fill}" ${attrs}/>`;
		}
		case 'circle':
			return `<circle cx="${prim.o.cx}" cy="${prim.o.cy}" r="${prim.o.r}" fill="${fill}" ${attrs}/>`;
		case 'rect': {
			const t = prim.rot ? ` transform="rotate(${prim.rot} ${prim.cx} ${prim.cy})"` : '';
			return `<rect x="${prim.x}" y="${prim.y}" width="${prim.w}" height="${prim.h}" rx="${prim.rx}"${t} fill="${fill}" ${attrs}/>`;
		}
		default:
			return '';
	}
}

function renderPrim(prim: Prim, s: Style, uid: string, n: number): string {
	if (prim.k === 'line') {
		return `<path d="${prim.d}" fill="none" stroke="${prim.color}" stroke-width="${prim.w}" stroke-linecap="round"/>`;
	}
	if (prim.flatOnly && s.shade) return '';

	let attrs = prim.ink === false ? '' : s.ink;
	if (attrs && prim.inkW)
		attrs = attrs.replace(/stroke-width="[\d.]+"/, `stroke-width="${prim.inkW}"`);
	if (prim.op !== undefined) attrs += ` opacity="${prim.op}"`;

	if (!s.shade || !prim.shade) return shapeEl(prim, prim.fill, attrs);

	// Posterised: clip the light discs to this shape to get three hard bands.
	const k = prim.soft ? 0.45 : 1;
	const dark = mix(prim.fill, s.shade.dark, s.shade.darkAmt * k);
	const light = mix(prim.fill, s.shade.light, s.shade.lightAmt * k);
	const cid = `cl-${uid}-${n}`;
	return (
		`<clipPath id="${cid}">${shapeEl(prim, '#000', '')}</clipPath>` +
		`<g clip-path="url(#${cid})">` +
		`<rect x="0" y="0" width="${BOX.w}" height="${BOX.h}" fill="${dark}"/>` +
		`<circle cx="${LIGHT.cx}" cy="${LIGHT.cy}" r="${LIGHT.rBase}" fill="${prim.fill}"/>` +
		`<circle cx="${LIGHT.cx}" cy="${LIGHT.cy}" r="${LIGHT.rLight}" fill="${light}"/>` +
		`</g>` +
		(attrs ? shapeEl(prim, 'none', attrs) : '')
	);
}

let seq = 0;

/** Self-contained SVG markup for one subject in one style, at `size` px wide. */
export function art(subject: Subject, key: StyleKey, size = 200): string {
	const s: Style = STYLES[key];
	const uid = `${key}-${subject}-${seq++}`;
	const defs =
		`<defs><filter id="stickerRim-${uid}" x="-20%" y="-20%" width="140%" height="140%">` +
		`<feMorphology in="SourceAlpha" operator="dilate" radius="5" result="r"/>` +
		`<feFlood flood-color="#FFFFFF" result="w"/>` +
		`<feComposite in="w" in2="r" operator="in" result="ring"/>` +
		`<feMerge><feMergeNode in="ring"/><feMergeNode in="SourceGraphic"/></feMerge>` +
		`</filter></defs>`;
	const filter = s.filter ? ` filter="${s.filter.replace(/#(\w+)\)/, `#$1-${uid})`)}"` : '';
	const backdrop = s.backdrop ? `<circle cx="100" cy="102" r="104" fill="${s.backdrop}"/>` : '';
	const body = subjects[subject](s.p)
		.map((prim, i) => renderPrim(prim, s, uid, i))
		.join('');
	return `<svg viewBox="0 0 200 210" width="${size}" height="${Math.round(size * 1.05)}" role="img" aria-label="${subject}, ${s.name} style">${defs}${backdrop}<g${filter}>${body}</g></svg>`;
}

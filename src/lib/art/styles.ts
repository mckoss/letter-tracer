// Three candidate art directions for the word illustrations. Each style is a
// palette plus an outline treatment; the subject geometry is shared, so the
// styles can be compared like for like. One of these gets picked, and then all
// 26 words are drawn in it (see PLAN.md, milestone 5).

import { APPLE, DOG, KITE, type Circle, type Ellipse } from './shapes';

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

export type Style = {
	name: string;
	blurb: string;
	/** Extra attributes stamped on outlined shapes. Empty for outline-free styles. */
	ink: string;
	/** Filter reference such as `url(#softCut)`, or empty. Ids are made unique per instance. */
	filter: string;
	chips: string[];
	p: Palette;
};

export type Subject = 'apple' | 'dog' | 'kite';

export const STYLES = {
	flat: {
		name: 'Flat Geometric',
		blurb: 'No outlines at all. Bold saturated shapes with one soft highlight.',
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
	},
	paper: {
		name: 'Soft Paper-Cut',
		blurb: 'Muted pastels lifted off the page by one soft drop shadow. Storybook, not sticker.',
		ink: '',
		filter: 'url(#softCut)',
		chips: ['#F0837C', '#EBC08A', '#93C5FD', '#9FD49B', '#C4B5FD'],
		p: {
			apple: '#F0837C',
			stem: '#C0A080',
			leaf: '#9FD49B',
			dog: '#EBC08A',
			dogDk: '#D9A971',
			cream: '#FBEEDC',
			dark: '#6B5A63',
			k1: '#93C5FD',
			k2: '#FDE68A',
			k3: '#F5A3A0',
			k4: '#B7E3B2',
			tail: '#C4B5FD',
			shine: '#FFFFFF',
			shineOp: 0.42
		}
	}
} satisfies Record<string, Style>;

export type StyleKey = keyof typeof STYLES;
export const STYLE_KEYS = Object.keys(STYLES) as StyleKey[];

const ell = (o: Ellipse, fill: string, ink: string) =>
	`<ellipse cx="${o.cx}" cy="${o.cy}" rx="${o.rx}" ry="${o.ry}"${
		o.rot ? ` transform="rotate(${o.rot} ${o.cx} ${o.cy})"` : ''
	} fill="${fill}" ${ink}/>`;
const cir = (o: Circle, fill: string, ink: string) =>
	`<circle cx="${o.cx}" cy="${o.cy}" r="${o.r}" fill="${fill}" ${ink}/>`;
const pth = (d: string, fill: string, ink: string) => `<path d="${d}" fill="${fill}" ${ink}/>`;

const subjects: Record<Subject, (p: Palette, ink: string) => string> = {
	apple: (p, ink) =>
		pth(APPLE.stem, 'none', `stroke="${p.stem}" stroke-width="9" stroke-linecap="round"`) +
		ell(APPLE.leaf, p.leaf, ink) +
		pth(APPLE.body, p.apple, ink) +
		ell(APPLE.shine, p.shine, `opacity="${p.shineOp}"`),

	dog: (p, ink) =>
		ell(DOG.earL, p.dogDk, ink) +
		ell(DOG.earR, p.dogDk, ink) +
		pth(DOG.body, p.dog, ink) +
		ell(DOG.pawL, p.cream, ink) +
		ell(DOG.pawR, p.cream, ink) +
		ell(DOG.belly, p.cream, '') +
		cir(DOG.head, p.dog, ink) +
		ell(DOG.muzzle, p.cream, '') +
		pth(
			DOG.mouth,
			'none',
			`stroke="${p.dark}" stroke-width="5" stroke-linecap="round" fill="none"`
		) +
		ell(DOG.nose, p.dark, '') +
		cir(DOG.eyeL, p.dark, '') +
		cir(DOG.eyeR, p.dark, '') +
		`<circle cx="${DOG.eyeL.cx + 2.4}" cy="${DOG.eyeL.cy - 2.4}" r="2.2" fill="#fff"/>` +
		`<circle cx="${DOG.eyeR.cx + 2.4}" cy="${DOG.eyeR.cy - 2.4}" r="2.2" fill="#fff"/>`,

	kite: (p, ink) => {
		// Ribbons read better than bow-ties at thumbnail size: short rounded bars
		// laid across the string. They also want a lighter outline than the body.
		const thin = ink.replace('stroke-width="6.5"', 'stroke-width="4"');
		const bow = (b: { cx: number; cy: number; rot: number }) =>
			`<rect x="${b.cx - 15}" y="${b.cy - 6}" width="30" height="12" rx="6" fill="${p.tail}" ${thin} transform="rotate(${b.rot} ${b.cx} ${b.cy})"/>`;
		return (
			pth(
				KITE.tail,
				'none',
				`stroke="${p.stem}" stroke-width="4.5" stroke-linecap="round" fill="none"`
			) +
			KITE.bows.map(bow).join('') +
			pth(KITE.q1, p.k1, ink) +
			pth(KITE.q2, p.k2, ink) +
			pth(KITE.q3, p.k3, ink) +
			pth(KITE.q4, p.k4, ink) +
			// Outlined styles get their spars from the quadrant edges already.
			(ink ? '' : pth(KITE.spars, 'none', `stroke="${p.shine}" stroke-width="3" opacity="0.5"`))
		);
	}
};

let uid = 0;

/** Self-contained SVG markup for one subject in one style, at `size` px wide. */
export function art(subject: Subject, key: StyleKey, size = 200): string {
	const s: Style = STYLES[key];
	const id = `${key}-${subject}-${uid++}`;
	const defs = `<defs>
    <filter id="stickerRim-${id}" x="-20%" y="-20%" width="140%" height="140%">
      <feMorphology in="SourceAlpha" operator="dilate" radius="5" result="r"/>
      <feFlood flood-color="#FFFFFF" result="w"/>
      <feComposite in="w" in2="r" operator="in" result="ring"/>
      <feMerge><feMergeNode in="ring"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="softCut-${id}" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="5" stdDeviation="5" flood-color="#6B5A63" flood-opacity="0.28"/>
    </filter>
  </defs>`;
	const filter = s.filter ? ` filter="${s.filter.replace(/#(\w+)\)/, `#$1-${id})`)}"` : '';
	return `<svg viewBox="0 0 200 210" width="${size}" height="${Math.round(size * 1.05)}" role="img" aria-label="${subject}, ${s.name} style">${defs}<g${filter}>${subjects[subject](s.p, s.ink)}</g></svg>`;
}

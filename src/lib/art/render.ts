// Rendering for the word illustrations.
//
// A subject describes itself as a list of primitives; this module decides how
// they are filled and shaded. Depth comes from one global light source rather
// than per-shape shadow paths: each shaded primitive is used as a clip, and
// three concentric discs centred up and to the left paint a lit band, the base
// tone and a shadow tone across it. Every object in a picture is lit by the
// same discs, so the whole scene reads as one light -- the trick behind
// WPA / national-park poster art -- and a new subject inherits it for free.
//
// The shadow tone is the fill mixed toward warm plum rather than simply
// darkened, which is what keeps light tints tan instead of grey.

/** Light source, in the shared 200x210 box. */
const LIGHT = { cx: 55, cy: 38, rLight: 70, rBase: 132 };
const BOX = { w: 200, h: 210 };

const SHADE = { dark: '#6E3F52', darkAmt: 0.3, light: '#FFEFC9', lightAmt: 0.22 };
/** Inner markings go muddy at full strength; they are already a light tint. */
const SOFT = 0.45;

export type Ellipse = { cx: number; cy: number; rx: number; ry: number; rot?: number };
export type Circle = { cx: number; cy: number; r: number };

type Common = {
	fill: string;
	/** Take part in the posterised shading. Small features look like noise if they do. */
	shade?: boolean;
	/** Shade at reduced strength, for inner markings sitting on an already-shaded body. */
	soft?: boolean;
	op?: number;
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
			rx?: number;
			rot?: number;
			cx?: number;
			cy?: number;
	  } & Common)
	| { k: 'line'; d: string; color: string; w: number; cap?: 'round' | 'butt' };

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

function shapeEl(prim: Prim, fill: string, attrs = ''): string {
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
			const cx = prim.cx ?? prim.x + prim.w / 2;
			const cy = prim.cy ?? prim.y + prim.h / 2;
			const t = prim.rot ? ` transform="rotate(${prim.rot} ${cx} ${cy})"` : '';
			return `<rect x="${prim.x}" y="${prim.y}" width="${prim.w}" height="${prim.h}" rx="${prim.rx ?? 0}"${t} fill="${fill}" ${attrs}/>`;
		}
		default:
			return '';
	}
}

function renderPrim(prim: Prim, uid: string, n: number): string {
	if (prim.k === 'line') {
		return `<path d="${prim.d}" fill="none" stroke="${prim.color}" stroke-width="${prim.w}" stroke-linecap="${prim.cap ?? 'round'}" stroke-linejoin="round"/>`;
	}
	const attrs = prim.op !== undefined ? `opacity="${prim.op}"` : '';
	if (!prim.shade) return shapeEl(prim, prim.fill, attrs);

	const k = prim.soft ? SOFT : 1;
	const dark = mix(prim.fill, SHADE.dark, SHADE.darkAmt * k);
	const light = mix(prim.fill, SHADE.light, SHADE.lightAmt * k);
	const cid = `c-${uid}-${n}`;
	return (
		`<clipPath id="${cid}">${shapeEl(prim, '#000')}</clipPath>` +
		`<g clip-path="url(#${cid})"${attrs ? ' ' + attrs : ''}>` +
		`<rect x="0" y="0" width="${BOX.w}" height="${BOX.h}" fill="${dark}"/>` +
		`<circle cx="${LIGHT.cx}" cy="${LIGHT.cy}" r="${LIGHT.rBase}" fill="${prim.fill}"/>` +
		`<circle cx="${LIGHT.cx}" cy="${LIGHT.cy}" r="${LIGHT.rLight}" fill="${light}"/>` +
		`</g>`
	);
}

let seq = 0;

/** Self-contained SVG markup for one subject, `size` px wide. */
export function draw(name: string, prims: Prim[], backdrop: string, size: number): string {
	const uid = `${name}-${seq++}`;
	const body = prims.map((prim, i) => renderPrim(prim, uid, i)).join('');
	return (
		`<svg viewBox="0 0 200 210" width="${size}" height="${Math.round(size * 1.05)}" role="img" aria-label="${name}">` +
		`<circle cx="100" cy="102" r="104" fill="${backdrop}"/>${body}</svg>`
	);
}

// Stroke data for every glyph the app teaches.
//
// A glyph is nothing but an ordered list of SVG path strings, one per stroke,
// written in the order and the direction a child is taught to form it (simple
// block print, Zaner-Bloser style manuscript). Everything else the tracing
// engine needs -- length, sample points, the start point, the initial tangent
// the arrow points along -- is derived at runtime from the browser's own path
// geometry, so nothing here is hand-measured.
//
// Shared box, `viewBox="0 0 100 140"`, laid out like a handwriting guide:
//
//     y =  10   cap / ascender line
//     y =  60   midline (top of the x-height)
//     y = 110   baseline
//     y = 138   descender
//
// A stroke shorter than DOT_LENGTH (the tittle on i and j) is a dot: it renders
// as a round cap and completes on a tap rather than a drag.

export const GUIDE = { cap: 10, mid: 60, base: 110, desc: 138 } as const;
export const DOT_LENGTH = 6;

export type StrokeSet = 'upper' | 'lower' | 'digits';

export const UPPER: Record<string, string[]> = {
	A: ['M50 10 L22 110', 'M50 10 L78 110', 'M32 76 L68 76'],
	B: [
		'M26 10 L26 110',
		'M26 10 L54 10 C74 10 74 58 54 58 L26 58',
		'M26 58 L58 58 C80 58 80 110 58 110 L26 110'
	],
	C: ['M74 32 C62 10 20 14 20 60 C20 106 62 110 74 88'],
	D: ['M26 10 L26 110', 'M26 10 L48 10 C82 10 82 110 48 110 L26 110'],
	E: ['M26 10 L26 110', 'M26 10 L72 10', 'M26 60 L64 60', 'M26 110 L72 110'],
	F: ['M26 10 L26 110', 'M26 10 L72 10', 'M26 60 L64 60'],
	G: ['M74 32 C62 10 20 14 20 60 C20 106 62 110 74 88 L74 66', 'M74 66 L52 66'],
	H: ['M24 10 L24 110', 'M76 10 L76 110', 'M24 60 L76 60'],
	I: ['M50 10 L50 110', 'M30 10 L70 10', 'M30 110 L70 110'],
	J: ['M62 10 L62 86 C62 110 30 112 24 92'],
	K: ['M26 10 L26 110', 'M74 10 L26 62', 'M26 62 L76 110'],
	L: ['M28 10 L28 110', 'M28 110 L72 110'],
	M: ['M22 10 L22 110', 'M22 10 L50 66', 'M50 66 L78 10', 'M78 10 L78 110'],
	N: ['M24 10 L24 110', 'M24 10 L76 110', 'M76 10 L76 110'],
	O: ['M50 10 C26 10 18 34 18 60 C18 86 26 110 50 110 C74 110 82 86 82 60 C82 34 74 10 50 10 Z'],
	P: ['M26 10 L26 110', 'M26 10 L54 10 C76 10 76 62 54 62 L26 62'],
	Q: [
		'M50 10 C26 10 18 34 18 60 C18 86 26 110 50 110 C74 110 82 86 82 60 C82 34 74 10 50 10 Z',
		'M58 88 L84 118'
	],
	R: ['M26 10 L26 110', 'M26 10 L54 10 C76 10 76 62 54 62 L26 62', 'M26 62 L76 110'],
	S: ['M74 30 C68 10 30 8 26 32 C22 56 74 62 76 86 C78 110 34 112 24 92'],
	T: ['M50 10 L50 110', 'M24 10 L76 10'],
	U: ['M22 10 L22 78 C22 104 78 104 78 78 L78 10'],
	V: ['M22 10 L50 110', 'M50 110 L78 10'],
	W: ['M18 10 L34 110', 'M34 110 L50 34', 'M50 34 L66 110', 'M66 110 L82 10'],
	X: ['M24 10 L76 110', 'M76 10 L24 110'],
	Y: ['M24 10 L50 62', 'M76 10 L50 62', 'M50 62 L50 110'],
	Z: ['M24 10 L76 10 L24 110 L76 110']
};

export const LOWER: Record<string, string[]> = {
	a: ['M66 72 C58 58 32 58 32 85 C32 112 58 112 66 98', 'M66 60 L66 110'],
	b: ['M28 10 L28 110', 'M28 85 C28 62 76 62 76 85 C76 108 28 108 28 85'],
	c: ['M70 74 C62 58 30 58 30 85 C30 112 62 112 70 96'],
	d: ['M74 72 C66 58 30 58 30 85 C30 112 66 112 74 98', 'M74 10 L74 110'],
	e: ['M28 86 L72 86 C72 62 32 58 30 85 C28 112 58 114 70 100'],
	f: ['M72 30 C72 12 40 6 38 34 L38 110', 'M22 66 L58 66'],
	g: ['M70 72 C62 58 30 58 30 85 C30 112 62 112 70 98', 'M70 60 L70 122 C70 140 40 140 34 130'],
	h: ['M28 10 L28 110', 'M28 84 C28 62 74 62 74 84 L74 110'],
	i: ['M50 60 L50 110', 'M50 40 L50 41'],
	j: ['M56 60 L56 122 C56 140 26 140 20 130', 'M56 40 L56 41'],
	k: ['M28 10 L28 110', 'M72 60 L28 88', 'M28 88 L74 110'],
	l: ['M50 10 L50 110'],
	m: ['M28 60 L28 110', 'M28 76 C28 58 50 58 50 76 L50 110', 'M50 76 C50 58 72 58 72 76 L72 110'],
	n: ['M30 60 L30 110', 'M30 76 C30 58 72 58 72 76 L72 110'],
	o: ['M50 58 C34 58 24 70 24 85 C24 100 34 112 50 112 C66 112 76 100 76 85 C76 70 66 58 50 58 Z'],
	p: ['M28 60 L28 138', 'M28 84 C28 62 76 62 76 84 C76 106 28 106 28 84'],
	q: ['M70 72 C62 58 30 58 30 85 C30 112 62 112 70 98', 'M70 60 L70 138'],
	r: ['M32 60 L32 110', 'M32 76 C32 62 56 58 68 64'],
	s: ['M68 70 C62 56 32 56 32 72 C32 88 68 84 68 100 C68 116 36 116 30 104'],
	t: ['M50 20 L50 98 C50 112 68 112 74 104', 'M28 60 L72 60'],
	u: ['M28 60 L28 92 C28 112 72 112 72 92 L72 60', 'M72 60 L72 110'],
	v: ['M28 60 L50 110', 'M50 110 L72 60'],
	w: ['M24 60 L38 110', 'M38 110 L50 74', 'M50 74 L62 110', 'M62 110 L76 60'],
	x: ['M28 60 L72 110', 'M72 60 L28 110'],
	y: ['M28 60 L50 108', 'M74 60 L44 138'],
	z: ['M28 60 L72 60 L28 110 L72 110']
};

export const DIGITS: Record<string, string[]> = {
	'0': ['M50 10 C28 10 20 32 20 60 C20 88 28 110 50 110 C72 110 80 88 80 60 C80 32 72 10 50 10 Z'],
	'1': ['M32 30 L50 12', 'M50 12 L50 110'],
	'2': ['M24 34 C26 12 66 6 72 30 C78 54 40 76 22 110 L78 110'],
	'3': ['M24 28 C32 8 72 12 70 36 C68 56 48 60 44 60 C48 60 74 62 74 86 C74 112 30 114 22 92'],
	'4': ['M60 10 L20 76 L80 76', 'M60 10 L60 110'],
	'5': ['M34 12 L28 52 C48 40 76 52 76 80 C76 108 38 116 24 96', 'M34 12 L72 12'],
	'6': [
		'M68 18 C50 10 26 32 24 70 C22 96 38 112 54 112 C70 112 80 100 80 86 C80 70 64 60 48 64 C36 67 27 74 24 84'
	],
	'7': ['M22 12 L78 12 L44 110'],
	'8': ['M50 60 C26 56 24 14 50 12 C76 14 74 56 50 60 C22 64 18 108 50 110 C82 108 78 64 50 60 Z'],
	'9': [
		'M70 34 C70 18 56 10 44 14 C30 18 24 32 28 44 C32 57 48 63 60 57 C66 54 70 46 70 38 L70 110'
	]
};

export const SETS: Record<StrokeSet, Record<string, string[]>> = {
	upper: UPPER,
	lower: LOWER,
	digits: DIGITS
};

export const SET_LABELS: Record<StrokeSet, string> = {
	upper: 'ABC',
	lower: 'abc',
	digits: '123'
};

/**
 * Presentation orders. `alpha` is what a parent expects; `easy` groups by motor
 * difficulty the way Handwriting Without Tears does -- straight lines first,
 * then curves, diagonals last -- so a child succeeds sooner.
 */
export const ORDERS: Record<StrokeSet, { alpha: string[]; easy: string[] }> = {
	upper: {
		alpha: [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'],
		easy: [...'LFEHTIUCOQGSJRBPDAKMNVWXYZ']
	},
	lower: {
		alpha: [...'abcdefghijklmnopqrstuvwxyz'],
		easy: [...'cosvwtadguielkyjprnmhbfqxz']
	},
	digits: {
		alpha: [...'0123456789'],
		easy: [...'1740235698']
	}
};

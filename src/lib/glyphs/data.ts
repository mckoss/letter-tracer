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
	C: ['M71 22 A 32 50 0 1 0 71 98'],
	D: ['M26 10 L26 110', 'M26 10 L48 10 C82 10 82 110 48 110 L26 110'],
	E: ['M26 10 L26 110', 'M26 10 L72 10', 'M26 60 L64 60', 'M26 110 L72 110'],
	F: ['M26 10 L26 110', 'M26 10 L72 10', 'M26 60 L64 60'],
	G: ['M71 22 A 32 50 0 1 0 71 98 L71 66', 'M71 66 L49 66'],
	H: ['M24 10 L24 110', 'M76 10 L76 110', 'M24 60 L76 60'],
	I: ['M50 10 L50 110', 'M30 10 L70 10', 'M30 110 L70 110'],
	J: ['M62 10 L62 84 A 19 26 0 0 1 24 84'],
	K: ['M26 10 L26 110', 'M74 10 L26 62', 'M26 62 L76 110'],
	L: ['M28 10 L28 110', 'M28 110 L72 110'],
	M: ['M22 10 L22 110', 'M22 10 L50 66', 'M50 66 L78 10', 'M78 10 L78 110'],
	N: ['M24 10 L24 110', 'M24 10 L76 110', 'M76 10 L76 110'],
	O: ['M50 10 C32 10 18 32 18 60 C18 88 32 110 50 110 C68 110 82 88 82 60 C82 32 68 10 50 10 Z'],
	P: ['M26 10 L26 110', 'M26 10 L54 10 C76 10 76 62 54 62 L26 62'],
	Q: [
		'M50 10 C32 10 18 32 18 60 C18 88 32 110 50 110 C68 110 82 88 82 60 C82 32 68 10 50 10 Z',
		'M58 88 L84 118'
	],
	R: ['M26 10 L26 110', 'M26 10 L54 10 C76 10 76 62 54 62 L26 62', 'M26 62 L76 110'],
	S: ['M74 30 C68 4 30 2 26 32 C22 56 74 62 76 86 C78 116 34 118 24 92'],
	T: ['M50 10 L50 110', 'M24 10 L76 10'],
	U: ['M22 10 L22 78 A 28 32 0 0 0 78 78 L78 10'],
	V: ['M22 10 L50 110', 'M50 110 L78 10'],
	W: ['M18 10 L34 110', 'M34 110 L50 34', 'M50 34 L66 110', 'M66 110 L82 10'],
	X: ['M24 10 L76 110', 'M76 10 L24 110'],
	Y: ['M24 10 L50 62', 'M76 10 L50 62', 'M50 62 L50 110'],
	Z: ['M24 10 L76 10 L24 110 L76 110']
};

export const LOWER: Record<string, string[]> = {
	a: ['M66 72 C58 58 32 58 32 85 C32 112 58 112 66 98', 'M66 60 L66 110'],
	b: ['M28 10 L28 110', 'M28 85 C28 53 76 53 76 85 C76 117 28 117 28 85'],
	c: ['M66 66 A 25 25 0 1 0 66 104'],
	d: ['M74 72 C66 58 30 58 30 85 C30 112 66 112 74 98', 'M74 10 L74 110'],
	e: ['M28 86 L72 86 C72 52 32 46 30 85 C28 116 58 118 70 100'],
	f: ['M72 30 C72 6 40 0 38 34 L38 110', 'M22 66 L58 66'],
	g: ['M70 72 C62 58 30 58 30 85 C30 112 62 112 70 98', 'M70 60 L70 122 C70 140 40 140 34 130'],
	h: ['M28 10 L28 110', 'M28 84 C28 62 74 62 74 84 L74 110'],
	i: ['M50 60 L50 110', 'M50 40 L50 41'],
	j: ['M56 60 L56 122 C56 140 26 140 20 130', 'M56 40 L56 41'],
	k: ['M28 10 L28 110', 'M72 60 L28 88', 'M28 88 L74 110'],
	l: ['M50 10 L50 110'],
	m: ['M28 60 L28 110', 'M28 76 C28 58 50 58 50 76 L50 110', 'M50 76 C50 58 72 58 72 76 L72 110'],
	n: ['M30 60 L30 110', 'M30 76 C30 58 72 58 72 76 L72 110'],
	o: ['M50 58 C34 58 24 70 24 85 C24 100 34 112 50 112 C66 112 76 100 76 85 C76 70 66 58 50 58 Z'],
	p: ['M28 60 L28 138', 'M28 85 C28 53 76 53 76 85 C76 117 28 117 28 85'],
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
	'0': ['M50 10 C33 10 20 32 20 60 C20 88 33 110 50 110 C67 110 80 88 80 60 C80 32 67 10 50 10 Z'],
	// No flag: US manuscript (Zaner-Bloser, D'Nealian, Handwriting Without Tears)
	// all teach 1 as a single line down. The flag is a European handwriting
	// convention -- restore it as a first stroke 'M32 30 L50 12' if that is wanted.
	'1': ['M50 10 L50 110'],
	'2': ['M24 34 C26 6 66 0 72 30 C78 54 40 76 22 110 L78 110'],
	'3': ['M24 28 C32 0 72 4 70 36 C68 56 48 60 44 60 C48 60 74 62 74 86 C74 116 30 118 22 92'],
	'4': ['M60 10 L20 76 L80 76', 'M60 10 L60 110'],
	'5': ['M34 10 L28 52 C48 40 76 52 76 80 C76 112 38 120 24 96', 'M34 10 L72 10'],
	'6': [
		'M68 12 C48 4 26 30 24 70 C22 96 38 112 54 112 C70 112 80 100 80 86 C80 70 64 60 48 64 C36 67 27 74 24 84'
	],
	'7': ['M22 10 L78 10 L44 110'],
	'8': ['M50 10 C21 10 21 54 50 54 C13 54 13 110 50 110 C87 110 87 54 50 54 C79 54 79 10 50 10 Z'],
	'9': ['M70 34 C70 14 56 6 44 10 C30 14 24 30 28 44 C32 57 48 63 60 57 C66 54 70 46 70 38 L70 110']
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

/** Presentation order for each set. */
export const ORDER: Record<StrokeSet, string[]> = {
	upper: [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'],
	lower: [...'abcdefghijklmnopqrstuvwxyz'],
	digits: [...'0123456789']
};

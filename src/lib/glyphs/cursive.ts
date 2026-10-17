// Cursive letterforms: the joined hand taught in American elementary schools
// through the second half of the 20th century -- the Zaner-Bloser / Palmer
// alphabet on the green strip above the blackboard.
//
// Same rules as the manuscript set in `data.ts`: one SVG path per stroke, in
// the order and direction a child is taught to form it, on the same ruled box.
// The difference is that a cursive letter is mostly one stroke. Every lowercase
// letter begins with its lead-in on the baseline and ends with the stroke that
// would carry on into the next letter, and both belong to the letter: that is
// how the alphabet is taught, one letter at a time, lead-in and all. Lifts are
// left for what really comes after the letter -- the dot on i and j, the cross
// on t and x, the bar of F.
//
// The paths below are drawn upright and given the forward slant of the
// handwriting by `slant`, which shears every point about the baseline region.
// A shear is affine, so it maps a cubic Bezier exactly onto the cubic through
// its sheared control points -- only M, L, C and Z are used, so that holds.
//
// The first stroke of every lowercase letter runs lead-in to exit, which is
// what lets `GlyphWord` join a word up. Capitals that join the next letter say
// which of their strokes carries the exit in JOINS; the rest stand apart, as
// D, F, O, P and friends do on the chart.

/** Forward slant, as run over rise. About 11 degrees off the vertical. */
export const SLANT = 0.2;
/** The height the shear pivots on, so letters lean about their middle. */
const PIVOT = 84;

/** Lean an upright path forward, and shift it `dx`. Absolute M, L, C and Z only. */
export function slant(d: string, dx = 0): string {
	const out: string[] = [];
	const nums: number[] = [];
	const flush = () => {
		for (let i = 0; i + 1 < nums.length; i += 2) {
			const x = nums[i] + (PIVOT - nums[i + 1]) * SLANT + dx;
			out.push(`${+x.toFixed(2)} ${nums[i + 1]}`);
		}
		nums.length = 0;
	};
	for (const tok of d.match(/[MLCZ]|-?\d*\.?\d+/g) ?? []) {
		if (/[MLCZ]/.test(tok)) {
			flush();
			out.push(tok);
		} else nums.push(Number(tok));
	}
	flush();
	return out.join(' ');
}

const lean = (glyphs: Record<string, string[]>, dx = 0) =>
	Object.fromEntries(Object.entries(glyphs).map(([k, v]) => [k, v.map((d) => slant(d, dx))]));

// Lowercase. Every first stroke starts on the baseline at the left and ends on
// the right with the exit: an upswing off the baseline for most letters, a
// bridge along the midline for b, o, v and w.
const LOWER_UPRIGHT: Record<string, string[]> = {
	a: [
		'M14 110 C16 84 32 60 54 61 C46 57 29 61 28 84 C27 104 36 111 44 110 C52 109 58 98 58 84 L58 60 L58 102 C58 112 72 112 84 94'
	],
	b: [
		'M12 110 C30 110 52 60 52 30 C52 14 46 8 40 12 C34 18 34 40 35 60 L37 100 C39 114 60 114 62 82 C63 70 60 62 58 62 C56 66 62 68 84 60'
	],
	c: [
		'M14 110 C16 84 32 60 50 61 C58 60 60 68 54 70 C46 61 30 63 28 86 C26 106 40 112 50 110 C60 108 70 100 82 92'
	],
	d: [
		'M14 110 C16 84 32 60 54 61 C46 57 29 61 28 84 C27 104 36 111 44 110 C52 109 58 98 58 84 L58 16 L58 102 C58 112 72 112 84 94'
	],
	e: [
		'M12 110 C30 110 54 92 54 74 C54 62 46 58 41 60 C33 64 30 82 32 94 C34 108 44 112 54 110 C64 108 72 100 82 92'
	],
	f: [
		'M12 110 C30 110 52 60 52 30 C52 14 46 8 40 12 C34 18 34 40 35 60 L36 126 C36 140 46 141 48 132 C50 122 44 113 36 110 C50 108 66 104 82 94'
	],
	g: [
		'M14 110 C16 84 32 60 54 61 C46 57 29 61 28 84 C27 104 36 111 44 110 C52 109 58 98 58 84 L58 60 L58 124 C58 142 36 144 38 130 C40 118 56 112 82 98'
	],
	h: [
		'M12 110 C30 110 52 60 52 30 C52 14 46 8 40 12 C34 18 34 40 35 60 L36 110 L36 84 C36 66 46 60 54 60 C60 60 63 64 63 70 L63 100 C63 113 76 114 86 94'
	],
	i: ['M14 110 C26 110 36 88 40 60 L40 100 C40 114 58 114 68 94', 'M40 40 L40 41'],
	j: [
		'M14 110 C26 110 36 88 40 60 L40 124 C40 142 20 144 22 130 C24 118 40 112 66 98',
		'M40 40 L40 41'
	],
	k: [
		'M12 110 C30 110 52 60 52 30 C52 14 46 8 40 12 C34 18 34 40 35 60 L36 110 L36 88 C38 66 62 60 62 72 C62 82 48 86 40 86 C48 88 54 96 56 102 C58 112 72 112 86 94'
	],
	l: [
		'M12 110 C30 110 52 60 52 30 C52 14 46 8 40 12 C34 18 34 40 35 60 L37 100 C38 112 56 114 66 102 C70 98 74 96 78 92'
	],
	m: [
		'M10 110 C10 84 20 60 28 60 C32 60 34 64 34 70 L34 110 L34 80 C34 64 42 60 48 60 C53 60 55 64 55 70 L55 110 L55 80 C55 64 63 60 69 60 C74 60 76 64 76 70 L76 100 C76 113 86 114 94 96'
	],
	n: [
		'M14 110 C14 84 24 60 34 60 C38 60 40 64 40 70 L40 110 L40 80 C40 64 50 60 58 60 C64 60 66 64 66 70 L66 100 C66 113 78 114 88 94'
	],
	o: [
		'M14 110 C16 84 32 60 54 61 C46 57 29 61 28 84 C27 104 36 111 44 110 C52 109 58 98 58 84 C58 72 56 64 54 62 C52 68 62 68 82 60'
	],
	p: [
		'M14 110 C26 110 34 86 36 60 L36 138 L36 84 C36 66 46 60 54 60 C64 60 68 72 66 88 C64 104 52 112 38 108 C52 112 70 108 84 94'
	],
	q: [
		'M14 110 C16 84 32 60 54 61 C46 57 29 61 28 84 C27 104 36 111 44 110 C52 109 58 98 58 84 L58 60 L58 128 C58 140 67 140 69 130 C71 120 64 112 58 110 C66 108 74 104 86 94'
	],
	r: ['M14 110 C26 110 36 82 40 54 C44 62 48 64 54 62 L54 100 C54 113 68 114 82 94'],
	s: [
		'M14 110 C26 110 36 82 40 56 C52 74 62 90 54 104 C48 112 36 112 32 104 C38 110 48 112 56 110 C66 106 74 100 82 94'
	],
	t: ['M14 110 C30 110 40 70 42 24 L42 102 C42 113 58 114 72 94', 'M26 56 L64 56'],
	u: ['M12 110 C22 110 28 88 30 60 L30 100 C30 114 52 112 56 60 L56 100 C56 114 74 114 84 94'],
	v: [
		'M14 110 C14 84 26 60 38 60 C42 60 44 64 44 70 L44 100 C44 113 60 114 66 60 C66 66 74 66 88 60'
	],
	w: [
		'M10 110 C20 110 26 88 28 60 L28 98 C28 113 44 113 46 60 L46 98 C46 113 62 113 66 60 C66 66 74 66 90 60'
	],
	x: [
		'M14 110 C14 84 26 60 38 60 C44 60 46 66 48 74 L52 98 C54 112 70 112 82 96',
		'M64 60 L36 110'
	],
	y: [
		'M14 110 C14 84 24 60 34 60 C38 60 40 64 40 70 L40 100 C40 113 60 114 64 60 L64 126 C64 142 44 144 46 130 C48 118 64 110 84 98'
	],
	z: [
		'M14 110 C14 84 24 60 36 60 C50 60 56 68 50 84 C46 96 38 106 36 108 C50 104 60 114 58 124 C56 136 44 142 40 134 C36 124 56 112 82 100'
	]
};

// Capitals. They begin where the chart begins them -- mostly at or near the
// top -- and the ones that join end on an upswing off the baseline.
const UPPER_UPRIGHT: Record<string, string[]> = {
	A: [
		'M56 14 C40 4 18 22 18 62 C18 100 36 112 46 106 C56 100 64 60 64 10 L64 102 C64 113 78 114 90 94'
	],
	B: [
		'M30 10 L30 110 L30 10 C66 4 70 52 36 58 C30 60 30 54 36 56 C76 56 76 112 40 110 C24 110 16 102 22 98 C28 94 38 100 46 104'
	],
	C: [
		'M58 24 C56 14 64 8 68 14 C70 20 64 22 58 18 C50 8 30 8 22 30 C14 56 18 98 38 108 C52 114 70 106 84 92'
	],
	D: [
		'M40 10 L34 106 C32 116 18 112 20 104 C22 96 40 110 54 110 C80 110 86 70 84 46 C82 20 60 6 40 10 C30 12 26 22 34 26 C42 30 52 20 58 14'
	],
	E: [
		'M62 20 C60 10 42 6 34 18 C28 30 32 50 44 56 C50 59 46 64 40 63 C34 62 35 56 42 57 C26 60 16 82 22 98 C28 112 56 114 72 104 C80 98 86 94 90 90'
	],
	F: [
		'M56 14 C54 50 50 92 42 104 C36 112 24 112 20 100',
		'M16 20 C32 6 50 22 66 12 C74 8 82 8 88 12',
		'M36 62 L72 60'
	],
	G: [
		'M20 104 C30 70 50 14 62 12 C70 10 70 22 60 30 C52 38 42 52 38 60 C50 52 70 52 70 74 C70 100 52 112 40 110 C28 108 24 100 26 94 C30 88 40 96 46 100'
	],
	H: [
		'M14 24 C16 12 32 6 34 18 L32 110',
		'M74 12 C66 8 64 16 64 24 L62 110 L63 70 C50 56 34 54 34 62 C34 70 56 68 82 58'
	],
	I: [
		'M20 60 C24 30 44 6 60 10 C66 12 66 20 62 30 L48 100 C44 112 26 114 22 104 C18 94 32 92 44 96'
	],
	J: [
		'M18 100 C30 92 54 40 56 18 C58 6 46 6 46 18 L46 120 C46 140 28 142 30 128 C32 116 46 110 70 98'
	],
	K: [
		'M14 24 C16 12 32 6 34 18 L32 110',
		'M72 12 C60 30 44 56 36 62 C44 60 52 68 56 84 C60 100 64 112 74 108 C80 106 84 100 88 94'
	],
	L: [
		'M42 52 C40 30 54 10 66 10 C74 10 74 22 66 32 C56 46 46 80 36 104 C32 112 20 114 18 106 C16 98 30 98 40 104 C52 110 70 112 88 98'
	],
	M: [
		'M12 28 C16 14 28 8 30 18 L28 110 L30 70 C34 30 42 12 50 12 C56 12 56 20 54 30 L50 110 L54 66 C58 30 66 12 74 12 C80 12 80 20 78 30 L74 100 C72 112 82 114 92 100'
	],
	N: [
		'M16 28 C20 14 32 8 34 18 L32 110 L34 70 C40 30 52 12 60 12 C66 12 66 20 64 30 L60 100 C58 112 70 114 84 98'
	],
	O: [
		'M52 12 C30 8 18 36 18 62 C18 92 32 110 48 110 C66 110 78 88 76 58 C74 30 62 12 50 12 C40 14 42 28 54 24 C62 22 70 16 78 14'
	],
	P: ['M32 10 L30 110 L32 10 C60 4 76 18 72 38 C68 56 48 62 32 58'],
	Q: [
		'M24 36 C22 16 40 6 54 10 C72 16 70 46 56 66 C46 82 30 100 24 106 C18 112 22 116 28 112 C36 106 42 104 52 108 C62 112 74 108 86 98'
	],
	R: [
		'M32 10 L30 110 L32 10 C60 4 76 18 72 34 C68 50 50 58 36 58 C32 58 32 54 36 54 C44 56 50 66 54 84 C58 102 64 112 74 108 C80 106 84 100 88 94'
	],
	S: [
		'M22 100 C36 92 52 60 56 10 C46 28 42 44 54 56 C76 72 90 100 62 109 C48 115 28 111 26 102 C24 94 36 94 42 102'
	],
	T: [
		'M56 14 C54 50 50 92 42 104 C36 112 24 112 20 100',
		'M16 20 C32 6 50 22 66 12 C74 8 82 8 88 12'
	],
	U: ['M14 24 C16 12 32 6 34 18 L32 88 C30 112 60 114 64 80 L66 12 L62 100 C60 112 74 114 88 96'],
	V: ['M14 24 C16 12 32 6 34 18 C36 50 38 84 44 108 C50 80 60 30 72 12 C76 8 82 8 86 12'],
	W: [
		'M10 24 C12 12 26 6 28 18 L30 104 C32 112 42 112 46 100 L52 30 L56 104 C58 112 68 110 72 96 C76 70 80 30 82 14 C84 8 90 8 94 12'
	],
	X: ['M14 24 C16 12 30 8 36 16 C42 26 50 80 56 102 C58 112 72 112 84 98', 'M70 12 L22 110'],
	Y: [
		'M14 24 C16 12 32 6 34 18 L32 64 C30 92 60 94 62 50 L64 12 L60 124 C58 142 38 144 40 130 C42 118 56 112 84 98'
	],
	Z: [
		'M18 20 C24 8 56 6 62 14 C68 24 46 70 30 102 C40 98 58 102 58 116 C58 132 46 142 40 132 C34 122 58 112 84 98'
	]
};

// Capitals lean further out of the box than the x-height letters do, so they
// come back a little to sit in the middle of it.
export const CURSIVE_UPPER: Record<string, string[]> = lean(UPPER_UPRIGHT, -6);
export const CURSIVE_LOWER: Record<string, string[]> = lean(LOWER_UPRIGHT);

/**
 * Capitals that join the letter after them, and which stroke carries the exit.
 * Every lowercase letter joins, always from its first stroke.
 */
export const JOINS: Record<string, number> = {
	A: 0,
	C: 0,
	E: 0,
	J: 0,
	K: 1,
	L: 0,
	M: 0,
	N: 0,
	Q: 0,
	R: 0,
	U: 0,
	X: 0,
	Y: 0,
	Z: 0
};

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
		'M 14.8 110 C 17.2 84 36.4 60 62.8 61 C 53.2 57 32.8 61 31.6 84 C 30.4 104 41.2 111 50.8 110 C 60.4 109 67.6 98 67.6 84 L 67.6 60 L 67.6 102 C 67.6 112 84.4 112 98.8 94'
	],
	b: [
		'M12 110 C30 110 52 60 52 30 C52 14 46 8 40 12 C34 18 34 40 35 60 L37 100 C39 114 60 114 62 82 C63 70 60 62 58 62 C56 66 62 68 84 60'
	],
	c: [
		'M 14.8 110 C 17.2 84 36.4 60 58 61 C 67.6 60 70 68 62.8 70 C 53.2 61 34 63 31.6 86 C 29.2 106 46 112 58 110 C 70 108 82 100 96.4 92'
	],
	d: [
		'M 14.8 110 C 17.2 84 36.4 60 62.8 61 C 53.2 57 32.8 61 31.6 84 C 30.4 104 41.2 111 50.8 110 C 60.4 109 67.6 98 67.6 84 L 67.6 16 L 67.6 102 C 67.6 112 84.4 112 98.8 94'
	],
	e: [
		'M12 110 C30 110 54 92 54 74 C54 62 46 58 41 60 C33 64 30 82 32 94 C34 108 44 112 54 110 C64 108 72 100 82 92'
	],
	f: [
		'M12 110 C30 110 52 60 52 30 C52 14 46 8 40 12 C34 18 34 40 35 60 L36 126 C36 140 46 141 48 132 C50 122 44 113 36 110 C50 108 66 104 82 94'
	],
	g: [
		'M 14.8 110 C 17.2 84 36.4 60 62.8 61 C 53.2 57 32.8 61 31.6 84 C 30.4 104 41.2 111 50.8 110 C 60.4 109 67.6 98 67.6 84 L 67.6 60 L 67.6 124 C 67.6 142 41.2 144 43.6 130 C 46 118 65.2 112 96.4 98'
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
		'M6 110 C8 84 16 60 26 60 C32 60 34 66 34 72 L34 110 L34 80 C34 64 44 60 52 60 C58 60 60 66 60 72 L60 110 L60 80 C60 64 70 60 78 60 C84 60 86 66 86 72 L86 100 C86 113 96 114 104 96'
	],
	n: [
		'M10 110 C12 84 22 60 34 60 C40 60 42 66 42 72 L42 110 L42 80 C42 64 54 60 64 60 C72 60 74 66 74 72 L74 100 C74 113 86 114 96 94'
	],
	o: [
		'M 14.8 110 C 17.2 84 36.4 60 62.8 61 C 53.2 57 32.8 61 31.6 84 C 30.4 104 41.2 111 50.8 110 C 60.4 109 67.6 98 67.6 84 C 67.6 72 65.2 64 62.8 62 C 60.4 68 72.4 68 96.4 60'
	],
	p: [
		'M14 110 C26 110 34 86 36 60 L36 138 L36 84 C36 66 46 60 54 60 C64 60 68 72 66 88 C64 104 52 112 38 108 C52 112 70 108 84 94'
	],
	q: [
		'M 14.8 110 C 17.2 84 36.4 60 62.8 61 C 53.2 57 32.8 61 31.6 84 C 30.4 104 41.2 111 50.8 110 C 60.4 109 67.6 98 67.6 84 L 67.6 60 L 67.6 128 C 67.6 140 78.4 140 80.8 130 C 83.2 120 74.8 112 67.6 110 C 77.2 108 86.8 104 101.2 94'
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
		'M60 14 C40 2 10 24 10 64 C10 100 30 114 44 106 C58 98 68 60 70 10 L70 102 C70 113 84 114 96 94'
	],
	B: [
		'M30 10 L30 110 L30 10 C66 4 70 52 36 58 C30 60 30 54 36 56 C76 56 76 112 40 110 C30 110 24 106 24 100 C24 94 32 92 40 92 C48 92 54 92 60 92'
	],
	C: ['M66 20 C64 12 60 9 54 9 C34 9 18 32 18 62 C18 94 32 111 50 110 C64 109 74 102 84 92'],
	D: [
		'M40 10 L34 106 C32 116 18 112 20 104 C22 96 40 110 54 110 C80 110 86 70 84 46 C82 20 60 6 40 10 C30 12 26 22 34 26 C44 30 66 16 92 10'
	],
	E: [
		'M62 20 C60 10 42 6 34 18 C28 30 32 50 44 56 C50 59 46 64 40 63 C34 62 35 56 42 57 C26 60 16 82 22 98 C28 112 56 114 72 104 C80 98 86 94 90 90'
	],
	// F and T share a stem and a cap: the stem's tail sweeps out left along the
	// baseline and turns back, and the bar of F crosses the stem on the midline.
	F: [
		'M56 12 C54 44 52 80 46 98 C42 110 30 114 18 110 C8 106 6 92 14 86 C20 82 30 84 38 86',
		'M16 22 C24 12 36 10 50 11 C64 12 74 12 84 8',
		'M30 60 L76 60'
	],
	G: [
		// The lead-in runs almost flat through what will be the bowl, climbs into a
		// tall narrow loop, comes back down across itself into a wide bowl, and
		// ends rising on the right three quarters of the way up.
		'M21 110 C26 100 30 90 38 86 C50 82 62 84 67 76 C70 64 68 50 66 40 C64 26 60 12 56 11 C50 10 47 18 46 26 C45 46 40 72 32 88 C28 98 34 110 52 110 C70 110 84 104 87 86 C89 72 88 50 86 36'
	],
	H: [
		'M14 24 C16 12 32 6 34 18 L32 110',
		'M74 12 C66 8 64 16 64 24 L62 110 L63 70 C50 56 34 54 34 62 C34 70 56 68 82 58'
	],
	I: [
		'M46 82 C36 80 16 78 10 86 C4 96 18 108 36 108 C46 108 52 96 56 78 C60 56 62 30 66 16 C68 8 76 8 76 18 C76 40 72 70 70 100 C70 112 82 112 92 100'
	],
	J: [
		'M18 100 C30 92 54 40 56 18 C58 6 46 6 46 18 L46 120 C46 140 28 142 30 128 C32 116 46 110 70 98'
	],
	K: [
		'M14 24 C16 12 32 6 34 18 L32 110',
		'M72 12 C60 30 44 56 36 62 C44 60 52 68 56 84 C60 100 64 112 74 108 C80 106 84 100 88 94'
	],
	L: [
		'M36 24 C46 18 56 10 66 10 C74 10 74 22 66 32 C56 46 46 80 36 104 C32 112 20 114 18 106 C16 98 30 98 40 104 C52 110 70 112 88 98'
	],
	M: [
		'M2 30 C4 16 16 8 18 20 L16 110 L16 64 C18 30 28 10 38 10 C46 10 48 20 46 34 L46 110 L46 64 C48 30 58 10 68 10 C76 10 78 20 76 34 L76 100 C76 112 88 114 98 100'
	],
	N: [
		'M8 30 C10 16 22 8 24 20 L22 110 L22 64 C24 30 38 10 52 10 C64 10 66 20 64 34 L62 100 C62 112 76 114 90 98'
	],
	O: [
		'M54 11 C30 8 14 36 14 62 C14 92 30 110 48 110 C68 110 82 88 80 58 C78 30 64 10 50 11 C40 13 42 28 56 24 C66 21 76 16 90 14'
	],
	P: ['M32 10 L30 110 L32 10 C60 4 78 18 74 38 C70 58 42 62 18 56'],
	Q: [
		'M20 62 C18 34 32 10 54 10 C74 10 80 30 76 52 C72 76 50 98 28 108 C18 112 16 104 24 102 C36 100 50 112 66 110 C76 109 84 104 92 98'
	],
	R: [
		'M32 10 L30 110 L32 10 C60 4 76 18 72 34 C68 50 50 58 36 58 C32 58 32 54 36 54 C44 56 50 66 54 84 C58 102 64 112 74 108 C80 106 84 100 88 94'
	],
	S: [
		'M14 108 C30 100 50 88 62 70 C72 56 78 30 76 16 C74 6 66 8 66 18 C66 40 84 70 78 92 C74 108 56 114 40 110 C28 106 22 96 30 90 C38 86 52 90 62 92'
	],
	T: [
		'M56 12 C54 44 52 80 46 98 C42 110 30 114 18 110 C8 106 6 92 14 86 C20 82 30 84 38 86',
		'M16 22 C24 12 36 10 50 11 C64 12 74 12 84 8'
	],
	U: ['M12 24 C14 12 30 6 32 18 L30 86 C28 112 64 114 68 80 L70 12 L66 100 C64 112 78 114 92 96'],
	V: [
		'M14 24 C16 12 32 6 34 18 C36 46 36 80 40 98 C44 114 60 112 66 90 C70 70 72 30 74 16 C76 8 82 10 92 10'
	],
	W: [
		'M8 24 C10 12 24 6 26 18 L26 98 C26 112 44 112 46 96 L50 14 L50 98 C50 112 68 112 70 96 C72 70 74 30 76 16 C78 8 84 10 94 10'
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
	I: 0,
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

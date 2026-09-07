// One word per letter, chosen to be unambiguous to a pre-reader and drawable as
// flat vector art. Lowercase reuses the same word; only the casing changes.
// Digits get a counting scene rather than a word picture.

export const WORDS: Record<string, string> = {
	a: 'apple',
	b: 'ball',
	c: 'cat',
	d: 'dog',
	e: 'elephant',
	f: 'fish',
	g: 'goat',
	h: 'hat',
	i: 'igloo',
	j: 'juice',
	k: 'kite',
	l: 'leaf',
	m: 'moon',
	n: 'nest',
	o: 'orange',
	p: 'penguin',
	q: 'queen',
	r: 'rainbow',
	s: 'sun',
	t: 'tree',
	u: 'umbrella',
	v: 'violin',
	w: 'whale',
	x: 'xylophone',
	y: 'yoyo',
	z: 'zebra'
};

export const NUMBER_WORDS = [
	'zero',
	'one',
	'two',
	'three',
	'four',
	'five',
	'six',
	'seven',
	'eight',
	'nine'
];

/** The word shown under a glyph, cased to match the glyph itself. */
export function wordFor(char: string): string {
	const isDigit = char >= '0' && char <= '9';
	const word = isDigit ? NUMBER_WORDS[Number(char)] : WORDS[char.toLowerCase()];
	if (!word) return '';
	return char === char.toUpperCase() && !isDigit ? word.toUpperCase() : word;
}

// One word per letter, chosen to be unambiguous to a pre-reader and drawable as
// flat vector art. Lowercase reuses the same word; only the casing changes.
// Digits get a counting scene rather than a word picture.
//
// There is more than one set of these. A child who cares about nothing but
// diggers will trace more letters for a set of diggers, so the words are a
// preference (`progress.data.words`) rather than a constant. Everything
// downstream is keyed off the word rather than the set: the picture comes from
// `art(word)`, and the spoken prompt from `phraseStem` below. A word that turns
// up in two sets is drawn once and recorded once.

export type WordSet = 'general' | 'vehicles';

export const WORD_SET_KEYS: WordSet[] = ['general', 'vehicles'];

export const WORD_SET_LABELS: Record<WordSet, string> = {
	general: 'General',
	vehicles: 'Vehicles'
};

const GENERAL: Record<string, string> = {
	a: 'apple',
	b: 'blaze',
	c: 'cat',
	d: 'dog',
	e: 'elephant',
	f: 'fish',
	g: 'goat',
	h: 'hotdog',
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

// Anything with wheels, wings or a hull. N, O and X keep their general word:
// there is no vehicle for them worth the confusion, and the only Z everybody
// thinks of is a trademark, so Z gets the airship instead.
const VEHICLES: Record<string, string> = {
	a: 'ambulance',
	b: 'bus',
	c: 'car',
	d: 'dump truck',
	e: 'engine',
	f: 'firetruck',
	g: 'garbage truck',
	h: 'helicopter',
	i: 'ice cream truck',
	j: 'jet',
	k: 'kayak',
	l: 'limo',
	m: 'motorcycle',
	n: 'nest',
	o: 'orange',
	p: 'plane',
	q: 'quad',
	r: 'rocket',
	s: 'suv',
	t: 'truck',
	u: 'unicycle',
	v: 'van',
	w: 'wagon',
	x: 'xylophone',
	y: 'yacht',
	z: 'zeppelin'
};

export const WORD_SETS: Record<WordSet, Record<string, string>> = {
	general: GENERAL,
	vehicles: VEHICLES
};

/** The set named, falling back to the general one for an unknown name. */
export function wordsIn(set: WordSet): Record<string, string> {
	return WORD_SETS[set] ?? GENERAL;
}

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

/** The lowercase word for a glyph, used to look up its picture. */
export function wordKey(char: string, set: WordSet = 'general'): string {
	const isDigit = char >= '0' && char <= '9';
	return isDigit ? NUMBER_WORDS[Number(char)] : (wordsIn(set)[char.toLowerCase()] ?? '');
}

/**
 * The name of the spoken clip for a glyph: `a-apple`, `g-garbage-truck`.
 *
 * Letter and word together, because a clip is a whole sentence -- "A is for
 * apple" -- and the letter alone cannot name it once there is more than one set
 * of words. Naming it after the pair rather than filing it under its set means
 * the sets share what they have in common: nest is N in both, so `n-nest.mp3`
 * is recorded once and played by both.
 */
export function phraseStem(char: string, set: WordSet): string {
	const key = char.toLowerCase();
	const word = wordsIn(set)[key];
	return word ? `${key}-${word.replace(/[^a-z0-9]+/g, '-')}` : '';
}

/** The word shown under a glyph, cased to match the glyph itself. */
export function wordFor(char: string, set: WordSet = 'general'): string {
	const isDigit = char >= '0' && char <= '9';
	const word = isDigit ? NUMBER_WORDS[Number(char)] : wordsIn(set)[char.toLowerCase()];
	if (!word) return '';
	return char === char.toUpperCase() && !isDigit ? word.toUpperCase() : word;
}

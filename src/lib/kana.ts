// Hiragana and katakana: what each kana is called, the word it stands for, and
// where its clip lives. The words themselves are in `kana-words.json`, shared
// with `scripts/generate_tts.py` so the recordings cannot drift from the screen.
//
// Everything a child hears in these modes is Japanese -- the kana's own sound,
// then the word it belongs to, the way Japanese children learn them: あひるの あ,
// "the a of ahiru". The romaji is for the grown-up beside them who cannot read
// kana, and is only ever shown, never spoken.

import data from './kana-words.json';
import type { WordSet } from './words';

export type KanaSet = 'hiragana' | 'katakana';

export type KanaWord = {
	/** As written in the kana set in play: あひる, or ペンギン. */
	word: string;
	/** Hepburn, with macrons for long vowels: ahiru, kēki. */
	romaji: string;
	/** The picture's name in `art()`. It may not be drawn yet. */
	picture: string;
};

type Entry = Record<WordSet, [string, string, string] | null>;

const ROMAJI = data.romaji as Record<string, string>;
const WORDS = {
	hiragana: data.hiragana as unknown as Record<string, Entry>,
	katakana: data.katakana as unknown as Record<string, Entry>
};

const KATAKANA_OFFSET = 0x60;

/** あ for ア, and あ for あ: the hiragana that sounds the same. */
export function toHiragana(char: string): string {
	const cp = char.codePointAt(0) ?? 0;
	return cp >= 0x30a1 && cp <= 0x30f6 ? String.fromCodePoint(cp - KATAKANA_OFFSET) : char;
}

/** ア for あ: the katakana that sounds the same. */
export function toKatakana(char: string): string {
	const cp = char.codePointAt(0) ?? 0;
	return cp >= 0x3041 && cp <= 0x3096 ? String.fromCodePoint(cp + KATAKANA_OFFSET) : char;
}

export function kanaSetOf(char: string): KanaSet | null {
	if (char in WORDS.hiragana) return 'hiragana';
	if (char in WORDS.katakana) return 'katakana';
	return null;
}

export function isKana(char: string): boolean {
	return kanaSetOf(char) !== null;
}

/** The kana's sound in Hepburn romaji: ka, shi, tsu. Empty for anything else. */
export function romaji(char: string): string {
	return ROMAJI[toHiragana(char)] ?? '';
}

/**
 * The word for a kana in the word set asked for. A kana with no vehicle keeps
 * its general word; を has none at all, since it is only ever a particle.
 */
export function kanaWord(char: string, set: WordSet = 'general'): KanaWord | null {
	const kana = kanaSetOf(char);
	if (!kana) return null;
	const entry = WORDS[kana][char];
	const w = entry[set] ?? entry.general;
	return w ? { word: w[0], romaji: w[1], picture: w[2] } : null;
}

/** Romaji as a file name: macrons dropped, anything else to hyphens. */
export function slug(romaji: string): string {
	return romaji
		.normalize('NFD')
		.replace(/[̀-ͯ]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '');
}

/**
 * The name of the spoken clip for a kana: `a-ahiru`, `wo`. Named for the sound
 * and the word together, never the script: あ and ア sound the same, so a word
 * the two sets share -- やぎ and ヤギ -- is recorded once and played by both.
 */
export function kanaPhraseStem(char: string, set: WordSet = 'general'): string {
	const r = romaji(char);
	if (!r) return '';
	const w = kanaWord(char, set);
	return w ? `${slug(r)}-${slug(w.romaji)}` : slug(r);
}

/**
 * The 46 in gojūon order, laid out as the chart is printed: five columns, with
 * gaps where the や and わ rows have no kana. Null is a gap.
 */
export function chart(set: KanaSet): (string | null)[] {
	const hira = [
		...'あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめも',
		'や',
		null,
		'ゆ',
		null,
		'よ',
		...'らりるれろ',
		'わ',
		null,
		null,
		null,
		'を',
		'ん'
	];
	return set === 'hiragana' ? hira : hira.map((c) => (c ? toKatakana(c) : null));
}

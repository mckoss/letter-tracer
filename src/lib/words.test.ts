// A word needs three things to work: a word, a picture and a recording. Adding
// the first and forgetting the other two is silent -- the letter just comes up
// blank and says nothing -- so it is checked here instead.

import { describe, expect, test } from 'vitest';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { SUBJECT_NAMES } from './art';
import { PHRASES } from './voice-clips';
import { NUMBER_WORDS, WORD_SETS, WORD_SET_KEYS, phraseStem, wordFor, wordKey } from './words';

const LETTERS = 'abcdefghijklmnopqrstuvwxyz'.split('');
const PHRASE_DIR = fileURLToPath(new URL('../../static/sounds/voice/phrase/', import.meta.url));

describe.each(WORD_SET_KEYS)('the %s set', (set) => {
	const words = WORD_SETS[set];

	test('has a word for all 26 letters', () => {
		expect(Object.keys(words).sort()).toEqual(LETTERS);
	});

	test('has a picture for every word', () => {
		const missing = LETTERS.filter((c) => !SUBJECT_NAMES.includes(wordKey(c, set)));
		expect(missing).toEqual([]);
	});

	test('has a recording for every word, and the file is there', () => {
		const unlisted = LETTERS.filter((c) => !PHRASES.includes(phraseStem(c, set)));
		expect(unlisted).toEqual([]);
		const absent = LETTERS.filter((c) => !existsSync(`${PHRASE_DIR}${phraseStem(c, set)}.mp3`));
		expect(absent).toEqual([]);
	});

	test('starts each word with its own letter', () => {
		const wrong = LETTERS.filter((c) => !words[c].startsWith(c));
		expect(wrong).toEqual([]);
	});
});

test('every number has a counting picture', () => {
	const missing = NUMBER_WORDS.filter((w) => !SUBJECT_NAMES.includes(w));
	expect(missing).toEqual([]);
});

test('a clip is named for its letter and its word', () => {
	expect(phraseStem('A', 'general')).toBe('a-apple');
	expect(phraseStem('a', 'vehicles')).toBe('a-ambulance');
	// Two words, one file: the name has to survive the space.
	expect(phraseStem('G', 'vehicles')).toBe('g-garbage-truck');
});

test('sets share the recording for a word they have in common', () => {
	const shared = LETTERS.filter((c) => WORD_SETS.general[c] === WORD_SETS.vehicles[c]);
	expect(shared).toEqual(['n', 'o', 'x']);
	for (const c of shared) {
		expect(phraseStem(c, 'general')).toBe(phraseStem(c, 'vehicles'));
	}
});

test('every recording on disk belongs to some set', () => {
	const wanted = new Set(WORD_SET_KEYS.flatMap((s) => LETTERS.map((c) => phraseStem(c, s))));
	expect(PHRASES.filter((stem) => !wanted.has(stem))).toEqual([]);
});

test('the word follows the case of the glyph, and digits are spelled out', () => {
	expect(wordFor('A', 'vehicles')).toBe('AMBULANCE');
	expect(wordFor('a', 'vehicles')).toBe('ambulance');
	expect(wordFor('7')).toBe('seven');
});

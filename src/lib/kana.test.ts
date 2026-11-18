import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { SUBJECT_NAMES } from './art';
import { ORDER, SETS } from './glyphs/data';
import { STROKE_NUMBERS } from './glyphs/kana-strokes';
import {
	chart,
	kanaPhraseStem,
	kanaWord,
	romaji,
	slug,
	toHiragana,
	toKatakana,
	type KanaSet
} from './kana';
import { WORD_SET_KEYS } from './words';

const KANA_SETS: KanaSet[] = ['hiragana', 'katakana'];

describe('kana', () => {
	it('has the basic 46 of each, as a five-column chart', () => {
		for (const set of KANA_SETS) {
			expect(ORDER[set]).toHaveLength(46);
			expect(chart(set).length % 5).toBe(1); // ん sits alone on the last row
			expect(new Set(ORDER[set]).size).toBe(46);
		}
		expect(ORDER.katakana.map(toHiragana)).toEqual(ORDER.hiragana);
		expect(ORDER.hiragana.map(toKatakana)).toEqual(ORDER.katakana);
	});

	it('has strokes and a number for every stroke', () => {
		for (const set of KANA_SETS) {
			for (const c of ORDER[set]) {
				const strokes = SETS[set][c];
				expect(strokes?.length, c).toBeGreaterThan(0);
				expect(STROKE_NUMBERS[c], c).toHaveLength(strokes.length);
				for (const d of strokes) expect(d, c).toMatch(/^M[\d.]+ [\d.]+( C[\d. -]+)*$/);
			}
		}
	});

	it('keeps the strokes inside the square', () => {
		for (const set of KANA_SETS) {
			for (const c of ORDER[set]) {
				const nums = SETS[set][c]
					.join(' ')
					.match(/-?[\d.]+/g)!
					.map(Number);
				const xs = nums.filter((_, i) => i % 2 === 0);
				const ys = nums.filter((_, i) => i % 2 === 1);
				expect(Math.min(...xs), c).toBeGreaterThanOrEqual(0);
				expect(Math.max(...xs), c).toBeLessThanOrEqual(100);
				expect(Math.min(...ys), c).toBeGreaterThanOrEqual(10);
				expect(Math.max(...ys), c).toBeLessThanOrEqual(110);
			}
		}
	});

	it('knows the stroke counts children are taught', () => {
		const counts: Record<string, number> = {
			あ: 3,
			き: 4,
			ふ: 4,
			を: 3,
			ん: 1,
			ア: 2,
			キ: 3,
			ヲ: 3,
			ン: 2
		};
		for (const [c, n] of Object.entries(counts))
			expect(SETS.hiragana[c] ?? SETS.katakana[c], c).toHaveLength(n);
	});

	it('names every sound in Hepburn', () => {
		expect(romaji('し')).toBe('shi');
		expect(romaji('ツ')).toBe('tsu');
		expect(romaji('ふ')).toBe('fu');
		expect(romaji('ン')).toBe('n');
		expect(romaji('A')).toBe('');
		for (const set of KANA_SETS)
			for (const c of ORDER[set]) expect(romaji(c), c).toMatch(/^[a-z]+$/);
	});

	it('gives every kana but を a word in its own script, falling back to the general one', () => {
		for (const set of KANA_SETS) {
			for (const c of ORDER[set]) {
				for (const ws of WORD_SET_KEYS) {
					const w = kanaWord(c, ws);
					if (toHiragana(c) === 'を') {
						expect(w).toBeNull();
						continue;
					}
					expect(w, `${c} ${ws}`).not.toBeNull();
					// The word has the kana in it -- most start with it, a few (ん, る) do not.
					expect(w!.word, `${c} ${ws}`).toContain(c);
					expect(w!.romaji).toMatch(/^[a-zāīūēō]+$/);
				}
			}
		}
		expect(kanaWord('ひ', 'vehicles')?.word).toBe('ひこうき');
		expect(kanaWord('あ', 'vehicles')?.word).toBe('あひる');
	});

	it('names clips by sound and word, so the two scripts share them', () => {
		expect(kanaPhraseStem('あ')).toBe('a-ahiru');
		expect(kanaPhraseStem('ケ')).toBe('ke-keki');
		expect(kanaPhraseStem('や')).toBe(kanaPhraseStem('ヤ'));
		expect(kanaPhraseStem('を')).toBe('wo');
		expect(kanaPhraseStem('ヲ')).toBe('wo');
		expect(slug('kyūkyūsha')).toBe('kyukyusha');
	});

	it('lists every picture not drawn yet in docs/kana-pictures.md', () => {
		const todo = readFileSync('docs/kana-pictures.md', 'utf8');
		const have = new Set(SUBJECT_NAMES);
		const missing = new Set<string>();
		for (const set of KANA_SETS)
			for (const c of ORDER[set])
				for (const ws of WORD_SET_KEYS) {
					const w = kanaWord(c, ws);
					if (w && !have.has(w.picture)) missing.add(w.picture);
				}
		for (const p of missing) expect(todo, p).toMatch(new RegExp(`^\\| ${p} +\\|`, 'm'));
		// And nothing lingers there once it is drawn.
		for (const row of todo.matchAll(/^\| ([a-z][a-z ]*?) +\|/gm))
			expect(have.has(row[1]), `${row[1]} is drawn; take it off the list`).toBe(false);
	});
});

// Public entry point for the word illustrations.

import { BACKDROP } from './palette';
import { draw } from './render';
import { SUBJECTS } from './subjects';

export { SUBJECT_NAMES } from './subjects';

/** SVG markup for a word's picture, or null if that word has no drawing yet. */
export function art(word: string, size = 200): string | null {
	const build = SUBJECTS[word];
	return build ? draw(word, build(), BACKDROP, size) : null;
}

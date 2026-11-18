// Pictures for the hiragana and katakana words, kept apart from the Latin set
// only for reading, in batches by theme. Each draws under the names
// `src/lib/kana-words.json` asks for; `docs/kana-pictures.md` lists what is
// still to draw.

import type { Subject } from '../subjects';
import { ANIMALS1 } from './animals1';
import { ANIMALS2 } from './animals2';
import { FOOD } from './food';
import { NATURE } from './nature';
import { RAILS } from './rails';
import { ROADS } from './roads';
import { THINGS1 } from './things1';
import { THINGS2 } from './things2';

export const KANA_SUBJECTS: Record<string, Subject> = {
	...ROADS,
	...RAILS,
	...ANIMALS1,
	...ANIMALS2,
	...NATURE,
	...FOOD,
	...THINGS1,
	...THINGS2
};

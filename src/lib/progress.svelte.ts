// Play history, in localStorage and nowhere else. No accounts, no network.
//
// Two things are kept: a per-day tally, so a parent can see the days a child
// played, and the best-ever star rating per glyph, which is what the grid view
// shows on each tile.

import { browser } from '$app/environment';
import type { StrokeSet } from './glyphs/data';
import type { WordSet } from './words';
import type { Best, Stars } from './trace/engine';

const KEY = 'letter-tracer:v1';

export type Day = { stars: number; chars: string[] };

export type Store = {
	version: 1;
	days: Record<string, Day>;
	/** char -> best stars ever earned on it. Absent means never completed. */
	best: Record<string, Best>;
	lastSet: StrokeSet;
	/** Which set of word pictures the letters get. */
	words: WordSet;
	muted: boolean;
};

const empty = (): Store => ({
	version: 1,
	days: {},
	best: {},
	lastSet: 'upper',
	words: 'general',
	muted: false
});

/** Local calendar date, not UTC -- "days the child played" is a local idea. */
export function today(d = new Date()): string {
	const p = (n: number) => String(n).padStart(2, '0');
	return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

class Progress {
	data = $state<Store>(empty());

	constructor() {
		if (!browser) return;
		try {
			const raw = localStorage.getItem(KEY);
			if (raw) {
				const parsed = JSON.parse(raw) as Store;
				if (parsed?.version === 1) this.data = { ...empty(), ...parsed };
			}
		} catch {
			// Private browsing, disabled storage, corrupt JSON: start fresh rather
			// than break the app. Nothing here is worth failing a session over.
		}
	}

	#save() {
		if (!browser) return;
		try {
			localStorage.setItem(KEY, JSON.stringify(this.data));
		} catch {
			// Quota or a locked-down browser; the session still plays fine.
		}
	}

	/** Record a finished glyph. Only ever raises a glyph's best score. */
	record(char: string, stars: Stars) {
		const key = today();
		const day = this.data.days[key] ?? { stars: 0, chars: [] };
		day.stars += stars;
		if (!day.chars.includes(char)) day.chars.push(char);
		this.data.days[key] = day;
		this.data.best[char] = Math.max(this.data.best[char] ?? 0, stars) as Best;
		this.#save();
	}

	setPrefs(patch: Partial<Pick<Store, 'lastSet' | 'words' | 'muted'>>) {
		Object.assign(this.data, patch);
		this.#save();
	}

	/** Zero for a glyph the child has never correctly completed. */
	bestFor(char: string): Best {
		return this.data.best[char] ?? 0;
	}

	get todayStars(): number {
		return this.data.days[today()]?.stars ?? 0;
	}

	/** Consecutive days played, counting back from today. */
	get streak(): number {
		let n = 0;
		const d = new Date();
		while (this.data.days[today(d)]) {
			n++;
			d.setDate(d.getDate() - 1);
		}
		return n;
	}
}

export const progress = new Progress();

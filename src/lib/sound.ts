// Celebration audio. Two short samples, precached with the rest of the app so
// they work offline; see CREDITS.md for licences.
//
// MP3 rather than Ogg because iOS Safari has never reliably supported Ogg
// Vorbis, and this is a mobile-first PWA.

import { browser } from '$app/environment';
import { base } from '$app/paths';

export type Cue = 'cheer' | 'sad';

const FILES: Record<Cue, string> = {
	cheer: 'cheer.mp3',
	sad: 'sad-trombone.mp3'
};

const els = new Map<Cue, HTMLAudioElement>();

function element(cue: Cue): HTMLAudioElement | null {
	if (!browser) return null;
	let a = els.get(cue);
	if (!a) {
		a = new Audio(`${base}/sounds/${FILES[cue]}`);
		a.preload = 'auto';
		els.set(cue, a);
	}
	return a;
}

/**
 * Warm the audio elements from inside a real user gesture. iOS will not play
 * anything that was not unlocked this way, and the celebration fires too late
 * in the interaction to count on its own.
 */
export function unlock() {
	for (const cue of Object.keys(FILES) as Cue[]) element(cue)?.load();
}

export function play(cue: Cue, volume = 1) {
	const a = element(cue);
	if (!a) return;
	a.volume = volume;
	a.currentTime = 0;
	a.play().catch(() => {
		// Autoplay policy, or no gesture yet. Silence is not worth an error.
	});
}

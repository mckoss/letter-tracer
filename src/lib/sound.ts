// Audio: two celebration samples and the spoken letter prompts. Everything is
// a file under static/, precached with the rest of the app, so it all works
// offline -- nothing here calls a service. See CREDITS.md for licences.
//
// MP3 rather than Ogg because iOS Safari has never reliably supported Ogg
// Vorbis, and this is a mobile-first PWA.

import { browser } from '$app/environment';
import { base } from '$app/paths';
import { PHRASES } from './voice-clips';

export type Cue = 'cheer' | 'sad';

const FILES: Record<Cue, string> = {
	cheer: 'yay.mp3',
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

let unlocked = false;

/**
 * Warm the audio elements from inside a real user gesture. iOS will not play
 * anything that was not unlocked this way, and the celebration fires too late
 * in the interaction to count on its own.
 *
 * Once only. `load()` resets an element, so calling this again while something
 * is playing cuts it off -- which is exactly what happened when auto-advance
 * started opening the next letter in the middle of the cheer.
 */
export function unlock() {
	if (unlocked) return;
	unlocked = true;
	for (const cue of Object.keys(FILES) as Cue[]) element(cue)?.load();
	voiceEl()?.load();
}

/**
 * One element reused for every spoken prompt. A new Audio per letter would need
 * unlocking per letter, which iOS only allows from inside a real gesture, and
 * by the time a letter opens the gesture may be over.
 */
let voice: HTMLAudioElement | null = null;
/** Whatever is playing, so a prompt can wait its turn. */
let sounding: HTMLAudioElement | null = null;
let queued: ReturnType<typeof setTimeout> | null = null;

function voiceEl(): HTMLAudioElement | null {
	if (!browser) return null;
	if (!voice) {
		voice = new Audio();
		voice.preload = 'auto';
	}
	return voice;
}

export function play(cue: Cue, volume = 1) {
	const a = element(cue);
	if (!a) return;
	a.volume = volume;
	a.currentTime = 0;
	sounding = a;
	a.play().catch(() => {
		// Autoplay policy, or no gesture yet. Silence is not worth an error.
	});
}

/** Milliseconds until nothing is playing, so a prompt does not talk over it. */
function quietIn(): number {
	if (!sounding || sounding.paused || sounding.ended) return 0;
	const left = (sounding.duration || 0) - sounding.currentTime;
	return Number.isFinite(left) && left > 0 ? left * 1000 + GAP : 0;
}

/** A beat of silence after the cheer before the next letter is announced. */
const GAP = 250;

/**
 * Say "A is for apple" for a letter, if that letter has been recorded.
 *
 * Letters arrive on a celebration: finishing one glyph opens the next while the
 * cheer is still ringing, so the prompt waits for the noise to stop rather than
 * shouting over it. Only the newest request survives -- a child tapping through
 * letters should hear the one they landed on, not a backlog.
 */
export function speak(char: string) {
	if (queued !== null) {
		clearTimeout(queued);
		queued = null;
	}
	const key = char.toLowerCase();
	const a = voiceEl();
	if (!a || !PHRASES.includes(key)) return;
	a.pause();
	const start = () => {
		queued = null;
		a.src = `${base}/sounds/voice/phrase/${key}.mp3`;
		a.currentTime = 0;
		sounding = a;
		a.play().catch(() => {
			// Not unlocked yet, or the file is not there. Quiet is fine.
		});
	};
	const wait = quietIn();
	if (wait <= 0) start();
	else queued = setTimeout(start, wait);
}

/** Stop a prompt and cancel one that is waiting -- on leaving the glyph. */
export function hush() {
	if (queued !== null) {
		clearTimeout(queued);
		queued = null;
	}
	voice?.pause();
}

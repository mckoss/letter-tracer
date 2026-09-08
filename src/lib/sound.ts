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
/** The celebration currently sounding, if any. Prompts keep out of its way. */
let cueing: HTMLAudioElement | null = null;
/** A prompt waiting for the celebration to finish, and how to call it off. */
let waiting: ReturnType<typeof setTimeout> | null = null;

/** How often to look at whether the celebration has finished. */
const POLL = 120;
/** A beat of quiet after it does, before the letter is announced. */
const GAP = 250;
/**
 * Give up waiting after this. A cue that stalls or errors never reaches its end,
 * and losing the prompt for good would be worse than a late one.
 */
const MAX_WAIT = 6000;

function stopWaiting() {
	if (waiting === null) return;
	clearTimeout(waiting);
	waiting = null;
}

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
	cueing = a;
	a.play().catch(() => {
		// Autoplay policy, or no gesture yet. Silence is not worth an error.
	});
}

/** Is a celebration sounding right now? */
function celebrating(): boolean {
	return !!cueing && !cueing.paused && !cueing.ended;
}

/**
 * Say "A is for apple" for a letter, if that letter has been recorded.
 *
 * Never across a celebration, and never instead of one. Finishing a glyph opens
 * the next while the cheer or the trombone is still going, so the prompt waits
 * for the noise to stop and then says its piece. Only the newest request
 * survives: a child tapping through letters should hear the one they landed on,
 * not a backlog.
 *
 * Watching for quiet rather than timing the cue: a duration is not known until
 * the metadata loads, and on the first celebration of a cold start it is NaN,
 * which is how an earlier version of this talked straight over the cheer.
 */
export function speak(char: string) {
	stopWaiting();
	const key = char.toLowerCase();
	const a = voiceEl();
	if (!a || !PHRASES.includes(key)) return;
	a.pause();
	const say = () => {
		waiting = null;
		a.src = `${base}/sounds/voice/phrase/${key}.mp3`;
		a.currentTime = 0;
		a.play().catch(() => {
			// Not unlocked yet, or the file is not there. Quiet is fine.
		});
	};
	if (!celebrating()) return say();
	let waited = 0;
	const listen = () => {
		if (!celebrating()) {
			waiting = setTimeout(say, GAP);
			return;
		}
		waited += POLL;
		waiting = waited >= MAX_WAIT ? setTimeout(say, 0) : setTimeout(listen, POLL);
	};
	listen();
}

/** Stop a prompt part way, and call off one that is waiting. */
export function hush() {
	stopWaiting();
	voice?.pause();
}

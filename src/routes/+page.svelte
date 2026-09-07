<script lang="ts">
	// The app: a grid of the active set, and the trace screen for one glyph.
	import { onMount } from 'svelte';
	import { art } from '$lib/art';
	import { ORDER, SETS, SET_LABELS, type StrokeSet } from '$lib/glyphs/data';
	import { progress } from '$lib/progress.svelte';
	import { wordFor, wordKey } from '$lib/words';
	import Confetti from '$lib/components/Confetti.svelte';
	import GlyphWord from '$lib/components/GlyphWord.svelte';
	import Splash from '$lib/components/Splash.svelte';
	import PlayHistory from '$lib/components/PlayHistory.svelte';
	import Stars from '$lib/components/Stars.svelte';
	import { play, unlock } from '$lib/sound';
	import TraceStage from '$lib/components/TraceStage.svelte';
	import type { Stars as StarCount } from '$lib/trace/engine';

	const SET_KEYS: StrokeSet[] = ['upper', 'lower', 'digits'];

	let set = $state<StrokeSet>(progress.data.lastSet);
	let view = $state<'grid' | 'trace'>('grid');
	let index = $state(0);
	let earned = $state<StarCount | null>(null);
	let confetti: Confetti | undefined = $state();
	let stage: TraceStage | undefined = $state();
	let leaveHint = $state(false);
	// Shown on every launch: it is three seconds, skippable, and toddlers like it.
	let splash = $state(true);

	const chars = $derived(ORDER[set]);
	const char = $derived(chars[index] ?? chars[0]);
	const picture = $derived(art(wordKey(char), 96));

	/**
	 * How long the stars and confetti stay up before the next letter arrives. The
	 * stage has already held the finished letter for 1.1--1.5s of its own, so this
	 * is the tail of the celebration, not the whole of it.
	 */
	const CELEBRATE_MS = 1400;
	let advancing: ReturnType<typeof setTimeout> | null = null;

	function stopAdvance() {
		if (advancing === null) return;
		clearTimeout(advancing);
		advancing = null;
	}

	function open(i: number) {
		// Opening a glyph is a real tap, which is the only moment iOS will let us
		// prime the audio elements.
		unlock();
		stopAdvance();
		const wasGrid = view === 'grid';
		index = i;
		earned = null;
		view = 'trace';
		if (wasGrid) history.pushState({ lt: 'trace' }, '');
	}

	function step(by: 1 | -1) {
		const i = index + by;
		if (i >= 0 && i < chars.length) open(i);
	}

	function done(stars: StarCount) {
		progress.record(char, stars);
		// Everyone gets a burst; how big it is says how the letter went.
		confetti?.fire(stars === 3 ? 170 : stars === 2 ? 80 : 35);
		if (!progress.data.muted) play(stars === 1 ? 'sad' : 'cheer', stars === 3 ? 1 : 0.65);
		earned = stars;
		// Finish a letter and the next one comes to you. A child who has just been
		// cheered at should not have to find a button to keep going -- and the last
		// letter of the set hands them back to the grid.
		stopAdvance();
		advancing = setTimeout(() => {
			advancing = null;
			if (index < chars.length - 1) open(index + 1);
			else goGrid();
		}, CELEBRATE_MS);
	}

	function goGrid() {
		stopAdvance();
		view = 'grid';
		earned = null;
	}

	// The system back gesture used to leave the app outright, which a child
	// triggers constantly. Entering a glyph pushes a history entry, so back comes
	// out to the grid instead; from the grid it takes two presses to leave.
	onMount(() => {
		history.replaceState({ lt: 'grid' }, '');
		const onPop = () => {
			if (view === 'trace') {
				goGrid();
				history.pushState({ lt: 'grid' }, '');
				return;
			}
			if (!leaveHint) {
				leaveHint = true;
				setTimeout(() => (leaveHint = false), 2200);
				history.pushState({ lt: 'grid' }, '');
			}
		};
		addEventListener('popstate', onPop);
		return () => removeEventListener('popstate', onPop);
	});

	// Deep link for review: /?c=A opens straight onto that glyph.
	onMount(() => {
		const c = new URLSearchParams(location.search).get('c');
		if (!c) return;
		for (const k of SET_KEYS) {
			if (!SETS[k][c]) continue;
			const i = ORDER[k].indexOf(c);
			if (i < 0) continue;
			set = k;
			open(i);
			return;
		}
	});

	function pick(next: StrokeSet) {
		set = next;
		index = 0;
		progress.setPrefs({ lastSet: next });
	}
</script>

<svelte:head><title>Letter Tracer</title></svelte:head>

{#if splash}
	<Splash ondone={() => (splash = false)} />
{/if}

<!-- Outside .app so no screen's stacking context can bury it. -->
<span class="version">v{__APP_VERSION__}</span>

<Confetti bind:this={confetti} />

<div class="app" class:tracing={view === 'trace'}>
	<header>
		{#if view === 'trace'}
			<button class="home" onclick={goGrid} aria-label="Back to all the letters">
				<svg viewBox="0 0 32 32" aria-hidden="true">
					<rect x="21.5" y="6.5" width="3.6" height="6" rx="1" fill="#9e3a31" />
					<path d="M2.5 16 L16 4 L29.5 16 Z" fill="#c34c3e" />
					<rect x="6.5" y="15" width="19" height="13" rx="2" fill="#d89a4a" />
					<rect x="13.2" y="19.5" width="5.6" height="8.5" rx="2.6" fill="#3e7c7b" />
					<rect x="8.8" y="17.6" width="3.6" height="3.6" rx="1" fill="#f3e7ce" />
					<rect x="19.6" y="17.6" width="3.6" height="3.6" rx="1" fill="#f3e7ce" />
				</svg>
			</button>
		{:else}
			<span class="brand">Letter Tracer</span>
		{/if}
		<div class="right">
			{#if view === 'grid'}
				<button
					class="mute"
					onclick={() => progress.setPrefs({ muted: !progress.data.muted })}
					aria-pressed={progress.data.muted}
					aria-label={progress.data.muted ? 'Turn sound on' : 'Turn sound off'}
				>
					{progress.data.muted ? '\u{1F507}' : '\u{1F50A}'}
				</button>
			{/if}
			<span class="score" aria-label="{progress.todayStars} stars today">
				&#9733;
				{progress.todayStars}
			</span>
		</div>
	</header>

	{#if view === 'grid'}
		<div class="picker">
			<div class="seg" role="group" aria-label="Character set">
				{#each SET_KEYS as k (k)}
					<button type="button" aria-pressed={set === k} onclick={() => pick(k)}>
						{SET_LABELS[k]}
					</button>
				{/each}
			</div>
		</div>

		<div class="grid">
			{#each chars as c, i (c)}
				<button class="tile" onclick={() => open(i)}>
					<svg viewBox="-6 0 112 148" aria-hidden="true">
						{#each SETS[set][c] as d, j (j)}
							<path {d} />
						{/each}
					</svg>
					<Stars value={progress.bestFor(c)} />
				</button>
			{/each}
		</div>

		<button class="play" onclick={() => open(0)}>Play all &rarr;</button>

		<PlayHistory />
	{:else}
		<div class="stage">
			{#key char}
				<TraceStage bind:this={stage} strokes={SETS[set][char]} {char} onDone={done} />
			{/key}
			{#if earned !== null}
				<div class="earned"><Stars value={earned} size={30} /></div>
			{/if}
		</div>

		<div class="band">
			{#if picture}
				<!-- eslint-disable-next-line svelte/no-at-html-tags -- markup generated locally -->
				{@html picture}
			{/if}
			<GlyphWord text={wordFor(char)} height={30} />
		</div>

		<nav class="nav">
			<button
				class="step"
				onclick={() => step(-1)}
				disabled={index === 0}
				aria-label="The letter before this one"
			>
				<svg viewBox="0 0 32 32" aria-hidden="true">
					<!-- A second circle peeping out below is the poster drop shadow the
					     house and the eraser use, without any arc arithmetic. -->
					<circle cx="16" cy="17.3" r="14.4" fill="#2f6362" />
					<circle cx="16" cy="16" r="14.4" fill="#3e7c7b" />
					<g fill="#f7efdd" transform="translate(32 0) scale(-1 1)">
						<rect x="7.6" y="14.1" width="8" height="3.8" rx="1.9" />
						<path d="M13.2 8.6 L22.4 16 L13.2 23.4 Z" />
					</g>
				</svg>
			</button>

			<div class="mid">
				<button
					class="erase"
					onclick={() => {
						earned = null;
						stage?.reset();
					}}
					aria-label="Rub it out and start this letter again"
				>
					<svg viewBox="0 0 32 32" aria-hidden="true">
						<g transform="rotate(-28 16 16)">
							<path d="M3.5 16 L9 8.5 L23 8.5 L28.5 16 L23 23.5 L9 23.5 Z" fill="#ef9aa4" />
							<path d="M3.5 16 L9 23.5 L23 23.5 L28.5 16 Z" fill="#d87d8b" />
							<path d="M9 8.5 L23 8.5 L25.4 11.8 L11.4 11.8 Z" fill="#f7bcc2" />
						</g>
					</svg>
				</button>
				<span class="count">{index + 1} / {chars.length}</span>
			</div>

			<button
				class="step"
				onclick={() => step(1)}
				disabled={index === chars.length - 1}
				aria-label="The next letter"
			>
				<svg viewBox="0 0 32 32" aria-hidden="true">
					<circle cx="16" cy="17.3" r="14.4" fill="#2f6362" />
					<circle cx="16" cy="16" r="14.4" fill="#3e7c7b" />
					<g fill="#f7efdd">
						<rect x="7.6" y="14.1" width="8" height="3.8" rx="1.9" />
						<path d="M13.2 8.6 L22.4 16 L13.2 23.4 Z" />
					</g>
				</svg>
			</button>
		</nav>
	{/if}
	{#if leaveHint}
		<p class="leave-hint" role="status">Press back again to leave</p>
	{/if}
</div>

<style>
	.version {
		position: fixed;
		/* Clear of the iPhone home indicator, which would otherwise sit on top of it. */
		right: calc(10px + env(safe-area-inset-right));
		bottom: calc(6px + env(safe-area-inset-bottom));
		font-size: 11px;
		letter-spacing: 0.03em;
		/* Quiet, but not invisible: the first attempt was 2:1 against the ground. */
		color: #736b79;
		opacity: 0.75;
		pointer-events: none;
		/* Above the splash (50) and the confetti canvas (20). */
		z-index: 60;
	}
	.leave-hint {
		position: fixed;
		left: 50%;
		bottom: 26px;
		transform: translateX(-50%);
		margin: 0;
		padding: 10px 18px;
		border-radius: 999px;
		background: #3b3039;
		color: #fbf8f2;
		font-size: 14px;
		z-index: 30;
	}
	:global(*, *::before, *::after) {
		box-sizing: border-box;
	}
	:global(body) {
		margin: 0;
		background: #fbf8f2;
		color: #3b3039;
		font-family:
			ui-sans-serif,
			-apple-system,
			'Segoe UI',
			Roboto,
			sans-serif;
		overscroll-behavior: none;
	}
	.app {
		max-width: 460px;
		margin: 0 auto;
		min-height: 100svh;
		display: flex;
		flex-direction: column;
	}
	/* The trace view needs a definite height, or the stage has no height to
	   resolve against and the glyph scales past the edge of the screen. The grid
	   stays min-height so it can scroll. */
	.app.tracing {
		height: 100svh;
		overflow: hidden;
	}
	header {
		flex: 0 0 56px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 16px;
		flex: 0 0 auto;
	}
	.brand {
		font-weight: 700;
		letter-spacing: -0.01em;
	}
	.score {
		font-weight: 700;
		color: #d89a4a;
	}
	.right {
		display: flex;
		align-items: center;
		gap: 10px;
	}
	.mute {
		border: 0;
		background: none;
		font-size: 19px;
		line-height: 1;
		padding: 6px;
		cursor: pointer;
		opacity: 0.75;
	}

	.picker {
		display: flex;
		flex-direction: column;
		gap: 10px;
		align-items: center;
		padding: 0 16px 14px;
	}
	.seg {
		display: inline-flex;
		border: 1px solid #e3ddd4;
		border-radius: 999px;
		overflow: hidden;
		background: #fff;
	}
	.seg button {
		padding: 9px 22px;
		border: 0;
		border-right: 1px solid #e3ddd4;
		background: none;
		font: inherit;
		font-weight: 700;
		color: #6b6072;
		cursor: pointer;
	}
	.seg button:last-child {
		border-right: 0;
	}
	.seg button[aria-pressed='true'] {
		background: #c34c3e;
		color: #fff;
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(74px, 1fr));
		gap: 8px;
		padding: 0 16px;
	}
	.tile {
		background: #fff;
		border: 1px solid #ebe5dc;
		border-radius: 12px;
		padding: 6px 4px 5px;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 3px;
		cursor: pointer;
	}
	.tile svg {
		width: 100%;
		height: 54px;
	}
	.tile path {
		fill: none;
		stroke: #6b6072;
		stroke-width: 7;
		stroke-linecap: round;
		stroke-linejoin: round;
	}
	.play {
		margin: 18px auto 24px;
		padding: 13px 30px;
		border: 0;
		border-radius: 999px;
		background: #3e7c7b;
		color: #fff;
		font: inherit;
		font-weight: 700;
		font-size: 16px;
		cursor: pointer;
	}

	.stage {
		flex: 1 1 auto;
		overflow: hidden;
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 4px 12px;
		min-height: 0;
	}
	.earned {
		position: absolute;
		bottom: 6px;
		left: 50%;
		transform: translateX(-50%);
	}
	.band {
		flex: 0 0 20%;
		min-height: 104px;
		border-top: 1px solid #ece5da;
		background: #f5efe3;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 16px;
		padding: 0 20px;
	}
	.nav {
		flex: 0 0 auto;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		/* The bottom padding also keeps the next button clear of the version badge
		   pinned in the corner. */
		padding: 6px 18px calc(22px + env(safe-area-inset-bottom));
	}
	.mid {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1px;
	}
	.count {
		color: #8a8090;
		font-size: 13px;
	}
	/* Toddler-sized, and drawn in the same poster hand as the house and the
	   eraser -- the old pair were 40px outline pills with a text arrow in them,
	   which read as browser chrome rather than as part of the app. */
	.step {
		border: 0;
		background: none;
		padding: 0;
		width: 68px;
		height: 68px;
		border-radius: 50%;
		cursor: pointer;
		-webkit-tap-highlight-color: transparent;
	}
	.step svg {
		width: 68px;
		height: 68px;
		display: block;
	}
	.step:active:not(:disabled) svg {
		transform: scale(0.93);
	}
	.home,
	.erase {
		border: 0;
		background: none;
		width: 46px;
		height: 46px;
		padding: 0;
		display: grid;
		place-items: center;
		border-radius: 14px;
		cursor: pointer;
	}
	.home svg,
	.erase svg {
		width: 34px;
		height: 34px;
	}
	.erase {
		width: 58px;
		height: 58px;
	}
	.erase svg {
		width: 44px;
		height: 44px;
	}
	.home svg {
		width: 38px;
		height: 38px;
	}
	.home:active,
	.erase:active {
		background: #f0e8db;
	}
	/* At the ends of the set. Faded, but still legible as a button rather than a
	   ghost -- 0.35 opacity made it vanish. */
	.step:disabled {
		opacity: 0.4;
		filter: grayscale(0.8);
		cursor: default;
	}
</style>

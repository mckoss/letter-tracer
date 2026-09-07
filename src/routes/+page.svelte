<script lang="ts">
	// The app: a grid of the active set, and the trace screen for one glyph.
	import { onMount } from 'svelte';
	import { art, type Subject } from '$lib/art/styles';
	import { ORDER, SETS, SET_LABELS, type StrokeSet } from '$lib/glyphs/data';
	import { progress } from '$lib/progress.svelte';
	import { wordFor } from '$lib/words';
	import Confetti from '$lib/components/Confetti.svelte';
	import GlyphWord from '$lib/components/GlyphWord.svelte';
	import HoldButton from '$lib/components/HoldButton.svelte';
	import Stars from '$lib/components/Stars.svelte';
	import { play, unlock } from '$lib/sound';
	import TraceStage from '$lib/components/TraceStage.svelte';
	import type { Stars as StarCount } from '$lib/trace/engine';

	const SET_KEYS: StrokeSet[] = ['upper', 'lower', 'digits'];

	// Only three word pictures exist so far (M5 draws the other 23).
	const ART: Record<string, Subject> = { a: 'apple', d: 'dog', k: 'kite' };

	let set = $state<StrokeSet>(progress.data.lastSet);
	let view = $state<'grid' | 'trace'>('grid');
	let index = $state(0);
	let playAll = $state(false);
	let earned = $state<StarCount | null>(null);
	let confetti: Confetti | undefined = $state();
	let stage: TraceStage | undefined = $state();
	let leaveHint = $state(false);

	const chars = $derived(ORDER[set]);
	const char = $derived(chars[index] ?? chars[0]);
	const subject = $derived(ART[char?.toLowerCase()]);

	function open(i: number, all = false) {
		// Opening a glyph is a real tap, which is the only moment iOS will let us
		// prime the audio elements.
		unlock();
		const wasGrid = view === 'grid';
		index = i;
		playAll = all;
		earned = null;
		view = 'trace';
		if (wasGrid) history.pushState({ lt: 'trace' }, '');
	}

	function done(stars: StarCount) {
		progress.record(char, stars);
		// Everyone gets a burst; how big it is says how the letter went.
		confetti?.fire(stars === 3 ? 170 : stars === 2 ? 80 : 35);
		if (!progress.data.muted) play(stars === 1 ? 'sad' : 'cheer', stars === 3 ? 1 : 0.65);
		earned = stars;
		if (playAll && index < chars.length - 1) {
			index += 1;
			earned = null;
		} else if (playAll) {
			playAll = false;
			view = 'grid';
		}
	}

	function goGrid() {
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

<Confetti bind:this={confetti} />

<div class="app" class:tracing={view === 'trace'}>
	<header>
		{#if view === 'trace'}
			<HoldButton onhold={goGrid} label="Back to all the letters">
				<svg class="home" viewBox="0 0 32 32" aria-hidden="true">
					<rect x="21.5" y="6.5" width="3.6" height="6" rx="1" fill="#9e3a31" />
					<path d="M2.5 16 L16 4 L29.5 16 Z" fill="#c34c3e" />
					<rect x="6.5" y="15" width="19" height="13" rx="2" fill="#d89a4a" />
					<rect x="13.2" y="19.5" width="5.6" height="8.5" rx="2.6" fill="#3e7c7b" />
					<rect x="8.8" y="17.6" width="3.6" height="3.6" rx="1" fill="#f3e7ce" />
					<rect x="19.6" y="17.6" width="3.6" height="3.6" rx="1" fill="#f3e7ce" />
				</svg>
			</HoldButton>
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

		<button class="play" onclick={() => open(0, true)}>Play all &rarr;</button>
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
			{#if subject}
				<!-- eslint-disable-next-line svelte/no-at-html-tags -- markup generated locally -->
				{@html art(subject, 'poster', 96)}
			{/if}
			<GlyphWord text={wordFor(char)} height={30} />
		</div>

		<nav class="nav">
			<HoldButton
				onhold={() => {
					earned = null;
					stage?.reset();
				}}
				label="Rub it out and start this letter again"
			>
				<svg viewBox="0 0 32 32" aria-hidden="true">
					<g transform="rotate(-32 16 17)">
						<rect x="8" y="7" width="16" height="19" rx="3.5" fill="#f3e7ce" />
						<path
							d="M11.5 7 h9 a3.5 3.5 0 0 1 3.5 3.5 v7.5 h-16 v-7.5 a3.5 3.5 0 0 1 3.5-3.5 z"
							fill="#c34c3e"
						/>
						<rect x="8" y="17.4" width="16" height="1.4" fill="#9e3a31" opacity="0.35" />
					</g>
				</svg>
			</HoldButton>
			<button onclick={() => open(Math.max(0, index - 1))} disabled={index === 0}>&larr;</button>
			<span>{index + 1} / {chars.length}</span>
			<button
				onclick={() => open(Math.min(chars.length - 1, index + 1))}
				disabled={index === chars.length - 1}>&rarr;</button
			>
		</nav>
	{/if}
	{#if leaveHint}
		<p class="leave-hint" role="status">Press back again to leave</p>
	{/if}
</div>

<style>
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
		justify-content: center;
		gap: 22px;
		padding: 10px 0 14px;
		color: #8a8090;
		font-size: 14px;
	}
	.nav button {
		border: 1px solid #e3ddd4;
		background: #fff;
		border-radius: 999px;
		width: 40px;
		height: 40px;
		font-size: 17px;
		color: #6b6072;
		cursor: pointer;
	}
	.nav button:disabled {
		opacity: 0.35;
		cursor: default;
	}
</style>

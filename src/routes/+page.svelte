<script lang="ts">
	// The app: a grid of the active set, and the trace screen for one glyph.
	import { onMount } from 'svelte';
	import { art, type Subject } from '$lib/art/styles';
	import { ORDER, SETS, SET_LABELS, type StrokeSet } from '$lib/glyphs/data';
	import { progress } from '$lib/progress.svelte';
	import { wordFor } from '$lib/words';
	import GlyphWord from '$lib/components/GlyphWord.svelte';
	import Stars from '$lib/components/Stars.svelte';
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

	const chars = $derived(ORDER[set]);
	const char = $derived(chars[index] ?? chars[0]);
	const subject = $derived(ART[char?.toLowerCase()]);

	function open(i: number, all = false) {
		index = i;
		playAll = all;
		earned = null;
		view = 'trace';
	}

	function done(stars: StarCount) {
		progress.record(char, stars);
		earned = stars;
		if (playAll && index < chars.length - 1) {
			index += 1;
			earned = null;
		} else if (playAll) {
			playAll = false;
			view = 'grid';
		}
	}

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

<div class="app" class:tracing={view === 'trace'}>
	<header>
		{#if view === 'trace'}
			<button class="icon" onclick={() => (view = 'grid')} aria-label="Back to the grid"
				>&larr;</button
			>
		{:else}
			<span class="brand">Letter Tracer</span>
		{/if}
		<span class="score" aria-label="{progress.todayStars} stars today">
			&#9733;
			{progress.todayStars}
		</span>
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
				<TraceStage strokes={SETS[set][char]} {char} onDone={done} />
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
			<button onclick={() => open(Math.max(0, index - 1))} disabled={index === 0}>&larr;</button>
			<span>{index + 1} / {chars.length}</span>
			<button
				onclick={() => open(Math.min(chars.length - 1, index + 1))}
				disabled={index === chars.length - 1}>&rarr;</button
			>
		</nav>
	{/if}
</div>

<style>
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
	.icon {
		border: 0;
		background: none;
		font-size: 22px;
		color: #6b6072;
		cursor: pointer;
		padding: 4px 8px;
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

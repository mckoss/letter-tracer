<script lang="ts">
	// Handwriting capture. A development aid, not part of the child's app: the
	// owner writes each letter on a phone, on the same ruled lines the app uses,
	// and exports the strokes as JSON. Those samples are what the cursive
	// letterforms get drawn from, so they are taken exactly as written -- order,
	// direction and timing included -- in the app's own glyph units.
	//
	// Nothing leaves the phone until it is exported. Samples are kept in
	// localStorage as they are saved, so a reload or a closed tab loses nothing.
	import { onMount } from 'svelte';
	import { GUIDE } from '$lib/glyphs/data';
	import { CURSIVE_LOWER, CURSIVE_UPPER } from '$lib/glyphs/cursive';

	const KEY = 'letter-tracer:capture:v1';
	const LETTERS = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'];

	/** One point: x and y in glyph units, t in milliseconds since the sample began. */
	type Point = [number, number, number];
	/** One saved attempt at a letter: every stroke, in the order drawn. */
	type Sample = { savedAt: string; strokes: Point[][] };
	type Store = Record<string, Sample[]>;

	let samples = $state<Store>({});
	let index = $state(0);
	/** The attempt in progress: one array of points per finger-down. */
	let strokes = $state<Point[][]>([]);
	let drawing = $state(false);
	let showGuide = $state(false);
	let showGrid = $state(false);
	let flash = $state('');

	let svgEl: SVGSVGElement | undefined = $state();
	let began = 0;
	let pointer: number | null = null;

	const letter = $derived(LETTERS[index]);
	const guide = $derived(CURSIVE_UPPER[letter] ?? CURSIVE_LOWER[letter] ?? []);
	const savedHere = $derived(samples[letter]?.length ?? 0);
	const total = $derived(Object.values(samples).reduce((n, s) => n + s.length, 0));
	const lettersDone = $derived(LETTERS.filter((c) => samples[c]?.length).length);

	onMount(() => {
		try {
			const raw = localStorage.getItem(KEY);
			if (raw) samples = JSON.parse(raw);
		} catch {
			// Corrupt or blocked storage: start empty rather than fail.
		}
		// Pick up at the first letter with nothing saved yet.
		const next = LETTERS.findIndex((c) => !samples[c]?.length);
		if (next >= 0) index = next;
	});

	function persist() {
		try {
			localStorage.setItem(KEY, JSON.stringify(samples));
		} catch {
			say('Could not save to this browser -- export now');
		}
	}

	function say(msg: string) {
		flash = msg;
		setTimeout(() => flash === msg && (flash = ''), 1800);
	}

	function local(e: PointerEvent): [number, number] {
		const m = svgEl?.getScreenCTM();
		if (!m) return [0, 0];
		const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
		return [Math.round(p.x * 10) / 10, Math.round(p.y * 10) / 10];
	}

	function onDown(e: PointerEvent) {
		// One finger at a time: a palm or a second finger is ignored.
		if (pointer !== null) return;
		pointer = e.pointerId;
		try {
			svgEl?.setPointerCapture(e.pointerId);
		} catch {
			// Synthetic events have nothing to capture.
		}
		if (!strokes.length) began = performance.now();
		const [x, y] = local(e);
		strokes.push([[x, y, Math.round(performance.now() - began)]]);
		drawing = true;
	}

	function onMove(e: PointerEvent) {
		if (e.pointerId !== pointer || !strokes.length) return;
		const line = strokes[strokes.length - 1];
		const [x, y] = local(e);
		const last = line[line.length - 1];
		// Skip jitter under a quarter of a unit; keep everything else.
		if ((x - last[0]) ** 2 + (y - last[1]) ** 2 < 0.0625) return;
		line.push([x, y, Math.round(performance.now() - began)]);
	}

	function onUp(e: PointerEvent) {
		if (e.pointerId !== pointer) return;
		pointer = null;
		drawing = false;
	}

	function repeat() {
		strokes = [];
		pointer = null;
		drawing = false;
	}

	function save() {
		if (!strokes.length) return say('Write the letter first');
		const sample: Sample = {
			savedAt: new Date().toISOString(),
			strokes: $state.snapshot(strokes)
		};
		samples[letter] = [...(samples[letter] ?? []), sample];
		persist();
		say(`Saved ${letter}`);
		strokes = [];
		if (index < LETTERS.length - 1) index++;
	}

	function go(i: number) {
		index = Math.max(0, Math.min(LETTERS.length - 1, i));
		strokes = [];
		showGrid = false;
	}

	function dropLast() {
		const list = samples[letter];
		if (!list?.length) return;
		if (!confirm(`Delete the last saved ${letter}?`)) return;
		samples[letter] = list.slice(0, -1);
		persist();
	}

	function payload() {
		return JSON.stringify(
			{
				version: 1,
				kind: 'letter-tracer handwriting capture',
				exportedAt: new Date().toISOString(),
				box: { viewBox: '0 0 100 140', ...GUIDE },
				note: 'Points are [x, y, ms since the sample began], in glyph units. One array per stroke, in the order drawn.',
				letters: $state.snapshot(samples)
			},
			null,
			1
		);
	}

	const filename = () =>
		`handwriting-${new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-')}.json`;

	async function share() {
		const file = new File([payload()], filename(), { type: 'application/json' });
		if (navigator.canShare?.({ files: [file] })) {
			try {
				await navigator.share({ files: [file], title: 'Handwriting samples' });
				return;
			} catch (err) {
				if ((err as Error).name === 'AbortError') return;
			}
		}
		download();
	}

	function download() {
		const url = URL.createObjectURL(new Blob([payload()], { type: 'application/json' }));
		const a = document.createElement('a');
		a.href = url;
		a.download = filename();
		a.click();
		setTimeout(() => URL.revokeObjectURL(url), 1000);
	}

	const points = (line: Point[]) => line.map((p) => `${p[0]},${p[1]}`).join(' ');
</script>

<svelte:head><title>Handwriting capture &middot; Letter Tracer</title></svelte:head>

<main>
	<header>
		<button
			class="nav"
			onclick={() => go(index - 1)}
			disabled={index === 0}
			aria-label="Previous letter"
		>
			&larr;
		</button>
		<button class="which" onclick={() => (showGrid = !showGrid)}>
			<span class="big">{letter}</span>
			<span class="meta">{index + 1} / {LETTERS.length} &middot; {savedHere} saved</span>
		</button>
		<button
			class="nav"
			onclick={() => go(index + 1)}
			disabled={index === LETTERS.length - 1}
			aria-label="Next letter"
		>
			&rarr;
		</button>
	</header>

	{#if showGrid}
		<div class="grid">
			{#each LETTERS as c, i (c)}
				<button class:here={i === index} class:has={samples[c]?.length} onclick={() => go(i)}>
					{c}<small>{samples[c]?.length ?? ''}</small>
				</button>
			{/each}
		</div>
	{/if}

	<div class="stage">
		<svg
			bind:this={svgEl}
			viewBox="-10 -8 120 158"
			role="application"
			aria-label="Write the letter {letter}"
			onpointerdown={onDown}
			onpointermove={onMove}
			onpointerup={onUp}
			onpointercancel={onUp}
		>
			<line class="rule" x1="-10" x2="110" y1={GUIDE.cap} y2={GUIDE.cap} />
			<line class="rule mid" x1="-10" x2="110" y1={GUIDE.mid} y2={GUIDE.mid} />
			<line class="rule base" x1="-10" x2="110" y1={GUIDE.base} y2={GUIDE.base} />
			<line class="rule" x1="-10" x2="110" y1={GUIDE.desc} y2={GUIDE.desc} />
			{#if showGuide}
				{#each guide as d, i (i)}
					<path {d} class="guide" />
				{/each}
			{/if}
			{#each strokes as line, i (i)}
				{#if line.length === 1}
					<circle class="ink-dot" cx={line[0][0]} cy={line[0][1]} r="2.5" />
				{:else}
					<polyline class="ink" points={points(line)} />
				{/if}
			{/each}
		</svg>
		{#if flash}<p class="flash" role="status">{flash}</p>{/if}
	</div>

	<div class="actions">
		<button class="repeat" onclick={repeat} disabled={!strokes.length || drawing}>Repeat</button>
		<button class="save" onclick={save} disabled={!strokes.length || drawing}>Save</button>
	</div>

	<footer>
		<label
			><input type="checkbox" bind:checked={showGuide} /> Show the app's current letter faintly</label
		>
		<p>
			{total} samples saved across {lettersDone} of {LETTERS.length} letters. Stored on this phone until
			you export.
		</p>
		<div class="export">
			<button onclick={share} disabled={!total}>Share JSON&hellip;</button>
			<button onclick={download} disabled={!total}>Download JSON</button>
			<button class="quiet" onclick={dropLast} disabled={!savedHere}>Delete last {letter}</button>
		</div>
	</footer>
</main>

<style>
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
	main {
		max-width: 520px;
		margin: 0 auto;
		min-height: 100svh;
		display: flex;
		flex-direction: column;
		padding: 0 12px calc(12px + env(safe-area-inset-bottom));
		box-sizing: border-box;
	}
	header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 8px 0 4px;
	}
	.which {
		display: flex;
		flex-direction: column;
		align-items: center;
		border: 0;
		background: none;
		font: inherit;
		color: inherit;
		cursor: pointer;
	}
	.big {
		font-size: 34px;
		font-weight: 700;
		line-height: 1;
	}
	.meta {
		font-size: 13px;
		color: #6b6072;
	}
	.nav {
		width: 52px;
		height: 52px;
		border-radius: 50%;
		border: 0;
		background: #3e7c7b;
		color: #fff;
		font-size: 24px;
		cursor: pointer;
	}
	.nav:disabled {
		opacity: 0.35;
	}
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(38px, 1fr));
		gap: 4px;
		padding: 6px 0;
	}
	.grid button {
		height: 40px;
		border: 1px solid #e3ddd4;
		border-radius: 8px;
		background: #fff;
		font: inherit;
		font-weight: 700;
		color: #6b6072;
		position: relative;
	}
	.grid button.has {
		background: #e3efe2;
		color: #2f5a2d;
	}
	.grid button.here {
		outline: 2px solid #c34c3e;
	}
	.grid small {
		position: absolute;
		right: 3px;
		bottom: 1px;
		font-size: 10px;
		font-weight: 600;
	}
	.stage {
		position: relative;
		flex: 1 1 auto;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #fff;
		border: 1px solid #ebe5dc;
		border-radius: 14px;
		min-height: 0;
	}
	svg {
		display: block;
		width: 100%;
		height: auto;
		max-height: 62svh;
		touch-action: none;
		-webkit-user-select: none;
		user-select: none;
	}
	.rule {
		stroke: #b9d8e2;
		stroke-width: 1;
		vector-effect: non-scaling-stroke;
	}
	.rule.mid {
		stroke-dasharray: 4 4;
	}
	.rule.base {
		stroke: #d98a9a;
	}
	.guide {
		fill: none;
		stroke: #d6d0dc;
		stroke-width: 1.4;
		stroke-dasharray: 4 4;
		vector-effect: non-scaling-stroke;
	}
	.ink {
		fill: none;
		stroke: #241f2b;
		stroke-width: 4;
		stroke-linecap: round;
		stroke-linejoin: round;
	}
	.ink-dot {
		fill: #241f2b;
	}
	.flash {
		position: absolute;
		top: 8px;
		left: 50%;
		transform: translateX(-50%);
		margin: 0;
		padding: 6px 14px;
		border-radius: 999px;
		background: #3b3039;
		color: #fbf8f2;
		font-size: 14px;
	}
	.actions {
		display: flex;
		gap: 12px;
		padding: 12px 0 8px;
	}
	.actions button {
		flex: 1;
		height: 56px;
		border: 0;
		border-radius: 14px;
		font: inherit;
		font-size: 18px;
		font-weight: 700;
		color: #fff;
		cursor: pointer;
	}
	.repeat {
		background: #8a6f7a;
	}
	.save {
		background: #4c7a4a;
	}
	.actions button:disabled {
		opacity: 0.4;
	}
	footer {
		font-size: 13px;
		color: #6b6072;
	}
	footer p {
		margin: 6px 0;
	}
	footer label {
		display: flex;
		align-items: center;
		gap: 6px;
	}
	.export {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}
	.export button {
		padding: 9px 14px;
		border-radius: 10px;
		border: 1px solid #d9d2c6;
		background: #fff;
		font: inherit;
		font-weight: 600;
		color: #3b3039;
		cursor: pointer;
	}
	.export button.quiet {
		color: #9e3a31;
		border-color: #ecd2cd;
	}
	.export button:disabled {
		opacity: 0.4;
	}
</style>

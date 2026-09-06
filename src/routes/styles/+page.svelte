<script lang="ts">
	// Side-by-side comparison of the candidate word-art styles (PLAN.md, M2).
	// Kept in the repo so the decision stays reproducible after a style is picked.
	import { art, STYLES, STYLE_KEYS, type Subject } from '$lib/art/styles';

	const SUBJECTS: Subject[] = ['apple', 'dog', 'kite'];
	const SIZES = [52, 88, 150];
	let size = $state(88);
</script>

<svelte:head><title>Art styles &middot; Letter Tracer</title></svelte:head>

<main>
	<h1>Word-art style samples</h1>
	<p>Same three subjects drawn three ways. One style gets picked, then all 26 words follow it.</p>

	<div class="seg" role="group" aria-label="Preview size">
		{#each SIZES as s (s)}
			<button type="button" aria-pressed={size === s} onclick={() => (size = s)}>{s}px</button>
		{/each}
	</div>

	<div class="grid">
		{#each STYLE_KEYS as key (key)}
			<section>
				<h2>{STYLES[key].name}</h2>
				<div class="chips">
					{#each STYLES[key].chips as c (c)}<i style="background:{c}"></i>{/each}
				</div>
				<p>{STYLES[key].blurb}</p>
				<div class="plate">
					<!-- eslint-disable-next-line svelte/no-at-html-tags -- markup is generated locally -->
					{#each SUBJECTS as s (s)}{@html art(s, key, size)}{/each}
				</div>
			</section>
		{/each}
	</div>
</main>

<style>
	main {
		max-width: 1120px;
		margin: 0 auto;
		padding: 32px 20px 64px;
		font:
			16px/1.6 ui-sans-serif,
			-apple-system,
			'Segoe UI',
			Roboto,
			sans-serif;
		color: #1e1b26;
	}
	h1 {
		font-size: 28px;
		margin: 0 0 4px;
	}
	p {
		color: #6b6579;
		margin: 0 0 20px;
	}
	.seg {
		display: inline-flex;
		border: 1px solid #e5e1ec;
		border-radius: 999px;
		overflow: hidden;
		margin-bottom: 20px;
	}
	.seg button {
		padding: 8px 16px;
		border: 0;
		border-right: 1px solid #e5e1ec;
		background: none;
		color: #6b6579;
		font: inherit;
		font-size: 13px;
		cursor: pointer;
	}
	.seg button:last-child {
		border-right: 0;
	}
	.seg button[aria-pressed='true'] {
		background: #4c3ae3;
		color: #fff;
	}
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 20px;
	}
	section {
		border: 1px solid #e5e1ec;
		border-radius: 14px;
		padding: 20px;
		background: #fff;
	}
	h2 {
		font-size: 20px;
		margin: 0 0 8px;
	}
	.chips {
		display: flex;
		gap: 5px;
		margin-bottom: 10px;
	}
	.chips i {
		width: 15px;
		height: 15px;
		border-radius: 4px;
	}
	.plate {
		display: flex;
		gap: 6px;
		align-items: center;
		justify-content: center;
		flex-wrap: wrap;
		background: #fffdf9;
		border: 1px solid #efecf4;
		border-radius: 10px;
		min-height: 190px;
		padding: 14px 6px;
	}
</style>

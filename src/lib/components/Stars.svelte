<script lang="ts">
	// Three star sockets, filled to the best rating ever earned. An empty row
	// means the glyph has not been correctly completed yet.
	import type { Best } from '$lib/trace/engine';

	let { value, size = 13 }: { value: Best; size?: number } = $props();

	const STAR =
		'M8 1 L10 5.9 L15.4 6.4 L11.3 9.9 L12.6 15.2 L8 12.4 L3.4 15.2 L4.7 9.9 L0.6 6.4 L5.4 5.9 Z';
</script>

<span class="stars" aria-label="{value} of 3 stars">
	{#each [1, 2, 3] as n (n)}
		<svg viewBox="0 0 16 16" width={size} height={size} aria-hidden="true">
			<path d={STAR} class:earned={n <= value} />
		</svg>
	{/each}
</span>

<style>
	.stars {
		display: inline-flex;
		gap: 2px;
		line-height: 0;
	}
	path {
		fill: #ded7d0;
	}
	path.earned {
		fill: #d89a4a;
	}
</style>

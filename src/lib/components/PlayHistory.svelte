<script lang="ts">
	// Stars earned per day. The store has kept this since the first commit but
	// nothing ever showed it; a parent wants to see the days a child played.
	// Four weeks fits a phone without scrolling and covers a useful stretch.
	import { progress, today } from '$lib/progress.svelte';

	const DAYS = 28;

	const days = $derived.by(() => {
		const out: { key: string; stars: number; label: string }[] = [];
		const d = new Date();
		d.setDate(d.getDate() - (DAYS - 1));
		for (let i = 0; i < DAYS; i++) {
			const key = today(d);
			out.push({
				key,
				stars: progress.data.days[key]?.stars ?? 0,
				label: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
			});
			d.setDate(d.getDate() + 1);
		}
		return out;
	});

	const best = $derived(Math.max(1, ...days.map((d) => d.stars)));
	const streak = $derived(progress.streak);
</script>

<section class="history">
	<p class="line">
		<b>{progress.todayStars}</b> today
		{#if streak > 1}<span>&middot; {streak} days in a row</span>{/if}
	</p>
	<p class="caption">last 4 weeks</p>
	<div class="grid">
		{#each days as d (d.key)}
			<i
				class:on={d.stars > 0}
				style="--w:{d.stars ? 0.35 + 0.65 * (d.stars / best) : 0}"
				title="{d.label}: {d.stars} {d.stars === 1 ? 'star' : 'stars'}"
			></i>
		{/each}
	</div>
</section>

<style>
	.history {
		padding: 4px 16px 22px;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 6px;
	}
	.caption {
		margin: 0;
		font-size: 11px;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: #a89fb0;
	}
	.line {
		margin: 0;
		font-size: 13px;
		color: #8a8090;
	}
	.line b {
		color: #d89a4a;
		font-size: 15px;
	}
	.grid {
		display: grid;
		grid-template-columns: repeat(14, 1fr);
		gap: 4px;
		width: 100%;
		max-width: 300px;
	}
	i {
		display: block;
		aspect-ratio: 1;
		border-radius: 3px;
		background: #ece5da;
	}
	i.on {
		background: color-mix(in srgb, #d89a4a calc(var(--w) * 100%), #ece5da);
	}
</style>

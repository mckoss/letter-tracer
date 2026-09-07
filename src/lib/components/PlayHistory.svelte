<script lang="ts">
	// Stars earned per day, laid out as a calendar: seven weekday columns by four
	// week rows, so a column is always the same day of the week and a parent can
	// see at a glance that it is always Saturdays, or never Mondays.
	//
	// Weeks start on Sunday, which is the convention where this is used.
	import { progress, today } from '$lib/progress.svelte';

	const WEEKS = 4;
	const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

	type Cell = { key: string; stars: number; future: boolean; isToday: boolean; label: string };

	const cells = $derived.by(() => {
		const now = new Date();
		// Run to the end of the current week, so today is never in the last column
		// unless it happens to be Saturday.
		const end = new Date(now);
		end.setDate(now.getDate() + (6 - now.getDay()));
		const start = new Date(end);
		start.setDate(end.getDate() - (WEEKS * 7 - 1));

		const todayKey = today(now);
		const out: Cell[] = [];
		for (let i = 0; i < WEEKS * 7; i++) {
			const d = new Date(start);
			d.setDate(start.getDate() + i);
			const key = today(d);
			out.push({
				key,
				stars: progress.data.days[key]?.stars ?? 0,
				// ISO dates compare correctly as strings.
				future: key > todayKey,
				isToday: key === todayKey,
				label: d.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })
			});
		}
		return out;
	});

	const best = $derived(Math.max(1, ...cells.map((c) => c.stars)));
	const streak = $derived(progress.streak);
</script>

<section class="history">
	<p class="line">
		<b>{progress.todayStars}</b> today
		{#if streak > 1}<span>&middot; {streak} days in a row</span>{/if}
	</p>
	<p class="caption">last 4 weeks</p>
	<div class="cal">
		{#each WEEKDAYS as w, i (i)}
			<span class="dow" aria-hidden="true">{w}</span>
		{/each}
		{#each cells as c (c.key)}
			<i
				class:on={c.stars > 0}
				class:future={c.future}
				class:today={c.isToday}
				style="--w:{c.stars ? 0.35 + 0.65 * (c.stars / best) : 0}"
				title="{c.label}: {c.stars} {c.stars === 1 ? 'star' : 'stars'}"
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
	.line {
		margin: 0;
		font-size: 13px;
		color: #8a8090;
	}
	.line b {
		color: #d89a4a;
		font-size: 15px;
	}
	.caption {
		margin: 0;
		font-size: 11px;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: #a89fb0;
	}
	.cal {
		display: grid;
		grid-template-columns: repeat(7, 1fr);
		gap: 4px;
		width: 100%;
		max-width: 232px;
	}
	.dow {
		font-size: 10px;
		text-align: center;
		color: #b3aabb;
		line-height: 1.4;
	}
	i {
		display: block;
		aspect-ratio: 1;
		border-radius: 4px;
		background: #ece5da;
	}
	i.on {
		background: color-mix(in srgb, #d89a4a calc(var(--w) * 100%), #ece5da);
	}
	/* Days that have not happened yet read as absent, not as days with no play. */
	i.future {
		background: none;
		box-shadow: inset 0 0 0 1px #efe9e0;
	}
	i.today {
		outline: 2px solid #c34c3e;
		outline-offset: 1px;
	}
</style>

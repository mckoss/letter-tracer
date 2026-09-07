<script lang="ts">
	// A button a toddler cannot fire by accident. Tapping does nothing; the
	// action needs a deliberate press and hold, with a ring filling to show how
	// long is left. Used for the controls that undo or leave work -- going home
	// and rubbing out.
	import type { Snippet } from 'svelte';

	let {
		onhold,
		label,
		duration = 650,
		children
	}: { onhold: () => void; label: string; duration?: number; children: Snippet } = $props();

	let holding = $state(false);
	let timer: ReturnType<typeof setTimeout> | undefined;

	function start(e: PointerEvent) {
		e.preventDefault();
		holding = true;
		timer = setTimeout(() => {
			holding = false;
			onhold();
		}, duration);
	}

	function cancel() {
		holding = false;
		clearTimeout(timer);
	}
</script>

<button
	type="button"
	aria-label="{label} (press and hold)"
	class:holding
	onpointerdown={start}
	onpointerup={cancel}
	onpointerleave={cancel}
	onpointercancel={cancel}
	oncontextmenu={(e) => e.preventDefault()}
>
	{@render children()}
	<svg class="ring" viewBox="0 0 44 44" aria-hidden="true">
		<circle cx="22" cy="22" r="20" style="--dur:{duration}ms" />
	</svg>
</button>

<style>
	button {
		position: relative;
		border: 0;
		background: none;
		padding: 0;
		width: 46px;
		height: 46px;
		display: grid;
		place-items: center;
		border-radius: 50%;
		cursor: pointer;
		touch-action: none;
		-webkit-tap-highlight-color: transparent;
	}
	button :global(svg:not(.ring)) {
		width: 34px;
		height: 34px;
	}
	.ring {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
		transform: rotate(-90deg);
	}
	.ring circle {
		fill: none;
		stroke: #c34c3e;
		stroke-width: 3.5;
		stroke-linecap: round;
		stroke-dasharray: 126;
		stroke-dashoffset: 126;
	}
	.holding .ring circle {
		animation: fill var(--dur) linear forwards;
	}
	.holding :global(svg:not(.ring)) {
		transform: scale(0.88);
		transition: transform 120ms ease;
	}
	@keyframes fill {
		to {
			stroke-dashoffset: 0;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.holding .ring circle {
			animation: none;
			stroke-dashoffset: 40;
		}
	}
</style>

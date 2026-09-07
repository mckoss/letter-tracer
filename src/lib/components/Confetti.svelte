<script lang="ts">
	// A confetti cannon, simulated rather than animated: pieces are fired from
	// the bottom corners of the screen, arc up under gravity and air drag, then
	// flutter down. Every burst is seeded randomly, so no two look alike.
	//
	// The tumble is the trick that makes paper read as paper: each piece spins
	// about its own long axis, and squashing its height by cos(phase) turns it
	// edge-on and back. The reverse face is drawn darker, so pieces flicker
	// between light and shade the way real confetti does.
	import { onDestroy } from 'svelte';

	type Piece = {
		x: number;
		y: number;
		vx: number;
		vy: number;
		w: number;
		h: number;
		color: string;
		phase: number;
		spin: number;
		tilt: number;
		tiltSpin: number;
		drag: number;
	};

	const COLORS = ['#C34C3E', '#D89A4A', '#3E7C7B', '#4C7A4A', '#7C6B9E', '#E8B04B', '#D96A5B'];
	const GRAVITY = 1000; // px/s²
	const FLUTTER = 90; // sideways force as a piece turns edge-on
	const MAX_PIECES = 420;

	let canvas: HTMLCanvasElement | undefined = $state();
	let pieces: Piece[] = [];
	let raf = 0;
	let last = 0;

	const rand = (a: number, b: number) => a + Math.random() * (b - a);

	function resize() {
		if (!canvas) return;
		const dpr = Math.min(window.devicePixelRatio || 1, 2);
		canvas.width = canvas.clientWidth * dpr;
		canvas.height = canvas.clientHeight * dpr;
		canvas.getContext('2d')?.setTransform(dpr, 0, 0, dpr, 0, 0);
	}

	function darken(hex: string): string {
		const c = [1, 3, 5].map((i) => Math.round(parseInt(hex.slice(i, i + 2), 16) * 0.62));
		return `rgb(${c[0]},${c[1]},${c[2]})`;
	}

	/** Fire a burst. `count` scales the celebration to how well the letter went. */
	export function fire(count = 150) {
		if (!canvas) return;
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		resize();
		const w = canvas.clientWidth;
		const h = canvas.clientHeight;
		for (let i = 0; i < count; i++) {
			// Two cannons in the bottom corners, both aimed up and inward.
			const left = i % 2 === 0;
			const angle = rand(Math.PI / 3.2, Math.PI / 2.15); // above horizontal
			const speed = rand(0.95, 1.5) * Math.hypot(w, h) * 1.15;
			pieces.push({
				x: left ? rand(-10, w * 0.16) : rand(w * 0.84, w + 10),
				y: h + rand(0, 18),
				vx: Math.cos(angle) * speed * (left ? 1 : -1),
				vy: -Math.sin(angle) * speed,
				w: rand(6, 11),
				h: rand(9, 16),
				color: COLORS[(Math.random() * COLORS.length) | 0],
				phase: rand(0, Math.PI * 2),
				spin: rand(6, 15) * (Math.random() < 0.5 ? -1 : 1),
				tilt: rand(0, Math.PI * 2),
				tiltSpin: rand(-3.5, 3.5),
				drag: rand(1.1, 2.1)
			});
		}
		if (pieces.length > MAX_PIECES) pieces = pieces.slice(-MAX_PIECES);
		if (!raf) {
			last = performance.now();
			raf = requestAnimationFrame(step);
		}
	}

	function step(now: number) {
		const ctx = canvas?.getContext('2d');
		if (!canvas || !ctx) return;
		// Clamp so a backgrounded tab does not fling everything off screen at once.
		const dt = Math.min((now - last) / 1000, 1 / 30);
		last = now;
		const h = canvas.clientHeight;

		ctx.clearRect(0, 0, canvas.clientWidth, h);
		const alive: Piece[] = [];
		for (const p of pieces) {
			p.phase += p.spin * dt;
			p.tilt += p.tiltSpin * dt;
			p.vy += GRAVITY * dt;
			// Broadside-on, a piece catches the air and slides sideways.
			p.vx += Math.sin(p.phase) * FLUTTER * dt;
			const k = 1 - p.drag * dt;
			p.vx *= k;
			p.vy *= k;
			p.x += p.vx * dt;
			p.y += p.vy * dt;

			if (p.y - 40 > h) continue; // gone below the screen for good
			alive.push(p);

			const flip = Math.cos(p.phase);
			ctx.save();
			ctx.translate(p.x, p.y);
			ctx.rotate(p.tilt);
			ctx.scale(1, Math.abs(flip) < 0.06 ? 0.06 : flip);
			ctx.fillStyle = flip < 0 ? darken(p.color) : p.color;
			ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
			ctx.restore();
		}
		pieces = alive;

		if (pieces.length) {
			raf = requestAnimationFrame(step);
		} else {
			raf = 0;
			ctx.clearRect(0, 0, canvas.clientWidth, h);
		}
	}

	onDestroy(() => {
		if (raf) cancelAnimationFrame(raf);
	});
</script>

<svelte:window onresize={resize} />
<canvas bind:this={canvas} aria-hidden="true"></canvas>

<style>
	canvas {
		position: fixed;
		inset: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
		z-index: 20;
	}
</style>

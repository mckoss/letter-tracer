// Turn a handwriting capture (exported from /capture/) into cursive stroke data.
//
//   node scripts/capture_to_glyphs.mjs scripts/handwriting/handwriting-2026-10-18.json
//   npx prettier --write src/lib/glyphs/cursive-strokes.ts
//
// writes src/lib/glyphs/cursive-strokes.ts. The strokes are the owner's own,
// in the order and direction they were written: this only cleans them up.
//
// For each letter the last sample saved is used. Each stroke is
//   1. split at its sharp turns -- the top of A, the bottom of a retrace --
//      so those stay sharp instead of being rounded off,
//   2. smoothed lightly, to take out finger jitter,
//   3. simplified (Ramer-Douglas-Peucker), and
//   4. drawn back as a Catmull-Rom spline through what is left, as cubics.
// A stroke of one point is a dot, as on i and j.
//
// Each letter is centred on x = 50, so it sits in the middle of the tile and
// the tracing stage however far left or right it happened to be written.
//
// Capitals join the letter after them when one of their strokes ends low on the
// right, the way an exit stroke does; JOINS records which. Lowercase letters
// always exit from their first stroke.

import { readFileSync, writeFileSync } from 'node:fs';

const [, , input, output = 'src/lib/glyphs/cursive-strokes.ts'] = process.argv;
if (!input) {
	console.error('usage: node scripts/capture_to_glyphs.mjs <capture.json> [output.ts]');
	process.exit(1);
}

/** Turn sharper than this, in degrees, keeps a corner. */
const CORNER = 100;
/** Simplification tolerance in glyph units. */
const EPSILON = 0.6;

const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
const len = (v) => Math.hypot(v[0], v[1]);

function dedupe(pts) {
	const out = [pts[0]];
	for (const p of pts.slice(1)) if (len(sub(p, out[out.length - 1])) > 0.3) out.push(p);
	return out;
}

/** Indices where the line turns back on itself. */
function corners(pts) {
	const out = [];
	const k = 2;
	for (let i = k; i < pts.length - k; i++) {
		const a = sub(pts[i], pts[i - k]);
		const b = sub(pts[i + k], pts[i]);
		const cos = (a[0] * b[0] + a[1] * b[1]) / (len(a) * len(b) || 1);
		if ((Math.acos(Math.max(-1, Math.min(1, cos))) * 180) / Math.PI > CORNER) out.push(i);
	}
	// One corner per turn: keep the sharpest point of each run.
	const kept = [];
	for (const i of out) {
		const last = kept[kept.length - 1];
		if (last !== undefined && i - last <= k) {
			const turn = (j) => {
				const a = sub(pts[j], pts[j - k]);
				const b = sub(pts[j + k], pts[j]);
				return (a[0] * b[0] + a[1] * b[1]) / (len(a) * len(b) || 1);
			};
			if (turn(i) < turn(last)) kept[kept.length - 1] = i;
		} else kept.push(i);
	}
	return kept;
}

function smooth(pts) {
	if (pts.length < 3) return pts;
	return pts.map((p, i) => {
		if (i === 0 || i === pts.length - 1) return p;
		const a = pts[i - 1];
		const b = pts[i + 1];
		return [(a[0] + 2 * p[0] + b[0]) / 4, (a[1] + 2 * p[1] + b[1]) / 4];
	});
}

function rdp(pts, eps) {
	if (pts.length < 3) return pts;
	const [a, b] = [pts[0], pts[pts.length - 1]];
	const ab = sub(b, a);
	const L = len(ab) || 1;
	let worst = 0;
	let at = 0;
	for (let i = 1; i < pts.length - 1; i++) {
		const ap = sub(pts[i], a);
		const d = Math.abs(ab[0] * ap[1] - ab[1] * ap[0]) / L;
		if (d > worst) [worst, at] = [d, i];
	}
	if (worst <= eps) return [a, b];
	return [...rdp(pts.slice(0, at + 1), eps).slice(0, -1), ...rdp(pts.slice(at), eps)];
}

const f = (n) => String(Math.round(n * 10) / 10);

/** Cubic segments of a Catmull-Rom spline through `pts`, ends one-sided. */
function spline(pts) {
	const out = [];
	for (let i = 0; i < pts.length - 1; i++) {
		const p0 = pts[i - 1] ?? pts[i];
		const p1 = pts[i];
		const p2 = pts[i + 1];
		const p3 = pts[i + 2] ?? p2;
		const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
		const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
		out.push(`C${f(c1[0])} ${f(c1[1])} ${f(c2[0])} ${f(c2[1])} ${f(p2[0])} ${f(p2[1])}`);
	}
	return out;
}

/** Arc length from point i to point j along the line. */
function arc(pts, i, j) {
	let d = 0;
	for (let k = i; k < j; k++) d += len(sub(pts[k + 1], pts[k]));
	return d;
}

/**
 * A finger flicks as it lands and as it lifts, leaving a hook that turns sharply
 * off the line. Nobody is taught to draw that, so a sharp turn this close to
 * either end of a stroke is cut off there.
 */
const FLICK = 4;
/**
 * And a finger that runs a downstroke into the baseline bounces back up off it
 * before it lifts -- the foot of H and K came back 9 and 14 units. A turn below
 * the baseline is never the shape of a letter's end, so it is cut off from
 * further away. Turns up at the top are left alone: that is where flourishes
 * like the end of W live.
 */
const BOUNCE = 15;

function trimEnds(pts, base) {
	let turns = corners(pts);
	const first = turns[0];
	if (first !== undefined) {
		const d = arc(pts, 0, first);
		if (d < FLICK || (d < BOUNCE && pts[first][1] > base)) pts = pts.slice(first);
	}
	turns = corners(pts);
	const last = turns[turns.length - 1];
	if (last !== undefined) {
		const d = arc(pts, last, pts.length - 1);
		if (d < FLICK || (d < BOUNCE && pts[last][1] > base)) pts = pts.slice(0, last + 1);
	}
	return pts;
}

function strokePath(raw, dx, base) {
	let pts = dedupe(raw.map((p) => [p[0] + dx, p[1]]));
	if (pts.length === 1)
		return `M${f(pts[0][0])} ${f(pts[0][1])} L${f(pts[0][0])} ${f(pts[0][1] + 1)}`;
	pts = trimEnds(pts, base);
	const cuts = [0, ...corners(pts), pts.length - 1];
	const parts = [];
	for (let i = 0; i < cuts.length - 1; i++) {
		const piece = pts.slice(cuts[i], cuts[i + 1] + 1);
		parts.push(...spline(rdp(smooth(piece), EPSILON)));
	}
	return `M${f(pts[0][0])} ${f(pts[0][1])} ${parts.join(' ')}`;
}

const capture = JSON.parse(readFileSync(input, 'utf8'));
const upper = {};
const lower = {};
const joins = {};
for (const [letter, samples] of Object.entries(capture.letters)) {
	const strokes = samples[samples.length - 1].strokes;
	const all = strokes.flat();
	const x0 = Math.min(...all.map((p) => p[0]));
	const x1 = Math.max(...all.map((p) => p[0]));
	const dx = 50 - (x0 + x1) / 2;
	const paths = strokes.map((s) => strokePath(s, dx, capture.box.base));
	if (letter === letter.toUpperCase()) {
		upper[letter] = paths;
		const exit = strokes.findIndex((s) => {
			const [x, y] = s[s.length - 1];
			return x >= x1 - 12 && y >= capture.box.mid - 10;
		});
		if (exit >= 0) joins[letter] = exit;
	} else lower[letter] = paths;
}

const order = (o) =>
	Object.fromEntries(
		Object.keys(o)
			.sort()
			.map((k) => [k, o[k]])
	);
const body = (o) => JSON.stringify(order(o), null, '\t').replace(/"([A-Za-z])":/g, '$1:');
writeFileSync(
	output,
	`// GENERATED by scripts/capture_to_glyphs.mjs from ${input.split('/').pop()}.
// Do not edit by hand: capture again at /capture/ and regenerate.
//
// The owner's own cursive, one path per stroke in the order and direction it
// was written, in glyph units on the app's ruling (base 110, midline 60).

export const CURSIVE_UPPER: Record<string, string[]> = ${body(upper)};

export const CURSIVE_LOWER: Record<string, string[]> = ${body(lower)};

/** Capitals that join the next letter, and which of their strokes carries the exit. */
export const JOINS: Record<string, number> = ${body(joins)};
`
);
console.log(
	`wrote ${output}: ${Object.keys(upper).length} capitals, ${Object.keys(lower).length} lowercase, joins ${Object.keys(order(joins)).join('')}`
);

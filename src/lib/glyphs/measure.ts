// Browser-side path geometry. Every measurement the app needs -- sample points,
// start position, initial tangent, glyph extents -- comes from the browser's own
// SVG path implementation, so no glyph carries measured data of its own.
//
// All of this needs a live document, so callers must guard on `browser`.

import { DOT_LENGTH } from './data';
import type { Pt } from '$lib/trace/engine';

const NS = 'http://www.w3.org/2000/svg';

let scratchPath: SVGPathElement | null = null;

/** One reused offscreen path element; creating them per call is measurably slower. */
function scratch(d: string): SVGPathElement {
	if (!scratchPath) {
		const svg = document.createElementNS(NS, 'svg');
		svg.setAttribute('viewBox', '0 0 100 140');
		svg.setAttribute('aria-hidden', 'true');
		svg.setAttribute('style', 'position:absolute;width:0;height:0;overflow:hidden');
		scratchPath = document.createElementNS(NS, 'path');
		svg.appendChild(scratchPath);
		document.body.appendChild(svg);
	}
	scratchPath.setAttribute('d', d);
	return scratchPath;
}

export type StrokeInfo = {
	start: Pt;
	/** Degrees, for rotating the direction arrow. */
	angle: number;
	length: number;
	isDot: boolean;
};

/** Where a stroke begins and which way it heads off. */
export function strokeInfo(d: string): StrokeInfo {
	const el = scratch(d);
	const length = el.getTotalLength();
	const a = el.getPointAtLength(0);
	// Far enough along to get the real heading, close enough to still be the
	// start of the stroke on a tightly curved glyph like the bowl of `a`.
	const b = el.getPointAtLength(Math.min(10, length * 0.35));
	return {
		start: { x: a.x, y: a.y },
		angle: (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI,
		length,
		isDot: length < DOT_LENGTH
	};
}

/** Arc-length-ordered points along a stroke, roughly `spacing` units apart. */
export function samplePoints(d: string, spacing = 1.5): Pt[] {
	const el = scratch(d);
	const length = el.getTotalLength();
	const n = Math.max(2, Math.ceil(length / spacing) + 1);
	const pts: Pt[] = new Array(n);
	for (let i = 0; i < n; i++) {
		const p = el.getPointAtLength((length * i) / (n - 1));
		pts[i] = { x: p.x, y: p.y };
	}
	return pts;
}

/** Ink extents of a whole glyph, used to set advances when typesetting a word. */
export function glyphExtents(strokes: string[]): {
	x0: number;
	x1: number;
	y0: number;
	y1: number;
} {
	let x0 = Infinity;
	let x1 = -Infinity;
	let y0 = Infinity;
	let y1 = -Infinity;
	for (const d of strokes) {
		const b = scratch(d).getBBox();
		x0 = Math.min(x0, b.x);
		x1 = Math.max(x1, b.x + b.width);
		y0 = Math.min(y0, b.y);
		y1 = Math.max(y1, b.y + b.height);
	}
	return { x0, x1, y0, y1 };
}

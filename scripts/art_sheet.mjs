#!/usr/bin/env node
// Render word pictures to a PNG contact sheet, to look at while drawing them.
//
//     node scripts/art_sheet.mjs out.png                 # every picture
//     node scripts/art_sheet.mjs out.png cat duck lion   # just these
//     node scripts/art_sheet.mjs out.png --size 96 ...   # at the size the app shows
//
// Loads src/lib/art through Vite, so it renders exactly what the app would, and
// photographs the sheet with Playwright. A development aid; nothing ships.

import { createRequire } from 'node:module';
import { createServer } from 'vite';

const args = process.argv.slice(2);
const out = args.shift();
if (!out) {
	console.error('usage: art_sheet.mjs <out.png> [--size N] [names...]');
	process.exit(2);
}
let size = 160;
const si = args.indexOf('--size');
if (si >= 0) {
	size = Number(args[si + 1]);
	args.splice(si, 2);
}

const vite = await createServer({
	server: { middlewareMode: true },
	appType: 'custom',
	logLevel: 'error'
});
let html;
try {
	const { art, SUBJECT_NAMES } = await vite.ssrLoadModule('/src/lib/art/index.ts');
	const names = args.length ? args : SUBJECT_NAMES;
	const missing = names.filter((n) => !SUBJECT_NAMES.includes(n));
	if (missing.length) console.error(`not drawn: ${missing.join(', ')}`);
	const cells = names
		.filter((n) => SUBJECT_NAMES.includes(n))
		.map((n) => `<figure>${art(n, size)}<figcaption>${n}</figcaption></figure>`)
		.join('');
	html = `<!doctype html><meta charset="utf-8"><style>
		body{margin:0;padding:12px;background:#f5efe3;font:13px system-ui;display:flex;flex-wrap:wrap;gap:10px;width:${(size + 16) * 6}px}
		figure{margin:0;padding:6px;background:#fff;border-radius:10px;text-align:center}
		figcaption{color:#5e5a66;margin-top:2px}</style>${cells}`;
} finally {
	await vite.close();
}

const { chromium } = createRequire(import.meta.url)('playwright');
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: (size + 16) * 6 + 40, height: 400 } });
await page.setContent(html);
await page.screenshot({ path: out, fullPage: true });
await browser.close();
console.log(`wrote ${out}`);

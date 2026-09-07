/// <reference types="@sveltejs/kit" />
/// <reference lib="webworker" />

// Precache everything on install, then serve from cache. The whole app --
// letterforms, word art, the two celebration sounds -- is a few hundred KB, so
// there is no reason for any of it to need the network after the first visit.

import { base, build, files, prerendered, version } from '$service-worker';

declare const self: ServiceWorkerGlobalScope;

const CACHE = `letter-tracer-${version}`;

/**
 * `build` is the compiled app, `files` is everything in static/, and
 * `prerendered` is the HTML for each route. Without the last of those the app
 * loads offline but every page but the entry one 404s.
 */
const ASSETS = [...build, ...files, ...prerendered];

self.addEventListener('install', (event) => {
	event.waitUntil(
		caches
			.open(CACHE)
			.then((cache) => cache.addAll(ASSETS))
			.then(() => self.skipWaiting())
	);
});

self.addEventListener('activate', (event) => {
	event.waitUntil(
		caches
			.keys()
			.then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
			.then(() => self.clients.claim())
	);
});

self.addEventListener('fetch', (event) => {
	const { request } = event;
	if (request.method !== 'GET') return;

	const url = new URL(request.url);
	if (url.origin !== self.location.origin) return;

	event.respondWith(
		(async () => {
			const cache = await caches.open(CACHE);

			// Pages go to the network first, so a deploy takes effect on the next
			// load rather than the one after it. Serving the HTML shell cache-first
			// means a returning visitor gets the previous build and has to reload
			// twice to see a change -- which reads as "my fix did not ship".
			// The cache stays the offline fallback.
			if (request.mode === 'navigate') {
				try {
					const fresh = await fetch(request);
					if (fresh.status === 200) cache.put(request, fresh.clone());
					return fresh;
				} catch {
					const hit = (await cache.match(request)) ?? (await cache.match(`${base}/`));
					if (hit) return hit;
					throw new Error('offline and not cached');
				}
			}

			// Build assets are content-hashed, so cache-first is always correct for
			// them: a changed file arrives under a new name.
			if (ASSETS.includes(url.pathname)) {
				const hit = await cache.match(url.pathname);
				if (hit) return hit;
			}

			try {
				const response = await fetch(request);
				// Opaque and error responses are not worth keeping.
				if (response.status === 200 && response.type === 'basic') {
					cache.put(request, response.clone());
				}
				return response;
			} catch {
				// Offline: fall back to whatever we have, including the prerendered
				// page for this route.
				const hit = (await cache.match(request)) ?? (await cache.match(`${base}/`));
				if (hit) return hit;
				throw new Error('offline and not cached');
			}
		})()
	);
});

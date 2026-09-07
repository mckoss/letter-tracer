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

			// Everything in ASSETS is versioned and was precached on install, so it
			// can be served straight from the cache without touching the network.
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

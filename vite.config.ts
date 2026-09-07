import { defineConfig } from 'vitest/config';
import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import pkg from './package.json' with { type: 'json' };

// GitHub Pages serves the app from /<repo>, so the CI build sets BASE_PATH.
// Local builds and dev stay at the root.
const base = (process.env.BASE_PATH ?? '') as '' | `/${string}`;

export default defineConfig({
	define: {
		__APP_VERSION__: JSON.stringify(pkg.version)
	},
	plugins: [
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},
			adapter: adapter(),
			paths: {
				base,
				// Absolute, not relative: the sound module builds URLs at runtime from
				// `base`, and relative asset paths make that resolve against whichever
				// route is open rather than the app root.
				relative: false
			}
		})
	],
	test: {
		expect: { requireAssertions: true },
		projects: [
			{
				extends: './vite.config.ts',
				test: {
					name: 'server',
					environment: 'node',
					include: ['src/**/*.{test,spec}.{js,ts}'],
					exclude: ['src/**/*.svelte.{test,spec}.{js,ts}']
				}
			}
		]
	}
});

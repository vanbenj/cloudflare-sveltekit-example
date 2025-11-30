import { sveltekit } from '@sveltejs/kit/vite';
import { cloudflare } from "@cloudflare/vite-plugin";
import { defineConfig } from 'vite';
import devtoolsJson from 'vite-plugin-devtools-json';

export default defineConfig({
	plugins: [ 
		sveltekit(),
		cloudflare({
			configPath: "./wrangler.jsonc",
			auxiliaryWorkers: [
				{
					configPath: "../backend/wrangler.jsonc",
				},
			],
		}),
		devtoolsJson()
	]
});

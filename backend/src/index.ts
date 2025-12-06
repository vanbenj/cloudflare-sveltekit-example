/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.jsonc`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export { TestDurableObject } from './test-do';
export { MessageCoordinator } from './message-coordinator';
export { CountdownTimer } from './countdown-timer';

export default {
	async fetch(request, env, ctx): Promise<Response> {
		const url = new URL(request.url);

		// Handle WebSocket connections
		if (url.pathname === '/ws/connect') {
			console.log('[Backend] WebSocket connect request');

			if (request.headers.get('Upgrade') !== 'websocket') {
				return new Response('Expected Upgrade: websocket', { status: 426 });
			}

			const id = env.MESSAGE_COORDINATOR.idFromName('global');
			const stub = env.MESSAGE_COORDINATOR.get(id);
			return stub.fetch(request);
		}

		// Handle broadcast requests (for the countdown action)
		if (url.pathname === '/broadcast' && request.method === 'POST') {
			console.log('[Backend] Broadcast request');
			const id = env.MESSAGE_COORDINATOR.idFromName('global');
			const stub = env.MESSAGE_COORDINATOR.get(id);
			return stub.fetch(request);
		}

		return new Response('This worker exports Durable Objects');
	},
} satisfies ExportedHandler<Env>;


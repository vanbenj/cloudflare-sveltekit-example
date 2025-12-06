import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ request, platform }) => {
	console.log('WebSocket connect request received');

	if (!platform) {
		console.error('Platform not available');
		return new Response('Platform not available', { status: 500 });
	}

	if (!platform.env?.MESSAGE_COORDINATOR) {
		console.error('MESSAGE_COORDINATOR binding not available');
		return new Response('MESSAGE_COORDINATOR binding not available', { status: 500 });
	}

	const upgradeHeader = request.headers.get('Upgrade');
	console.log('Upgrade header:', upgradeHeader);

	if (upgradeHeader !== 'websocket') {
		return new Response('Expected Upgrade: websocket', { status: 426 });
	}

	try {
		// Use a global coordinator for all connections
		const durableObjectId = platform.env.MESSAGE_COORDINATOR.idFromName('global');
		const stub = platform.env.MESSAGE_COORDINATOR.get(durableObjectId);
		console.log('Forwarding to Durable Object');
		return stub.fetch(request);
	} catch (error) {
		console.error('Error connecting to Durable Object:', error);
		return new Response(`Error: ${error}`, { status: 500 });
	}
};

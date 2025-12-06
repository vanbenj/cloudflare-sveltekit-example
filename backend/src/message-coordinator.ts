import { DurableObject } from 'cloudflare:workers';

export class MessageCoordinator extends DurableObject<Env> {
	constructor(ctx: DurableObjectState, env: Env) {
		super(ctx, env);
		console.log('[MessageCoordinator] Constructor called');
	}

	async fetch(request: Request): Promise<Response> {
		console.log('[MessageCoordinator] fetch called', {
			method: request.method,
			url: request.url,
			upgrade: request.headers.get('Upgrade')
		});

		if (request.headers.get('Upgrade') === 'websocket') {
			console.log('[MessageCoordinator] Handling WebSocket upgrade');
			return this.handleWebSocket(request);
		}

		// Handle message broadcasting
		if (request.method === 'POST') {
			console.log('[MessageCoordinator] Handling POST broadcast');
			const message = await request.json();
			return this.broadcast(message);
		}

		return new Response('MessageCoordinator active', { status: 200 });
	}

	private async handleWebSocket(_request: Request): Promise<Response> {
		console.log('[MessageCoordinator] Creating WebSocket pair');
		const pair = new WebSocketPair();
		const [client, server] = Object.values(pair);

		console.log('[MessageCoordinator] Accepting WebSocket');
		this.ctx.acceptWebSocket(server);

		console.log('[MessageCoordinator] Returning 101 response');
		return new Response(null, { status: 101, webSocket: client });
	}

	private async broadcast(message: unknown): Promise<Response> {
		const messageStr = JSON.stringify(message);
		console.log('Broadcasting message:', messageStr);
		const sessions = this.ctx.getWebSockets();

		for (const session of sessions) {
			try {
				session.send(messageStr);
			} catch {
				session.close(1011, 'gone');
			}
		}
		return new Response('Message sent', { status: 200 });
	}

	async webSocketOpen(ws: WebSocket) {
		console.log('[MessageCoordinator] WebSocket opened, total connections:', this.ctx.getWebSockets().length);
	}

	async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer) {
		console.log('[MessageCoordinator] WebSocket message received:', message);
		// Handle incoming messages - broadcast to all connected clients
		const sessions = this.ctx.getWebSockets();

		for (const session of sessions) {
			try {
				session.send(message);
			} catch {
				session.close(1011, 'gone');
			}
		}
	}

	async webSocketClose(_ws: WebSocket, code: number, reason: string, wasClean: boolean) {
		console.log(`[MessageCoordinator] WebSocket closed: ${code} ${reason} (clean: ${wasClean})`);
	}

	async webSocketError(_ws: WebSocket, error: Error) {
		console.error('[MessageCoordinator] WebSocket error:', error);
	}
}

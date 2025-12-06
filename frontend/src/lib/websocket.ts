import { writable, get } from 'svelte/store';

export interface WebSocketMessage {
	count: number;
	timestamp: number;
}

export class WebSocketManager {
	private ws: WebSocket | null = null;
	private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
	private reconnectDelay = 1000;
	private isExplicitDisconnect = false;
	private enabled = false;

	public status = writable<'connecting' | 'connected' | 'disconnected'>('disconnected');
	public messages = writable<WebSocketMessage[]>([]);

	constructor() {}

	setEnabled(enabled: boolean) {
		this.enabled = enabled;
		if (enabled) {
			this.connect();
		} else {
			this.disconnect();
		}
	}

	getCurrentStatus(): 'connecting' | 'connected' | 'disconnected' {
		return get(this.status);
	}

	connect() {
		if (!this.enabled) {
			return;
		}

		const currentStatus = this.getCurrentStatus();
		if (currentStatus === 'connecting' || currentStatus === 'connected') {
			return;
		}

		this.isExplicitDisconnect = false;
		this.status.set('connecting');

		// In dev mode, connect directly to the backend worker on port 8787
		// In production, use the same host
		const isDev = import.meta.env.DEV;
		const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
		const host = import.meta.env.VITE_WS_HOST || (isDev ? 'localhost:8787' : window.location.host);
		const path = import.meta.env.VITE_WS_PATH || (isDev ? '/ws/connect' : '/api/ws/connect');
		const url = `${protocol}//${host}${path}`;

		console.log('[WebSocket] Connecting to:', url);
		this.ws = new WebSocket(url);

		this.ws.onopen = () => {
			this.status.set('connected');
			this.reconnectDelay = 1000;
		};

		this.ws.onmessage = (event) => {
			try {
				const message = JSON.parse(event.data) as WebSocketMessage;
				this.messages.update((msgs) => [...msgs, message]);
			} catch (err) {
				console.error('Failed to parse WebSocket message:', err);
			}
		};

		this.ws.onclose = () => {
			this.status.set('disconnected');

			if (!this.isExplicitDisconnect && this.enabled) {
				this.scheduleReconnect();
			}
		};

		this.ws.onerror = (error) => {
			console.error('WebSocket: Connection error:', error);
			this.ws?.close();
		};
	}

	private scheduleReconnect() {
		if (this.reconnectTimeout) return;
		if (!this.enabled) return;

		this.reconnectTimeout = setTimeout(() => {
			this.reconnectTimeout = null;
			this.reconnectDelay = Math.min(this.reconnectDelay * 2, 30000);
			this.connect();
		}, this.reconnectDelay);
	}

	disconnect() {
		this.isExplicitDisconnect = true;
		if (this.reconnectTimeout) {
			clearTimeout(this.reconnectTimeout);
			this.reconnectTimeout = null;
		}

		this.ws?.close();
		this.ws = null;
		this.status.set('disconnected');
	}

	clearMessages() {
		this.messages.set([]);
	}
}

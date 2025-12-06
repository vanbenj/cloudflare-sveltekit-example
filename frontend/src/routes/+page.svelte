<script lang="ts">
	import { onMount } from 'svelte';
	import { WebSocketManager, type WebSocketMessage } from '$lib/websocket';
	import WebSocketStatus from '$lib/components/WebSocketStatus.svelte';

	let { data } = $props();

	let message = $derived(data.message);
	let wsManager: WebSocketManager | null = $state(null);
	let status = $state<'connecting' | 'connected' | 'disconnected'>('disconnected');
	let messages = $state<WebSocketMessage[]>([]);
	let latestCount = $derived(messages.length > 0 ? messages[messages.length - 1].count : null);

	onMount(() => {
		wsManager = new WebSocketManager();

		// Subscribe to status changes
		const unsubStatus = wsManager.status.subscribe((s) => {
			status = s;
		});

		// Subscribe to message changes
		const unsubMessages = wsManager.messages.subscribe((m) => {
			messages = m;
		});

		// Enable WebSocket connection
		wsManager.setEnabled(true);

		return () => {
			unsubStatus();
			unsubMessages();
			wsManager?.disconnect();
		};
	});

	function clearMessages() {
		wsManager?.clearMessages();
	}
</script>

<h1>{message}</h1>

<div class="websocket-demo">
	<h2>WebSocket Countdown Demo</h2>

	{#if wsManager}
		<div class="status-row">
			<WebSocketStatus status={wsManager.status} />
		</div>
	{/if}

	<form method="POST" action="?/countdown">
		<button type="submit" disabled={status !== 'connected'}>
			Start Countdown
		</button>
	</form>

	{#if latestCount !== null}
		<div class="countdown-display">
			<span class="count">{latestCount}</span>
		</div>
	{/if}

	{#if messages.length > 0}
		<div class="messages">
			<h3>
				Messages received
				<button type="button" onclick={clearMessages}>Clear</button>
			</h3>
			<ul>
				{#each messages as msg}
					<li>Count: {msg.count} (at {new Date(msg.timestamp).toLocaleTimeString()})</li>
				{/each}
			</ul>
		</div>
	{/if}
</div>

<style>
	.websocket-demo {
		margin-top: 2rem;
		padding: 1rem;
		border: 1px solid #ccc;
		border-radius: 8px;
		max-width: 400px;
	}

	.status-row {
		margin-bottom: 1rem;
	}

	button {
		padding: 0.5rem 1rem;
		font-size: 1rem;
		cursor: pointer;
		background: #007bff;
		color: white;
		border: none;
		border-radius: 4px;
	}

	button:disabled {
		background: #ccc;
		cursor: not-allowed;
	}

	button:hover:not(:disabled) {
		background: #0056b3;
	}

	.countdown-display {
		margin: 1.5rem 0;
		text-align: center;
	}

	.count {
		font-size: 4rem;
		font-weight: bold;
		color: #007bff;
	}

	.messages {
		margin-top: 1rem;
		padding-top: 1rem;
		border-top: 1px solid #eee;
	}

	.messages h3 {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.5rem;
	}

	.messages h3 button {
		font-size: 0.75rem;
		padding: 0.25rem 0.5rem;
	}

	.messages ul {
		list-style: none;
		padding: 0;
		margin: 0;
		max-height: 200px;
		overflow-y: auto;
	}

	.messages li {
		padding: 0.25rem 0;
		font-size: 0.875rem;
		color: #666;
	}
</style>

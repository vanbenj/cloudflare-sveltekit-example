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

<h1 class="text-4xl font-bold mb-8 text-gray-900">{message}</h1>

<div class="mt-8 p-4 border border-gray-300 rounded-lg max-w-md bg-white shadow-sm">
	<h2 class="text-2xl font-semibold mb-4 text-gray-800">WebSocket Countdown Demo</h2>

	{#if wsManager}
		<div class="mb-4">
			<WebSocketStatus status={wsManager.status} />
		</div>
	{/if}

	<form method="POST" action="?/countdown">
		<button
			type="submit"
			disabled={status !== 'connected'}
			class="px-4 py-2 text-base cursor-pointer bg-blue-600 text-white border-none rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
		>
			Start Countdown
		</button>
	</form>

	{#if latestCount !== null}
		<div class="my-6 text-center">
			<span class="text-6xl font-bold text-blue-600">{latestCount}</span>
		</div>
	{/if}

	{#if messages.length > 0}
		<div class="mt-4 pt-4 border-t border-gray-200">
			<h3 class="flex justify-between items-center mb-2 text-lg font-medium">
				<span>Messages received</span>
				<button
					type="button"
					onclick={clearMessages}
					class="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
				>
					Clear
				</button>
			</h3>
			<ul class="list-none p-0 m-0 max-h-[200px] overflow-y-auto space-y-1">
				{#each messages as msg}
					<li class="py-1 text-sm text-gray-600">
						Count: {msg.count} (at {new Date(msg.timestamp).toLocaleTimeString()})
					</li>
				{/each}
			</ul>
		</div>
	{/if}
</div>


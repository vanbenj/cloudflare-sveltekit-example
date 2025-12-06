<script lang="ts">
	import type { Writable } from 'svelte/store';

	let { status }: { status: Writable<'connecting' | 'connected' | 'disconnected'> } = $props();

	const statusColor = $derived(
		$status === 'connected'
			? 'connected'
			: $status === 'connecting'
				? 'connecting'
				: 'disconnected'
	);

	const statusText = $derived(
		$status === 'connected'
			? 'Connected'
			: $status === 'connecting'
				? 'Connecting...'
				: 'Disconnected'
	);
</script>

<div class="websocket-status" title={statusText}>
	<span class="dot {statusColor}"></span>
	<span class="text">{statusText}</span>
</div>

<style>
	.websocket-status {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
	}

	.dot {
		width: 12px;
		height: 12px;
		border-radius: 50%;
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
	}

	.dot.connected {
		background-color: #22c55e;
	}

	.dot.connecting {
		background-color: #eab308;
		animation: pulse 1s ease-in-out infinite;
	}

	.dot.disconnected {
		background-color: #ef4444;
	}

	.text {
		font-size: 0.875rem;
		color: #666;
	}

	@keyframes pulse {
		0%, 100% {
			opacity: 1;
		}
		50% {
			opacity: 0.5;
		}
	}
</style>

import { DurableObject } from 'cloudflare:workers';

export class CountdownTimer extends DurableObject<Env> {
	constructor(ctx: DurableObjectState, env: Env) {
		super(ctx, env);
		console.log('[CountdownTimer] Constructor called');
	}

	async fetch(request: Request): Promise<Response> {
		const url = new URL(request.url);

		if (url.pathname === '/start' && request.method === 'POST') {
			return this.startCountdown();
		}

		if (url.pathname === '/stop' && request.method === 'POST') {
			return this.stopCountdown();
		}

		return new Response('CountdownTimer active', { status: 200 });
	}

	private async startCountdown(): Promise<Response> {
		// Store initial countdown state
		await this.ctx.storage.put('countdown', 10);
		await this.ctx.storage.put('active', true);

		// Send first message immediately
		await this.broadcastMessage(10);

		// Schedule alarm for 1 second from now
		await this.ctx.storage.setAlarm(Date.now() + 1000);

		return new Response(JSON.stringify({ success: true, message: 'Countdown started' }), {
			headers: { 'Content-Type': 'application/json' }
		});
	}

	private async stopCountdown(): Promise<Response> {
		await this.ctx.storage.delete('active');
		await this.ctx.storage.deleteAlarm();
		return new Response(JSON.stringify({ success: true, message: 'Countdown stopped' }), {
			headers: { 'Content-Type': 'application/json' }
		});
	}

	async alarm(): Promise<void> {
		const active = await this.ctx.storage.get<boolean>('active');
		if (!active) {
			console.log('[CountdownTimer] Countdown not active, ignoring alarm');
			return;
		}

		const count = await this.ctx.storage.get<number>('countdown');
		if (count === undefined || count === null) {
			console.log('[CountdownTimer] No countdown value found');
			return;
		}

		const nextCount = count - 1;

		if (nextCount >= 0) {
			// Broadcast the current count
			await this.broadcastMessage(nextCount);

			// Update stored countdown value
			await this.ctx.storage.put('countdown', nextCount);

			// Schedule next alarm if not done
			if (nextCount > 0) {
				await this.ctx.storage.setAlarm(Date.now() + 1000);
			} else {
				// Countdown complete
				await this.ctx.storage.delete('active');
				console.log('[CountdownTimer] Countdown complete');
			}
		}
	}

	private async broadcastMessage(count: number): Promise<void> {
		const messageCoordinatorId = this.env.MESSAGE_COORDINATOR.idFromName('global');
		const stub = this.env.MESSAGE_COORDINATOR.get(messageCoordinatorId);
		const message = { count, timestamp: Date.now() };

		try {
			await stub.fetch('http://do/broadcast', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(message)
			});
			console.log(`[CountdownTimer] Broadcasted count: ${count}`);
		} catch (error) {
			console.error('[CountdownTimer] Failed to broadcast message:', error);
		}
	}
}


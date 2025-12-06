import { DurableObject } from 'cloudflare:workers';

export class TestDurableObject extends DurableObject<Env, object> {

  constructor(state: DurableObjectState, env: Env) {
    super(state, env);
    console.log('[TestDurableObject] Constructor called');
  }

  async fetch(request: Request) {
    console.log('[TestDurableObject] fetch called', {
      method: request.method,
      url: request.url
    });
    return new Response(JSON.stringify({ message: 'Hello from a Durable Object' }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

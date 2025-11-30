import { DurableObject } from 'cloudflare:workers';

export class TestDurableObject extends DurableObject<Env, object> {

  constructor(state: DurableObjectState, env: Env) {
    super(state, env);
  }

  async fetch(request: Request) {
    return new Response(JSON.stringify({ message: 'Hello from a Durable Object' }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

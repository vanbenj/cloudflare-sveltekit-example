# Sveltekit Cloudflare Multi-Workers Demo

This project demonstrates [multi-worker development](https://developers.cloudflare.com/workers/development-testing/multi-workers/) with Cloudflare Workers, showcasing how to run multiple Workers locally using separate dev commands.

## Architecture

- **Backend Worker** (`backend/`): A Cloudflare Worker with Durable Objects (`TestDurableObject`) 
- **Frontend Worker** (`frontend/`): A SvelteKit application deployed as a Cloudflare Worker that accesses the backend's Durable Objects via `script_name` binding

The frontend references the backend's Durable Object namespace using the `script_name` configuration, allowing it to access Durable Objects defined in the backend Worker.

## Installation

Install dependencies and generate Cloudflare types in both folders:

```bash
# Backend
cd backend
pnpm install
pnpm cf-typegen

# Frontend
cd frontend
pnpm install
pnpm cf-typegen
```

## Development

Run both Workers in separate terminals:

```bash
# Terminal 1 - Backend (runs with wrangler dev)
cd backend
pnpm run dev

# Terminal 2 - Frontend (runs with vite dev)
cd frontend
pnpm run dev
```

The backend runs using `wrangler dev`, while the frontend runs using `vite dev` (via the Cloudflare Vite plugin). This approach uses the "multiple dev commands" pattern, where each Worker runs independently and can communicate via service bindings or Durable Object bindings across Workers.

## References

- [Multi-Workers Development Guide](https://developers.cloudflare.com/workers/development-testing/multi-workers/)
- [Durable Objects](https://developers.cloudflare.com/durable-objects/)
- [SvelteKit Cloudflare Adapter](https://kit.svelte.dev/docs/adapter-cloudflare)


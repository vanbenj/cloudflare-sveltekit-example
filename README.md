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

## WebSocket Demo

The main page includes a WebSocket countdown demo that demonstrates real-time communication using Cloudflare Durable Objects.

### How it works

1. **Click "Start Countdown"** - triggers a form action that sends 11 messages (10 to 0) spaced 1 second apart
2. **Messages broadcast via WebSocket** - the `MessageCoordinator` Durable Object broadcasts to all connected clients
3. **Real-time display** - the UI updates as each countdown message arrives

### Architecture

```
Browser ←WebSocket→ MessageCoordinator (Durable Object) ←POST→ SvelteKit Action
```

- `frontend/src/lib/websocket.ts` - WebSocket client with auto-reconnect
- `frontend/src/lib/components/WebSocketStatus.svelte` - Connection status indicator (red/amber/green)
- `backend/src/message-coordinator.ts` - Durable Object handling WebSocket connections and broadcasting

### Dev Mode WebSocket Workaround

In development, Vite's dev server intercepts all WebSocket connections for HMR (Hot Module Replacement), preventing SvelteKit routes from handling WebSocket upgrades.

**Solution**: The WebSocket client connects directly to the backend worker (port 8787) in dev mode. This is configured via environment variables:

- `VITE_WS_HOST` - WebSocket host (defaults to `localhost:8787` in dev, `window.location.host` in production)
- `VITE_WS_PATH` - WebSocket path (defaults to `/ws/connect` in dev, `/api/ws/connect` in production)

Create a `.env.dev` file in the `frontend/` directory with your development settings:

```bash
cd frontend
cat > .env.dev << EOF
VITE_WS_HOST=localhost:8787
VITE_WS_PATH=/ws/connect
EOF
```

You can override these values by setting environment variables or creating a `.env.local` file.

In production, there's no Vite server - all requests go directly through the Cloudflare Worker, so WebSocket upgrades work normally on the same origin.

## References

- [Multi-Workers Development Guide](https://developers.cloudflare.com/workers/development-testing/multi-workers/)
- [Durable Objects](https://developers.cloudflare.com/durable-objects/)
- [SvelteKit Cloudflare Adapter](https://kit.svelte.dev/docs/adapter-cloudflare)


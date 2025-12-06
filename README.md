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

### Backend Environment Variables

The backend worker requires `NODE_ENV` to be set for security. Direct WebSocket access to `/ws/connect` is only allowed when `NODE_ENV` is `'development'` or `'test'`. In production, WebSocket connections must go through the frontend SvelteKit handler which validates authorization.

Set `NODE_ENV` in `backend/wrangler.jsonc`:

```jsonc
"vars": {
	"NODE_ENV": "development"
}
```

Or use a `.dev.vars` file in the `backend/` directory:

```bash
cd backend
cat > .dev.vars << EOF
NODE_ENV=development
EOF
```

**Note**: `.dev.vars` files are gitignored and only used in local development. For production deployments, set environment variables via `wrangler secret put` or the Cloudflare dashboard.

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

**Security Note**: The backend worker's `/ws/connect` endpoint only accepts direct connections when `NODE_ENV` is set to `'development'` or `'test'`. In production, this endpoint returns 401 Unauthorized, forcing all WebSocket connections to go through the frontend SvelteKit handler at `/api/ws/connect` which validates authorization.

In production, there's no Vite server - all requests go directly through the Cloudflare Worker, so WebSocket upgrades work normally on the same origin.

## References

- [Multi-Workers Development Guide](https://developers.cloudflare.com/workers/development-testing/multi-workers/)
- [Durable Objects](https://developers.cloudflare.com/durable-objects/)
- [SvelteKit Cloudflare Adapter](https://kit.svelte.dev/docs/adapter-cloudflare)


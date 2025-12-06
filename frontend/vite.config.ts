import { paraglideVitePlugin } from '@inlang/paraglide-js'
import { sveltekit } from "@sveltejs/kit/vite";
import { cloudflare } from "@cloudflare/vite-plugin";
import { defineConfig, type Plugin } from "vite";
import devtoolsJson from "vite-plugin-devtools-json";

// Custom plugin to handle WebSocket upgrades for our API
function websocketPlugin(): Plugin {
  return {
    name: 'websocket-upgrade',
    configureServer(server) {
      server.httpServer?.on('upgrade', (req, socket, head) => {
        // Only handle our API WebSocket path, let Vite handle HMR
        if (req.url?.startsWith('/api/ws/')) {
          console.log('[websocket-plugin] Intercepted WebSocket upgrade for:', req.url);
          // Let the request fall through to the Cloudflare worker
          // The cloudflare plugin should handle it
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [
    websocketPlugin(),
    sveltekit(),
    paraglideVitePlugin({
      project: "./project.inlang",
      outdir: "./src/lib/paraglide",
      strategy: ["url", "cookie", "baseLocale"],
    }),
    cloudflare({
      configPath: "./wrangler.jsonc",
      auxiliaryWorkers: [
        {
          configPath: "../backend/wrangler.jsonc",
        },
      ],
    }),
    devtoolsJson(),
  ],
});

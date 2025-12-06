import { paraglideVitePlugin } from '@inlang/paraglide-js'
import { sveltekit } from "@sveltejs/kit/vite";
import { cloudflare } from "@cloudflare/vite-plugin";
import { defineConfig} from "vite";
import devtoolsJson from "vite-plugin-devtools-json";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
		tailwindcss() as any,
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


import { defineConfig } from "vite";
import vinext from "vinext";
import { cloudflare } from "@cloudflare/vite-plugin";
import { cdnAdapter } from "@vinext/cloudflare/cache/cdn-adapter";

export default defineConfig({
  // ─── Ariadne's Thread [AT-0416] ─────────────────────
  // What: Treat .conf files as UTF-8 source via Vite ?raw
  // Why:  vinext uses Vite, not webpack; disposable_email_blocklist.conf must stay a string
  // Date: 2026-09-03
  // Related: [AT-0029] lib/disposableEmail.ts, https://vite.dev/guide/assets.html#importing-asset-as-string
  // ─────────────────────────────────────────────────────
  assetsInclude: ["**/*.conf"],
  plugins: [
    vinext({
      cache: { cdn: cdnAdapter() },
    }),
    cloudflare({
      viteEnvironment: {
        name: "rsc",
        childEnvironments: ["ssr"],
      },
    }),
  ],
});

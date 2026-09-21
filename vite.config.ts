import vinext from "vinext";
import { defineConfig } from "vite";
import hostingConfig from "./.openai/hosting.json";
import { sites } from "./build/sites-vite-plugin";
import productionConfig from "./deploy/cloudflare.json";

const SITE_CREATOR_PLACEHOLDER_DATABASE_ID =
  "00000000-0000-4000-8000-000000000000";

const { d1, r2 } = hostingConfig;

// macOS Seatbelt blocks FSEvents, so Codex previews need polling for HMR.
const isCodexSeatbeltSandbox = process.env.CODEX_SANDBOX === "seatbelt";

const localBindingConfig = {
  main: "./worker/index.ts",
  compatibility_flags: ["nodejs_compat"],
  d1_databases: d1
    ? [
        {
          binding: d1,
          database_name: "site-creator-d1",
          database_id: SITE_CREATOR_PLACEHOLDER_DATABASE_ID,
        },
      ]
    : [],
  r2_buckets: r2
    ? [
        {
          binding: r2,
          bucket_name: "site-creator-r2",
        },
      ]
    : [],
};

/**
 * `DRIFTLINE_DEPLOY=production npm run build` builds for Driftline's own
 * Cloudflare account using deploy/cloudflare.json; anything else builds the
 * local/test configuration above.
 */
function productionBindingConfig() {
  const p = productionConfig;
  if (!p.d1.databaseId) {
    throw new Error("deploy/cloudflare.json is missing d1.databaseId. Run `npm run cf:setup` first.");
  }
  return {
    name: p.workerName,
    main: "./worker/index.ts",
    compatibility_flags: ["nodejs_compat"],
    workers_dev: true,
    vars: p.vars,
    d1_databases: [
      { binding: d1 || "DB", database_name: p.d1.databaseName, database_id: p.d1.databaseId, migrations_dir: "../../drizzle" },
    ],
    r2_buckets: [{ binding: r2 || "BUCKET", bucket_name: p.r2.bucketName }],
    routes: p.customDomains.map((pattern: string) => ({ pattern, custom_domain: true })),
    // 01:00 UTC = 6pm Oregon in summer, 5pm in winter: day-before reminders.
    triggers: { crons: ["0 1 * * *"] },
    observability: { enabled: true },
  };
}

export default defineConfig(async () => {
  // Keep Wrangler and Miniflare state project-local. These are non-secret tool
  // settings; application environment belongs in ignored `.env*` files.
  process.env.WRANGLER_WRITE_LOGS ??= "false";
  process.env.WRANGLER_LOG_PATH ??= ".wrangler/logs";
  process.env.MINIFLARE_REGISTRY_PATH ??= ".wrangler/registry";

  // Wrangler snapshots its log path while the Cloudflare plugin is imported.
  const { cloudflare } = await import("@cloudflare/vite-plugin");

  return {
    server: {
      host: "0.0.0.0",
      allowedHosts: ["terminal.local"],
      ...(isCodexSeatbeltSandbox
        ? { watch: { useFsEvents: false, usePolling: true } }
        : {}),
    },
    plugins: [
      vinext(),
      sites(),
      cloudflare({
        viteEnvironment: { name: "rsc", childEnvironments: ["ssr"] },
        inspectorPort: false,
        config: process.env.DRIFTLINE_DEPLOY === "production" ? productionBindingConfig() : localBindingConfig,
      }),
    ],
  };
});

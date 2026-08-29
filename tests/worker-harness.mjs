import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { unstable_startWorker } from "wrangler";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const builtWorkerConfig = resolve(projectRoot, "dist", "server", "wrangler.json");

/**
 * Boot the built worker in workerd rather than in Node.
 *
 * The bundle imports `cloudflare:workers`, a runtime-provided module that only
 * exists inside workerd. Node's default ESM loader rejects the `cloudflare:`
 * scheme outright (ERR_UNSUPPORTED_ESM_URL_SCHEME), so importing
 * `dist/server/index.js` directly can never work — that is the failure this
 * replaces.
 *
 * Running the artifact through Wrangler's local dev runtime resolves
 * `cloudflare:*` natively and wires the D1 and R2 bindings declared in the
 * generated `dist/server/wrangler.json`. Everything stays local: no network, no
 * live database, no deploy.
 */
export async function startBuiltWorker() {
  const worker = await unstable_startWorker({
    config: builtWorkerConfig,
    dev: {
      remote: false,
      inspector: false,
      logLevel: "error",
      server: { port: 0 },
    },
  });

  return {
    fetch: (path, init) => worker.fetch(new URL(path, "http://localhost").href, init),
    dispose: () => worker.dispose(),
  };
}

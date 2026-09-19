// One-time Cloudflare setup: creates the database and photo storage in the
// signed-in Cloudflare account and records the database id in
// deploy/cloudflare.json. Safe to re-run: existing resources are reused.
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const file = new URL("../deploy/cloudflare.json", import.meta.url);
const config = JSON.parse(readFileSync(file, "utf8"));
const wrangler = (...args) => execFileSync("npx", ["wrangler", ...args], { encoding: "utf8", env: { ...process.env, CI: "1" } });

if (!config.d1.databaseId) {
  const list = JSON.parse(wrangler("d1", "list", "--json"));
  let db = list.find((d) => d.name === config.d1.databaseName);
  if (!db) {
    console.log(`Creating database ${config.d1.databaseName}…`);
    wrangler("d1", "create", config.d1.databaseName);
    db = JSON.parse(wrangler("d1", "list", "--json")).find((d) => d.name === config.d1.databaseName);
  }
  config.d1.databaseId = db.uuid;
  writeFileSync(file, JSON.stringify(config, null, 2) + "\n");
  console.log(`Database ready: ${db.uuid}`);
} else {
  console.log(`Database already set: ${config.d1.databaseId}`);
}

const buckets = wrangler("r2", "bucket", "list");
if (!buckets.includes(config.r2.bucketName)) {
  console.log(`Creating photo storage ${config.r2.bucketName}…`);
  wrangler("r2", "bucket", "create", config.r2.bucketName);
}
console.log("Photo storage ready.");
console.log("\nNext: npx wrangler secret put RESEND_API_KEY --name " + config.workerName + "   then   npm run deploy");

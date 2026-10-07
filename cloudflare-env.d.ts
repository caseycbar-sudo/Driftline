/**
 * Types for the Cloudflare Worker runtime, so `npx tsc --noEmit` checks the
 * server code. The importable flavour of @cloudflare/workers-types is used (not
 * its global one) so Worker globals don't clash with the browser types the
 * React components rely on. Only the names this app uses are made global.
 *
 * No top-level import/export here: that keeps this a global declaration file.
 */
type D1Database = import("@cloudflare/workers-types/latest").D1Database;
type ScheduledController = import("@cloudflare/workers-types/latest").ScheduledController;

/**
 * R2 and service bindings, spelled with the standard Request/Response/ReadableStream
 * types. At run time they are the same objects; this only stops TypeScript treating
 * the Worker's and the browser's copies of those types as different things.
 */
type R2ObjectBody = Omit<import("@cloudflare/workers-types/latest").R2ObjectBody, "body"> & { body: ReadableStream };
type R2Bucket = Omit<import("@cloudflare/workers-types/latest").R2Bucket, "get" | "put"> & {
  get(key: string): Promise<R2ObjectBody | null>;
  put(
    key: string,
    value: ReadableStream | ArrayBuffer | ArrayBufferView | string | Blob | null,
    options?: import("@cloudflare/workers-types/latest").R2PutOptions,
  ): Promise<import("@cloudflare/workers-types/latest").R2Object | null>;
};
type Fetcher = { fetch(input: Request | string | URL, init?: RequestInit): Promise<Response> };

declare module "cloudflare:workers" {
  /** Bindings and variables from the Worker config (vite.config.ts, deploy/cloudflare.json). */
  export const env: {
    DB: import("@cloudflare/workers-types/latest").D1Database;
    BUCKET: R2Bucket;
    [name: string]: unknown;
  };
}

/** Cloudflare Worker entry point for the vinext-starter template. */
import { handleImageOptimization, DEFAULT_DEVICE_SIZES, DEFAULT_IMAGE_SIZES } from "vinext/server/image-optimization";
import handler from "vinext/server/app-router-entry";
import { runDailyJobs } from "../app/jobs/daily";

interface Env {
  ASSETS: Fetcher;
  DB: D1Database;
  IMAGES: {
    input(stream: ReadableStream): {
      transform(options: Record<string, unknown>): {
        output(options: { format: string; quality: number }): Promise<{ response(): Response }>;
      };
    };
  };
}

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

// Image security config. SVG sources with .svg extension auto-skip the
// optimization endpoint on the client side (served directly, no proxy).
// To route SVGs through the optimizer (with security headers), set
// dangerouslyAllowSVG: true in next.config.js and uncomment below:
// const imageConfig: ImageConfig = { dangerouslyAllowSVG: true };

const worker = {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // One public address: send driftlineprovisions.com (e.g. from a QR code) to
    // www.driftlineprovisions.com, keeping the path so old links still land right.
    if (url.hostname === "driftlineprovisions.com") {
      url.hostname = "www.driftlineprovisions.com";
      url.protocol = "https:";
      return Response.redirect(url.toString(), 301);
    }

    // Common addresses from the old Squarespace site, so saved links and search results still land somewhere useful.
    const legacy: Record<string, string> = { "/about": "/our-story", "/about-us": "/our-story", "/menu": "/meal-prep", "/menus": "/meal-prep", "/services": "/private-chef", "/book": "/contact", "/booking": "/contact", "/home": "/" };
    const moved = legacy[url.pathname.replace(/\/+$/, "").toLowerCase()];
    if (moved) return Response.redirect(new URL(moved, url).toString(), 301);

    if (url.pathname === "/_vinext/image") {
      const allowedWidths = [...DEFAULT_DEVICE_SIZES, ...DEFAULT_IMAGE_SIZES];
      return handleImageOptimization(request, {
        fetchAsset: (path) => env.ASSETS.fetch(new Request(new URL(path, request.url))),
        transformImage: async (body, { width, format, quality }) => {
          const result = await env.IMAGES.input(body).transform(width > 0 ? { width } : {}).output({ format, quality });
          return result.response();
        },
      }, allowedWidths);
    }

    const response = await handler.fetch(request, env, ctx);
    // API answers are about the signed-in person unless a route says otherwise (public
    // photos set their own cache-control), so no browser or shared cache may keep them.
    if (url.pathname.startsWith("/api/") && !response.headers.has("cache-control")) {
      const privateResponse = new Response(response.body, response);
      privateResponse.headers.set("cache-control", "private, no-store");
      return privateResponse;
    }
    return response;
  },

  /** Daily trigger (see triggers.crons in deploy config): day-before visit reminders. */
  async scheduled(_controller: unknown, _env: Env, _ctx: ExecutionContext) {
    try {
      console.log("[daily]", JSON.stringify(await runDailyJobs()));
    } catch (error) {
      console.error("[daily] failed", error instanceof Error ? error.stack : error);
    }
  },
};

export default worker;

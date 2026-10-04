import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vinext treats every multipart POST as a form submission and refuses anything over 1 MB.
  // Visit completion sends several phone photos at once, so allow a lot more.
  experimental: { serverActions: { bodySizeLimit: "40mb" } },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Static generation otherwise fans out to one worker per CPU, and each
    // worker is a full Node process -- which pushed peak build memory past
    // 570MB, more than a small deploy instance has. There are only a
    // handful of pages to prerender, so the parallelism buys almost
    // nothing here.
    cpus: 1,
  },
};

export default nextConfig;

import type { NextConfig } from "next";

// GitHub Pages serves the project under /<repo>, so the deploy workflow sets
// BASE_PATH. Locally it stays empty and the app lives at the root.
const basePath = process.env.BASE_PATH ?? "";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // The app is fully client-side (drafts in localStorage, PDF built in the
  // browser), so it can be exported as static files.
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  basePath,
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
};

export default nextConfig;

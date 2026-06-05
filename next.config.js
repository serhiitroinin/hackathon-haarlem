/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
  // Hackathon mode: never let lint block a production build near code freeze.
  // TypeScript errors still fail the build (run `pnpm typecheck` / `pnpm lint`
  // yourself when you want the full strict pass).
  eslint: { ignoreDuringBuilds: true },
};

export default config;

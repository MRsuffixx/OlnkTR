// Bundles the worker and the migration runner. Workspace packages (TypeScript
// sources) are bundled; third-party dependencies stay external and are
// installed in the production image with `pnpm deploy --prod`.
import { cp, rm } from "node:fs/promises";
import { build } from "esbuild";

const externalThirdParty = {
  name: "external-third-party",
  setup(builder) {
    builder.onResolve({ filter: /^[^./]/ }, (args) => {
      if (args.path.startsWith("@olnktr/")) return undefined;
      return { path: args.path, external: true };
    });
  },
};

await rm("dist", { recursive: true, force: true });
await build({
  entryPoints: { index: "src/index.ts", migrate: "../../packages/db/src/migrate.ts" },
  outdir: "dist",
  bundle: true,
  platform: "node",
  target: "node24",
  format: "esm",
  sourcemap: true,
  logLevel: "info",
  plugins: [externalThirdParty],
  banner: {
    js: "import { createRequire as __createRequire } from 'node:module'; const require = __createRequire(import.meta.url);",
  },
});
await cp("../../packages/db/migrations", "dist/migrations", { recursive: true });

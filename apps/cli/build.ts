/**
 * Bundle the CLI into a single executable JS file for npm.
 *
 * Inlines workspace deps so the published artifact has only `yaml` and
 * Node built-ins as runtime dependencies. Injects the package version
 * via --define so the binary can print --version without reading
 * package.json at runtime.
 */
import { chmodSync, readFileSync, writeFileSync } from "node:fs";

const pkg = JSON.parse(readFileSync("package.json", "utf8")) as { version: string };

const result = await Bun.build({
  entrypoints: ["src/index.ts"],
  outdir: "dist",
  target: "node",
  format: "esm",
  external: [],
  define: {
    __PREVU_CLI_VERSION__: JSON.stringify(pkg.version),
  },
  minify: false,
});

if (!result.success) {
  for (const log of result.logs) console.error(log);
  process.exit(1);
}

const bin = "dist/index.js";
const src = readFileSync(bin, "utf8");
if (!src.startsWith("#!")) {
  writeFileSync(bin, `#!/usr/bin/env node\n${src}`);
}
chmodSync(bin, 0o755);
console.log(`built ${bin} (v${pkg.version})`);

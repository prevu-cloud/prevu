// The bundler can replace `process.env.PREVU_CLI_VERSION` at build time
// using --define. For unbundled / dev runs, fall back to reading the
// nearest package.json.
declare const __PREVU_CLI_VERSION__: string | undefined;

export function getVersion(): string {
  if (typeof __PREVU_CLI_VERSION__ !== "undefined" && __PREVU_CLI_VERSION__) {
    return __PREVU_CLI_VERSION__;
  }
  return "0.0.0-dev";
}

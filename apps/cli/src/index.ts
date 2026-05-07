#!/usr/bin/env node
import { ApiClient } from "./api-client.js";
import { resolveAuth } from "./auth.js";
import { CliError } from "./error.js";
import { ioFromGlobals, emitError } from "./output.js";
import {
  parseArgs,
  extractGlobals,
  findCommand,
  renderHelp,
  type Command,
} from "./cli.js";
import { ENV_COMMANDS } from "./commands/env.js";
import { AUTH_COMMANDS } from "./commands/auth.js";
import { KEYS_COMMANDS } from "./commands/keys.js";
import { getVersion } from "./version.js";

const REGISTRY: Command[] = [...AUTH_COMMANDS, ...ENV_COMMANDS, ...KEYS_COMMANDS];

async function main(): Promise<void> {
  const argv = process.argv.slice(2);

  // Top-level --version / --help shortcuts (before command lookup).
  if (argv[0] === "--version" || argv[0] === "-v") {
    console.log(getVersion());
    return;
  }
  if (argv.length === 0 || argv[0] === "--help" || argv[0] === "-h" || argv[0] === "help") {
    console.log(renderHelp(REGISTRY));
    return;
  }

  const match = findCommand(REGISTRY, argv);
  if (!match) {
    // Maybe it's a partial path like "env" with no subcommand -> render
    // the help for that path.
    const path = takeKnownPath(REGISTRY, argv);
    if (path) {
      console.log(renderHelp(REGISTRY, path));
      return;
    }
    throw new CliError({
      type: "usage",
      message: `Unknown command: ${argv.join(" ")}`,
      hint: "Run `prevu --help` to list available commands.",
    });
  }

  const { command, rest } = match;
  let parsed: ReturnType<typeof parseArgs>["parsed"];
  let positionals: string[] = [];
  try {
    ({ parsed, positionals } = parseArgs(rest, command.args ?? {}));
  } catch (error) {
    throw new CliError({
      type: "usage",
      message: error instanceof Error ? error.message : String(error),
      hint: `Run \`prevu ${command.name.join(" ")} --help\`.`,
    });
  }
  const globals = extractGlobals(parsed);

  if (globals.help) {
    console.log(renderHelp(REGISTRY, command.name));
    return;
  }
  if (globals.version) {
    console.log(getVersion());
    return;
  }

  const io = ioFromGlobals(globals);
  const auth = resolveAuth({ token: globals.token, apiUrl: globals.apiUrl });
  const client = ApiClient.create({
    apiUrl: auth.apiUrl,
    token: auth.token,
    userAgent: `prevu-cli/${getVersion()}`,
  });

  try {
    await command.run({ args: parsed, rest: positionals, globals, io, client });
  } catch (error) {
    handleError(error, io);
  }
}

function takeKnownPath(registry: Command[], argv: string[]): string[] | null {
  // If argv is a prefix of any command name path, return that prefix.
  const out: string[] = [];
  for (let i = 0; i < argv.length; i++) {
    const candidate = [...out, argv[i]];
    const hasMatch = registry.some(
      (c) =>
        c.name.length >= candidate.length &&
        candidate.every((seg, idx) => c.name[idx] === seg),
    );
    if (!hasMatch) return out.length > 0 ? out : null;
    out.push(argv[i]);
  }
  return out;
}

function handleError(error: unknown, io: ReturnType<typeof ioFromGlobals>): void {
  if (error instanceof CliError) {
    emitError(io, { type: error.type, message: error.message, hint: error.hint });
    process.exitCode = error.exitCode;
    return;
  }
  const msg = error instanceof Error ? error.message : String(error);
  emitError(io, { type: "generic", message: msg });
  process.exitCode = 1;
}

main().catch((error: unknown) => {
  // Fallback for errors thrown before io was set up (parseArgs, etc).
  const io = ioFromGlobals({});
  handleError(error, io);
});

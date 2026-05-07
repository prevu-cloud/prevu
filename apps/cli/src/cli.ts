/**
 * Tiny command framework. Each Command has a name path (e.g. ["env",
 * "create"]), a description, an args schema, and a run function. The
 * registry knows enough to render --help and parse argv.
 *
 * Why not citty/commander/yargs: we need zero runtime deps for the
 * bundled npm artifact and the surface area is small.
 */
import type { ApiClient } from "./api-client.js";
import type { IO } from "./output.js";

export interface ArgSpec {
  /** "string" parses --foo bar; "boolean" parses --foo (no value); "positional" reads a positional. */
  type: "string" | "boolean" | "number" | "positional";
  description: string;
  /** For positional: required arg name shown in help (e.g. "<slug>"). */
  required?: boolean;
  default?: string | number | boolean;
  /** Aliases like ["-p"] for --port. */
  aliases?: string[];
}

export type ArgsSchema = Record<string, ArgSpec>;
export type ParsedArgs = Record<string, string | number | boolean | undefined>;

export interface Command {
  name: string[];
  description: string;
  args?: ArgsSchema;
  run: (ctx: CommandContext) => Promise<void> | void;
}

export interface CommandContext {
  args: ParsedArgs;
  /** Positional args left over after the schema's declared positionals were bound, plus everything after `--`. Commands that wrap an external tool (e.g. `env ssh`) forward these. */
  rest: string[];
  globals: GlobalFlags;
  io: IO;
  client: ApiClient;
}

export interface GlobalFlags {
  format?: "table" | "json";
  noColor?: boolean;
  token?: string;
  apiUrl?: string;
  help?: boolean;
  version?: boolean;
}

const GLOBAL_SCHEMA: ArgsSchema = {
  format: { type: "string", description: "Output format: table|json (default table)" },
  "no-color": { type: "boolean", description: "Disable ANSI color" },
  token: { type: "string", description: "Override PREVU_TOKEN" },
  "api-url": { type: "string", description: "Override PREVU_API_URL" },
  help: { type: "boolean", description: "Show help", aliases: ["-h"] },
  version: { type: "boolean", description: "Print version", aliases: ["-v"] },
};

/**
 * Parse a flat argv (already past the command-name path). Pulls flags
 * out and accumulates positionals separately. Unknown flags throw.
 */
export function parseArgs(
  args: string[],
  schema: ArgsSchema,
): { parsed: ParsedArgs; positionals: string[] } {
  const merged: ArgsSchema = { ...GLOBAL_SCHEMA, ...schema };
  const aliasMap = new Map<string, string>();
  for (const [name, spec] of Object.entries(merged)) {
    for (const a of spec.aliases ?? []) aliasMap.set(a, name);
  }

  const parsed: ParsedArgs = {};
  const positionals: string[] = [];

  for (let i = 0; i < args.length; i++) {
    const raw = args[i];
    if (raw === "--") {
      positionals.push(...args.slice(i + 1));
      break;
    }
    if (!raw.startsWith("-")) {
      positionals.push(raw);
      continue;
    }
    const flagName = raw.startsWith("--") ? raw.slice(2) : raw;
    const canonical = aliasMap.get(flagName) ?? flagName;
    const spec = merged[canonical];
    if (!spec) throw new Error(`Unknown flag: ${raw}`);
    if (spec.type === "boolean") {
      parsed[canonical] = true;
      continue;
    }
    const value = args[i + 1];
    if (value === undefined || value.startsWith("-")) {
      throw new Error(`Flag ${raw} requires a value.`);
    }
    if (spec.type === "number") {
      const n = Number(value);
      if (!Number.isFinite(n)) throw new Error(`Flag ${raw} expects a number, got ${value}`);
      parsed[canonical] = n;
    } else {
      parsed[canonical] = value;
    }
    i += 1;
  }

  // Apply defaults
  for (const [name, spec] of Object.entries(schema)) {
    if (parsed[name] === undefined && spec.default !== undefined) {
      parsed[name] = spec.default;
    }
  }

  // Bind positionals into named slots if schema declares them
  let posIdx = 0;
  for (const [name, spec] of Object.entries(schema)) {
    if (spec.type !== "positional") continue;
    if (posIdx < positionals.length) {
      parsed[name] = positionals[posIdx];
      posIdx += 1;
    } else if (spec.required) {
      throw new Error(`Missing required argument: <${name}>`);
    } else if (spec.default !== undefined) {
      parsed[name] = spec.default;
    }
  }

  return { parsed, positionals: positionals.slice(posIdx) };
}

export function extractGlobals(parsed: ParsedArgs): GlobalFlags {
  const g: GlobalFlags = {};
  if (parsed.format === "json" || parsed.format === "table") g.format = parsed.format;
  if (parsed["no-color"]) g.noColor = true;
  if (typeof parsed.token === "string") g.token = parsed.token;
  if (typeof parsed["api-url"] === "string") g.apiUrl = parsed["api-url"];
  if (parsed.help) g.help = true;
  if (parsed.version) g.version = true;
  return g;
}

/**
 * Match argv (full, after node binary) against the registry. Returns
 * the matched command + the remaining args (after the command path).
 * If no command matches, returns null.
 */
export function findCommand(
  registry: Command[],
  argv: string[],
): { command: Command; rest: string[] } | null {
  // Sort longest path first so "env create" matches before "env".
  const sorted = [...registry].sort((a, b) => b.name.length - a.name.length);
  for (const cmd of sorted) {
    const path = cmd.name;
    if (argv.length < path.length) continue;
    if (path.every((seg, i) => argv[i] === seg)) {
      return { command: cmd, rest: argv.slice(path.length) };
    }
  }
  return null;
}

export function renderHelp(registry: Command[], path: string[] = []): string {
  const lines: string[] = [];
  if (path.length === 0) {
    lines.push("prevu - staging environments for coding agents");
    lines.push("");
    lines.push("Usage:");
    lines.push("  prevu <command> [options]");
    lines.push("");
  } else {
    lines.push(`prevu ${path.join(" ")} - see options below`);
    lines.push("");
  }

  // Find an exact-match command (for full help on it)
  const exact = registry.find(
    (c) => c.name.length === path.length && c.name.every((s, i) => s === path[i]),
  );

  if (exact) {
    lines.push(exact.description);
    lines.push("");
    lines.push(`Usage:`);
    const argLine = renderUsageLine(exact);
    lines.push(`  prevu ${exact.name.join(" ")}${argLine}`);
    lines.push("");
    if (exact.args) {
      lines.push("Options:");
      for (const [name, spec] of Object.entries(exact.args)) {
        if (spec.type === "positional") continue;
        const aliases = spec.aliases?.length ? `, ${spec.aliases.join(", ")}` : "";
        lines.push(`  --${name}${aliases}`.padEnd(28) + spec.description);
      }
      lines.push("");
    }
  }

  // Children of `path`
  const children = registry
    .filter((c) => c.name.length > path.length && path.every((s, i) => c.name[i] === s))
    .sort((a, b) => a.name.join(" ").localeCompare(b.name.join(" ")));
  if (children.length > 0) {
    lines.push("Commands:");
    for (const c of children) {
      const display = c.name.slice(path.length).join(" ");
      lines.push(`  ${display.padEnd(20)} ${c.description}`);
    }
    lines.push("");
  }

  lines.push("Global options:");
  lines.push("  --format <fmt>       Output format: table|json (default table)");
  lines.push("  --no-color           Disable ANSI color");
  lines.push("  --token <pat>        Override PREVU_TOKEN");
  lines.push("  --api-url <url>      Override PREVU_API_URL (default https://app.prevu.cloud)");
  lines.push("  -h, --help           Show help");
  lines.push("  -v, --version        Print version");
  return lines.join("\n");
}

function renderUsageLine(cmd: Command): string {
  if (!cmd.args) return "";
  const parts: string[] = [];
  for (const [name, spec] of Object.entries(cmd.args)) {
    if (spec.type === "positional") {
      parts.push(spec.required ? `<${name}>` : `[${name}]`);
    }
  }
  if (Object.values(cmd.args).some((s) => s.type !== "positional")) {
    parts.push("[options]");
  }
  return parts.length ? " " + parts.join(" ") : "";
}

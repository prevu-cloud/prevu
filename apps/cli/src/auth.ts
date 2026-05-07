/**
 * Token + API URL resolution and persistence.
 *
 * Resolution order (highest wins):
 *   1. Explicit --token / --api-url command flag
 *   2. PREVU_TOKEN / PREVU_API_URL env var
 *   3. ~/.prevu/config.json
 *   4. Built-in default for api URL (https://app.prevu.cloud)
 *
 * Config file is created by `prevu auth login` with mode 0600 in a
 * 0700 dir. We never log the token; only its prefix (e.g. "prv_a1b2...").
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync, unlinkSync, chmodSync } from "node:fs";
import { homedir } from "node:os";
import { join, dirname } from "node:path";
import { DEFAULT_API_URL } from "./api-client.js";

interface Config {
  token?: string;
  apiUrl?: string;
}

function configPath(): string {
  const override = process.env.PREVU_CONFIG_DIR;
  return join(override ?? join(homedir(), ".prevu"), "config.json");
}

function loadConfig(): Config {
  const path = configPath();
  if (!existsSync(path)) return {};
  try {
    return JSON.parse(readFileSync(path, "utf8")) as Config;
  } catch {
    return {};
  }
}

export function saveConfig(next: Config): void {
  const path = configPath();
  const dir = dirname(path);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true, mode: 0o700 });
  writeFileSync(path, JSON.stringify(next, null, 2));
  try {
    chmodSync(path, 0o600);
  } catch {
    // best effort; chmod fails on Windows but the perms there work differently
  }
}

export function clearConfig(): void {
  const path = configPath();
  if (existsSync(path)) unlinkSync(path);
}

export interface ResolvedAuth {
  apiUrl: string;
  token?: string;
  source: "flag" | "env" | "file" | "default";
}

export function resolveAuth(flags: { token?: string; apiUrl?: string }): ResolvedAuth {
  const cfg = loadConfig();

  let apiUrl = DEFAULT_API_URL;
  let urlSource: ResolvedAuth["source"] = "default";
  if (flags.apiUrl) {
    apiUrl = flags.apiUrl;
    urlSource = "flag";
  } else if (process.env.PREVU_API_URL) {
    apiUrl = process.env.PREVU_API_URL;
    urlSource = "env";
  } else if (cfg.apiUrl) {
    apiUrl = cfg.apiUrl;
    urlSource = "file";
  }

  let token: string | undefined;
  let tokenSource: ResolvedAuth["source"] = "default";
  if (flags.token) {
    token = flags.token;
    tokenSource = "flag";
  } else if (process.env.PREVU_TOKEN) {
    token = process.env.PREVU_TOKEN;
    tokenSource = "env";
  } else if (cfg.token) {
    token = cfg.token;
    tokenSource = "file";
  }

  // Prefer the more authoritative of the two sources for the public
  // `source` field - it's only used in human messages.
  const rank: Record<ResolvedAuth["source"], number> = {
    flag: 3,
    env: 2,
    file: 1,
    default: 0,
  };
  const source = rank[tokenSource] >= rank[urlSource] ? tokenSource : urlSource;

  return { apiUrl: apiUrl.replace(/\/$/, ""), token, source };
}

export function tokenPrefix(token: string): string {
  return token.length > 12 ? `${token.slice(0, 12)}...` : token;
}

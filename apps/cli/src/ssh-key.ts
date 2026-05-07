/**
 * Local SSH key discovery for create / expose.
 *
 * Defaults to ~/.ssh/id_ed25519.pub, then ~/.ssh/id_rsa.pub. The user
 * can override with --ssh-key-file <path> or --ssh-public-key <body>.
 * --ssh-key-id <id> resolves a key already saved in the Prevu API
 * (CLI fetches /api/v1/keys to find the public key body).
 */
import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { CliError } from "./error.js";
import type { ApiClient } from "./api-client.js";

export interface SshKeyFlags {
  sshKeyId?: string;
  sshKeyFile?: string;
  sshPublicKey?: string;
}

const DEFAULT_PUBKEY_PATHS = [
  ".ssh/id_ed25519.pub",
  ".ssh/id_rsa.pub",
];

export async function resolvePublicKey(
  flags: SshKeyFlags,
  client: ApiClient,
): Promise<string> {
  if (flags.sshPublicKey) return flags.sshPublicKey.trim();

  if (flags.sshKeyFile) {
    if (!existsSync(flags.sshKeyFile)) {
      throw new CliError({
        type: "usage",
        message: `SSH key file not found: ${flags.sshKeyFile}`,
      });
    }
    return readFileSync(flags.sshKeyFile, "utf8").trim();
  }

  if (flags.sshKeyId) {
    const keys = await client.listSshKeys();
    const match = keys.find((k) => k.id === flags.sshKeyId || k.name === flags.sshKeyId);
    if (!match) {
      throw new CliError({
        type: "not_found",
        message: `SSH key not found: ${flags.sshKeyId}`,
        hint: "Run `prevu keys list` to see saved keys.",
      });
    }
    return match.publicKey;
  }

  // Auto-discover.
  const home = homedir();
  for (const rel of DEFAULT_PUBKEY_PATHS) {
    const path = join(home, rel);
    if (existsSync(path)) {
      return readFileSync(path, "utf8").trim();
    }
  }

  throw new CliError({
    type: "usage",
    message: "No SSH public key available.",
    hint:
      "Generate one with `ssh-keygen -t ed25519`, or pass " +
      "--ssh-key-file <path> / --ssh-public-key <body> / --ssh-key-id <id>.",
  });
}

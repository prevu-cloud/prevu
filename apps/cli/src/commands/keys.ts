/**
 * Read-only keys commands: list saved SSH keys. Add/delete is done in
 * the web dashboard at /keys; the CLI just reads them so create/expose
 * can resolve --ssh-key-id without the user having to copy fingerprints.
 */
import { emit, renderTable } from "../output.js";
import type { Command } from "../cli.js";

const list: Command = {
  name: ["keys", "list"],
  description: "List your saved SSH keys.",
  run: async ({ client, io }) => {
    const keys = await client.listSshKeys();
    emit(io, keys, () => {
      const headers = ["NAME", "ID", "FINGERPRINT", "ADDED"];
      const rows = keys.map((k) => [
        k.name,
        k.id,
        k.fingerprint.slice(0, 16) + "...",
        k.createdAt.slice(0, 10),
      ]);
      console.log(renderTable(headers, rows));
    });
  },
};

export const KEYS_COMMANDS: Command[] = [list];

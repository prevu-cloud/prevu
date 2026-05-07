/**
 * Auth commands: login (save token to ~/.prevu/config.json), logout
 * (remove it), whoami (show current user).
 */
import { createInterface } from "node:readline/promises";
import { saveConfig, clearConfig, tokenPrefix } from "../auth.js";
import { ApiClient } from "../api-client.js";
import { CliError } from "../error.js";
import { emit } from "../output.js";
import type { Command } from "../cli.js";

const login: Command = {
  name: ["auth", "login"],
  description: "Save your API token to ~/.prevu/config.json.",
  args: {
    "with-token": { type: "string", description: "Pass token non-interactively (CI use)" },
  },
  run: async ({ args, globals, io }) => {
    const apiUrl = globals.apiUrl ?? process.env.PREVU_API_URL ?? "https://app.prevu.cloud";

    let token = typeof args["with-token"] === "string" ? args["with-token"] : undefined;
    if (!token) {
      if (!process.stdin.isTTY) {
        throw new CliError({
          type: "usage",
          message: "stdin is not a TTY; use --with-token <pat> for non-interactive login.",
        });
      }
      const rl = createInterface({ input: process.stdin, output: process.stderr });
      process.stderr.write(
        `Generate a token at ${apiUrl.replace(/\/$/, "")}/keys, then paste it below.\n`,
      );
      token = (await rl.question("Token: ")).trim();
      rl.close();
    }
    if (!token) {
      throw new CliError({ type: "usage", message: "Token is empty." });
    }

    // Verify the token actually works before persisting it.
    const client = ApiClient.create({
      apiUrl,
      token,
      userAgent: globals.token ? "prevu-cli" : "prevu-cli",
    });
    const user = await client.getMe();

    saveConfig({ token, apiUrl: globals.apiUrl ?? undefined });
    emit(io, { user, tokenPrefix: tokenPrefix(token) }, () => {
      console.log(`Signed in as ${user.email ?? user.githubLogin ?? user.id} (${tokenPrefix(token!)}).`);
    });
  },
};

const logout: Command = {
  name: ["auth", "logout"],
  description: "Remove the saved API token.",
  run: ({ io }) => {
    clearConfig();
    emit(io, { ok: true }, () => console.log("Signed out."));
  },
};

const whoami: Command = {
  name: ["auth", "whoami"],
  description: "Show the currently authenticated user.",
  run: async ({ client, io }) => {
    const user = await client.getMe();
    emit(io, user, () => {
      console.log(`id:           ${user.id}`);
      console.log(`email:        ${user.email ?? "-"}`);
      console.log(`github:       ${user.githubLogin ?? "-"}`);
      console.log(`role:         ${user.role}`);
      console.log(`plan:         ${user.plan}`);
    });
  },
};

export const AUTH_COMMANDS: Command[] = [login, logout, whoami];

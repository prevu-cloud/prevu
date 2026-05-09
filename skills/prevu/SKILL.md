---
name: prevu
description: "Use when running, configuring, or debugging the Prevu CLI (`prevu` binary) - managing staging environments, exposing ports, SSH access, API tokens, signing in, listing envs, and service commands. Mentions: prevu, prevu env, prevu auth, prevu keys, prevu.cloud, app.prevu.cloud, prevu.page, PREVU_TOKEN, staging environment for coding agents."
metadata:
  requires:
    bins: ["prevu"]
  cliHelp: "prevu --help"
---

# Prevu CLI

Prevu provisions a persistent Linux VM you can SSH into, expose ports from, and reach via a public URL. The `prevu` CLI is the supported surface (no `infrastructure tools`).

This skill is the **reference**: install, command map, output contract, exit codes, with deeper detail in `references/*.md`. For the multi-step user-facing workflows (mirroring local dev to a phone-reviewable preview, sharing a WIP branch), see the **`prevu-flows`** skill - load it when the user describes a scenario rather than a single command.

## Install + sign in

```bash
npm install -g @prevu/cli
prevu --version              # 0.2.0+ (slug-only URLs and env exec need 0.2.0+)
prevu auth login             # paste a token from https://app.prevu.cloud/keys
```

Requires Node >= 20. Token is stored at `~/.prevu/config.json` (mode 0600).

For CI / non-TTY:

```bash
export PREVU_TOKEN=prv_...
```

Resolution order: `--token` flag -> `PREVU_TOKEN` env var -> `~/.prevu/config.json`.

`PREVU_API_URL` defaults to `https://app.prevu.cloud`. Override with `--api-url` only for self-hosted Prevu APIs.

## Command map

| Namespace | Command                              | Detail in        |
|-----------|--------------------------------------|------------------|
| auth      | `login` / `logout` / `whoami`        | `references/auth.md` |
| env       | `list`, `get`, `create`, `destroy`   | `references/env.md`  |
| env       | `wait`                               | `references/env.md` + `references/lifecycle.md` |
| env       | `ssh`, `ssh-command`, `exec`         | `references/env.md` |
| env       | `urls`                               | `references/env.md` |
| env       | `service start/list/logs/restart/stop` | `references/env.md` |
| env       | `expose`, `unexpose`                 | `references/env.md` |
| keys      | `list`                               | `references/keys.md` |

Run `prevu <namespace> --help` for inline help.

## Output contract - always pass `--format json` when parsing

Default output is a human table; for any scripted call, pass `--format json`. Envelope is fixed:

```jsonc
// success
{ "data": { ... } }
// failure
{ "error": { "type": "auth", "message": "...", "hint": "..." } }
```

`NO_COLOR=1` or `--no-color` strips ANSI in table mode. JSON is always uncolored.

## Exit codes (parse these, not stderr text)

| Code | Type        | What it means                                  |
|------|-------------|------------------------------------------------|
| 0    | success     | continue                                       |
| 1    | generic     | print and bail                                 |
| 2    | usage       | bad flags - fix and retry                      |
| 3    | auth        | tell the user to run `prevu auth login`        |
| 4    | not_found   | env/key doesn't exist; create or pick another  |
| 5    | conflict    | already exists / wrong status - usually benign |
| 6    | rate_limit  | back off >=30s and retry                        |
| 7    | server      | transient; retry once                          |
| 8    | timeout     | `env wait` ran out - open the dashboard        |

Idiomatic recovery sketch:

```bash
prevu env get my-project --format json >/dev/null 2>&1
case $? in
  0) ;;                                    # exists
  4) prevu env create my-project --format json ;;
  3) echo "Run \`prevu auth login\`" >&2; exit 1 ;;
  *) exit 1 ;;
esac
```

## Hard rules - please don't break these

1. **Envs are persistent paid products.** Reuse them deliberately; **never auto-destroy on TTL or end-of-session.**
2. **One env per project, not per task.** Reuse the same slug across sessions; the user comes back to the same workspace.
3. **Use HTTPS exposure for browser previews** (default). TCP mode is for non-HTTP services like Postgres.
4. **Print public URLs prominently.** The user is often on their phone; don't bury the URL in shell output.
5. **Use `env service` for long-running app processes.** Don't hand-write `nohup`, PID files, or broad `pkill -f` commands.
6. **The CLI/API is the only supported surface.** Don't try to `infrastructure tools` at it.

## When to load deeper detail

- `references/auth.md` - sign-in flows, where the token lives, recovering from exit code 3.
- `references/env.md` - every env subcommand with inputs, examples, and the SSH-key resolution rules.
- `references/keys.md` - saved SSH key model, dedup, when `--ssh-key-id` saves keystrokes.
- `references/lifecycle.md` - status state machine, when `wait` returns, and destructive-action guidance.
- `references/troubleshooting.md` - concrete failure modes and their fixes.

## When NOT to load this skill

- Pure local file edits or read-only repo work - Prevu is for *running* code remotely.
- Production deploys / CI - Prevu is staging.
- Anything where the user explicitly said "stay on my laptop."

## Workflow scenarios live in `prevu-flows`

If the user asks for **mirror my dev to my phone**, **let me preview from mobile**, **share this branch as a URL**, **I'm AFK keep coding** - load the `prevu-flows` skill instead of (or in addition to) this one. Those flows wire the commands here into a multi-step loop with the right defaults.

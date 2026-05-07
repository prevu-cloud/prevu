# Environments - `prevu env`

Day-to-day environment lifecycle. Every command takes a slug positional plus a few flags; everything is JSON-friendly with `--format json`.

## list

```bash
prevu env list
prevu env list --format json | jq '.data[].slug'
```

## get

```bash
prevu env get my-project
prevu env get my-project --format json
```

Exit 4 = doesn't exist. Use this as the cheap idempotency check before `create`.

## create

```bash
prevu env create my-project \
  --name "My project staging" \
  --cpu 4 --memory-gi 8 --disk-gi 40
```

Slug rules: 4-16 chars, lowercase letters/digits/hyphen, must start with a letter and end with letter or digit (RFC 1123 hostname-safe). Slugs are **globally unique** - `env create` returns exit 5 with `'<slug>' is taken` if someone else already claimed it. Hard cap of 5 active envs per user. Profile flags are optional; defaults are sensible.

### SSH key resolution (priority order)

1. `--ssh-public-key '<body>'` - inline body
2. `--ssh-key-file <path>` - read from a file
3. `--ssh-key-id <id-or-name>` - saved at https://app.prevu.cloud/keys
4. Auto-discover: `~/.ssh/id_ed25519.pub`, then `~/.ssh/id_rsa.pub`

In the typical case, **don't pass any `--ssh-*` flag** - auto-discovery picks up the user's existing key. Pasted/file keys are saved server-side automatically (deduped on fingerprint), so the next call can use `--ssh-key-id <name>`.

If the user has no SSH key yet, the CLI errors with a hint. Don't assume - generate one only when the user explicitly asks (`ssh-keygen -t ed25519`).

## destroy

```bash
prevu env destroy my-project   # workspace data is lost forever
```

**Only on explicit user request.** Do not destroy just because a task is done or the current agent turn is ending.

## wait

```bash
prevu env wait my-project --timeout 300 --interval 3
# exit 0  -> ready
# exit 8  -> timed out
```

Polls `POST /api/v1/environments/<slug>/refresh` every `--interval` seconds until the SSH gateway TCP-probe succeeds. Streams status transitions in table mode; emits one JSON object per transition in `--format json` mode.

## ssh / exec / ssh-command

```bash
# One-shot remote command - preferred for agents (CLI >= 0.1.1)
prevu env exec my-project -- 'cd /workspace && pnpm install && pnpm test'

# Equivalent: env ssh also forwards trailing args after `--`
prevu env ssh my-project -- 'cd /workspace && pnpm install && pnpm test'

# Interactive - only when the user is at a TTY
prevu env ssh my-project

# Print the ssh line for paste-into-IDE
prevu env ssh-command my-project
# -> ssh prevu+my-project@my-project.prevu.page
```

**`env exec` vs `env ssh -- <cmd>`**: behavior is identical (both shell out to `ssh` with the trailing args appended). `env exec` makes the non-interactive intent explicit and errors with exit 2 if you forget the command, so prefer it in scripts and agent flows. `env ssh -- <cmd>` is fine when reusing an existing ssh-shaped invocation.

`--no-strict-host` adds `StrictHostKeyChecking=no` and `UserKnownHostsFile=/dev/null` for first-connect / CI cases. Works on both `env ssh` and `env exec`.

The CLI shells out to the system `ssh` binary. Failures from `ssh` itself (unreachable, auth denied) come through as the child process's exit code.

With `--no-strict-host`, the CLI also sets `LogLevel=ERROR` so benign first-connect `known_hosts` messages do not pollute agent logs.

## urls

```bash
prevu env urls my-project
```

Prints the SSH command and all exposed URLs in one table. Use this after multi-port setup so the user can see backend/frontend/browser URLs without hand-building protocols from `host` and `externalPort`.

`env expose --format json` includes a `url` field:

```json
{
  "data": {
    "port": 3000,
    "mode": "https",
    "host": "my-project-3000.prevu.page",
    "url": "https://my-project-3000.prevu.page/"
  }
}
```

## service - long-running processes

Use `env service` when a command should keep running after the current Agent turn or SSH session. This is the preferred path for dev servers, web backends, frontend HMR servers, and split backend/frontend projects.

```bash
prevu env service start my-project web --port 3000 -- npm run dev -- --host 0.0.0.0 --port 3000
prevu env service list my-project
prevu env service logs my-project web --tail 100
prevu env service restart my-project web
prevu env service stop my-project web
```

Internally Prevu keeps a simple registry under:

```text
/workspace/.prevu/services/<name>/
```

Each service has `service.json`, `run.pid`, `stdout.log`, and `stderr.log`. Stop/restart only uses the registered PID. **Do not use `pkill -f`** for Prevu-managed services; it can match the active SSH command and kill the control path.

Service names are short identifiers (`backend`, `frontend`, `web`) using letters, digits, `.`, `_`, or `-`. `--cwd` defaults to `/workspace`; pass it when the repo lives under a subdirectory:

```bash
prevu env service start my-project frontend \
  --cwd /workspace/my-app \
  --port 5173 \
  -- pnpm exec vite --host 0.0.0.0 --port 5173
```

`env exec` is still right for one-shot commands like install, tests, migrations, and `git pull`. `env service` is for commands that should remain alive.

## expose / unexpose

```bash
prevu env expose my-project --port 3000              # -> https://<slug>-3000.prevu.page
prevu env expose my-project --port 5432 --mode tcp   # -> tcp://<host>:<external-port>
prevu env unexpose my-project --port 3000
```

`--ssh-key-*` flags work the same as `env create` (the cloud-init spec is reapplied).

HTTPS is the default and what mobile browsers expect. TCP only for non-HTTP services. Always pass back the public URL prominently - the user often clicks it from their phone.

## refresh

The CLI's `env wait` already calls refresh under the hood. There is no public `prevu env refresh` subcommand; if you really need to force a state sync, hit `POST /api/v1/environments/<slug>/refresh` directly.

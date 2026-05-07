# @prevu/cli

Command-line interface for [Prevu](https://prevu.cloud) - staging environments for coding agents.

```sh
npm install -g @prevu/cli
prevu auth login
prevu env list
```

## Install

```sh
npm install -g @prevu/cli
```

Requires Node.js >= 20.

## Authenticate

Generate a personal access token at <https://app.prevu.cloud/keys>, then:

```sh
prevu auth login
# paste your token when prompted
```

The token is stored at `~/.prevu/config.json` (mode 0600). For CI:

```sh
prevu auth login --with-token "$PREVU_TOKEN"
# or skip auth login entirely and pass --token / set PREVU_TOKEN
```

Resolution order: `--token` flag -> `PREVU_TOKEN` env var -> `~/.prevu/config.json`.

## Commands

```
auth login              Save your API token to ~/.prevu/config.json
auth logout             Remove the saved API token
auth whoami             Show the currently authenticated user

env list                List your environments
env get <slug>          Show one environment in detail
env create <slug>       Create a new environment
env destroy <slug>      Destroy an environment
env wait <slug>         Block until ready (SSH reachable)
env ssh <slug>          Open an interactive SSH session (append `-- <cmd>` to run non-interactively)
env ssh-command <slug>  Print the ssh command
env urls <slug>         Show SSH and exposed public URLs
env exec <slug> -- <cmd>  Run a single command on the env via SSH
env service start <slug> <name> -- <cmd>  Start a long-running service
env service list <slug>   List services in an env
env service logs <slug> <name>  Print service stdout/stderr
env service restart <slug> <name>  Restart a service safely
env service stop <slug> <name>  Stop a service safely
env expose <slug>       Expose a port (HTTPS or TCP)
env unexpose <slug>     Remove a port exposure

keys list               List your saved SSH keys
```

Run `prevu <command> --help` for command-specific options.

Services are lightweight Prevu-managed processes stored under
`/workspace/.prevu/services/<name>` inside the env. Use them for dev servers
instead of hand-written `nohup`/PID files.

`env expose --format json` includes a ready-to-use `url` field. Use `env urls`
to show the SSH command and every exposed URL in one place.

## SSH key handling

`env create` and `env expose` need an SSH public key. Resolution order:

1. `--ssh-public-key <body>` - inline value.
2. `--ssh-key-file <path>` - file path.
3. `--ssh-key-id <id-or-name>` - already saved at <https://app.prevu.cloud/keys>.
4. `~/.ssh/id_ed25519.pub`, then `~/.ssh/id_rsa.pub` - auto-discovered.

A pasted key is saved automatically (deduped by fingerprint), so the next call can use it via `--ssh-key-id`.

## Output format

Default is a human-readable table. For agents and scripts:

```sh
prevu env list --format json
# {"data":[{"slug":"my-project",...}]}

prevu env create x --format json || echo "exit $?"
```

`NO_COLOR=1` or `--no-color` disables ANSI color (only applies in table mode; JSON is always uncolored).

## Exit codes

| Code | Meaning              |
|------|----------------------|
| 0    | success              |
| 1    | generic error        |
| 2    | usage error          |
| 3    | not authenticated / forbidden |
| 4    | not found            |
| 5    | conflict             |
| 6    | rate-limited         |
| 7    | server error (5xx)   |
| 8    | timeout              |

## API endpoint

`PREVU_API_URL` defaults to `https://app.prevu.cloud`. To point at a compatible API endpoint:

```sh
export PREVU_API_URL=https://prevu.example.com
# or per-call: prevu env list --api-url https://prevu.example.com
```

## Agent skills

If you're driving Prevu from Claude Code, Cursor, OpenHands, or another coding agent, install [`@prevu/skills`](https://www.npmjs.com/package/@prevu/skills) - it bundles `SKILL.md` files that teach the agent how to use the CLI without burning trial-and-error tokens:

```sh
npm install -D @prevu/skills
npx skills experimental_sync -a claude-code   # or -a cursor / -a openhands
```

## License

MIT

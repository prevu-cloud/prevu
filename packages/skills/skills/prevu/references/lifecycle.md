# Environment lifecycle

## State machine

```text
creating -> booting -> ready -> destroying -> destroyed
                       |
                       +-> app_running (tagged when a known service is up)
```

| Status        | Meaning                                                           | Accepts SSH? |
|---------------|-------------------------------------------------------------------|--------------|
| `creating`    | Environment storage and compute are being prepared                | no           |
| `booting`     | The environment booted but SSH is not reachable yet               | no           |
| `ready`       | SSH connectivity check succeeded                                  | yes          |
| `app_running` | Higher-level "user's app is up" tag, rarely emitted today         | yes          |
| `destroying`  | Tear-down in progress                                             | no           |
| `destroyed`   | Terminal state                                                    | n/a          |

Transient states (`creating`, `booting`, `destroying`) trigger faster dashboard polling and are what `env wait` blocks on.

## Why `booting` Exists

An environment can boot before SSH keys, services, and public routes are fully ready. Prevu waits for an SSH connectivity check before promoting `booting` to `ready`. When `prevu env wait` returns success, SSH should work on the next call.

## Persistence Model

- **Environment disk**: cloned from the configured base image once, then the env's private disk is its own.
- **`/workspace`**: the agreed-on user scratch dir. Lost on destroy.
- **SSH route**: reconciled when the env is ready.
- **Exposed ports**: managed by Prevu API/MCP/CLI. Do not rely on VM-local port-state files.

## Destructive Actions

`prevu env destroy <slug>` deletes the environment and workspace data. Only run it on explicit user request. Do not destroy just because a task is done, a preview was shared, or the current agent turn is ending.

## When the Dashboard Shows the Truth

The web dashboard at `https://app.prevu.cloud/envs/<slug>` polls faster while in transient states and runs the same refresh API the CLI uses. If a status looks stuck from the CLI, the dashboard event log usually says why.

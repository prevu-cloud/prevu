# Changelog

All notable changes to `@prevu/cli` will be documented in this file. Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Versioning: [SemVer](https://semver.org). The 0.x line does not guarantee a stable command surface.

## [0.2.3] - 2026-05-02

### Changed
- Refresh README guidance around the current agent-facing CLI surface.
- Remove pause/resume from the primary README command guide.

## [0.2.2] - 2026-05-02

### Added
- `env urls <slug>` prints the SSH command and all exposed public URLs.
- Exposed port API/CLI JSON responses now include a ready-to-use `url` field.

### Changed
- `env exec --no-strict-host` and `env ssh --no-strict-host` suppress benign SSH known-hosts warnings with `LogLevel=ERROR`.

## [0.2.1] - 2026-05-02

### Added
- `env service start/list/logs/restart/stop` for lightweight long-running processes. Services are stored in the environment under `/workspace/.prevu/services/<name>` with simple metadata, PID, stdout, and stderr files.

## [0.2.0] - 2026-04-29

### Changed (breaking)
- Environment JSON responses no longer include the legacy internal id field.
- `prevu env get` no longer prints the legacy internal id line.

### Added
- Slug rules tightened to hostname-safe (`^[a-z][a-z0-9-]{2,15}$`). Server returns 409 `'<slug>' is taken` when another user already owns the slug. The CLI surfaces this as exit code 5 (conflict).

### Compatibility
- Requires a Prevu API compatible with global slug ownership.

## [0.1.1] - 2026-04-27

### Added
- `env exec <slug> -- <cmd...>` runs a single command on the env via SSH (non-interactive). Stdio is inherited; the child's exit code becomes the CLI's exit code.
- `env ssh <slug> -- <cmd...>` now forwards the trailing args to ssh, so an existing session command can be passed inline without going through `env exec`.
- `CommandContext.rest: string[]` exposes positionals left over after the schema's declared positionals plus everything after `--`, so commands wrapping external tools can forward them.

## [0.1.0] - Unreleased

Initial public release.

### Added
- API-mode commands: `env list`, `env get`, `env create`, `env destroy`, `env pause`, `env resume`, `env wait`, `env ssh`, `env ssh-command`, `env expose`, `env unexpose`.
- `auth login` / `auth logout` / `auth whoami` for personal-access-token management. Token stored at `~/.prevu/config.json` (mode 0600).
- `keys list` to list SSH keys saved in Prevu.
- `--format table|json` global flag; `--no-color` and `NO_COLOR` respected.
- Typed errors with stable exit codes (1 generic, 2 usage, 3 auth, 4 not_found, 5 conflict, 6 rate_limit, 7 server, 8 timeout).
- Auto-discovery of `~/.ssh/id_*.pub` for `env create` and `env expose`.
- Default `PREVU_API_URL` of `https://app.prevu.cloud`.

### Removed
- Offline mode that called infrastructure tools directly. Use `PREVU_API_URL` to target a compatible Prevu API endpoint instead.

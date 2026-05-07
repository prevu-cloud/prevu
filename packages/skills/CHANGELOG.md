# Changelog

All notable changes to `@prevu/skills` will be documented in this file. Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Versioning: [SemVer](https://semver.org). The 0.x line does not guarantee a stable skill structure.

## [0.3.3] - 2026-05-02

### Changed
- Remove compute-suspension guidance from the primary agent playbooks.
- Align lifecycle, troubleshooting, mirror-dev, and share-preview instructions with the current CLI/API/MCP surface.
- Clarify that exposed port state is managed through API/MCP/CLI rather than VM-local port-state files.

### Compatibility
- Requires `@prevu/cli@0.2.3` or newer for the updated README/version guidance. The command surface remains compatible with `@prevu/cli@0.2.2`.

## [0.3.2] - 2026-05-02

### Changed
- Document `prevu env urls` and the `env expose --format json` `url` field.
- Update preview-sharing flows to read `.data.url` directly instead of constructing URLs from `host`.
- Note that `--no-strict-host` suppresses benign SSH known-hosts warnings.

### Compatibility
- Requires `@prevu/cli@0.2.2` or newer and a Prevu API that returns `url` for exposed ports.

## [0.3.1] - 2026-05-02

### Changed
- Document `prevu env service start/list/logs/restart/stop` as the default path for long-running dev servers and split backend/frontend services.
- Update `prevu-flows` recipes to use Prevu-managed services instead of hand-written `nohup`, PID files, and broad `pkill -f` restarts.

### Compatibility
- Requires `@prevu/cli@0.2.1` or newer and a Prevu API with the lightweight service API routes.

## [0.3.0] - 2026-04-29

### Changed (breaking)
- Slug rules tightened: lowercase letters/digits/hyphen only, must start with a letter and end with a letter/digit (RFC 1123 hostname-safe). Slugs are now **globally unique** rather than per-owner - `env create` errors with exit 5 if another user owns the slug. `prevu/references/env.md` updated.
- Public exposed-port URLs are `<slug>-<port>.prevu.page` with no user-hash prefix (matches the new Prevu API).

### Compatibility
- Requires `@prevu/cli@0.2.0` or newer and a Prevu API compatible with global slug ownership. Older CLI/API combinations may surface the legacy `u<hash>-<slug>-<port>` URL form.

## [0.2.1] - 2026-04-27

### Changed
- Document the `prevu env exec <slug> -- <cmd>` command added in `@prevu/cli@0.1.1`. Both `prevu` and `prevu-flows` skill versions bumped in lockstep.
- `prevu/references/env.md`: section retitled to `ssh / exec / ssh-command`. Recommend `env exec` as the canonical one-shot entry for agents; note `env ssh -- <cmd>` is equivalent and now actually forwards the trailing args (the previous CLI silently dropped them).
- `prevu/SKILL.md`: command map lists `exec`; install note bumps required CLI to >= 0.1.1 for the new command.
- `prevu-flows/references/mirror-dev.md`, `share-preview.md`: switched the existing `env ssh "$SLUG" -- "..."` invocations to `env exec`. Behavior is the same; intent is clearer and a missing command now fails loudly.
- `prevu/references/troubleshooting.md`: covers `env exec` alongside `env ssh` for the "exits != 0 with no output" row.

### Compatibility
- Requires `@prevu/cli@0.1.1` or newer. Older CLIs lack `env exec` and silently drop the trailing args of `env ssh -- <cmd>`.

## [0.2.0]

Initial 2-skill layout (`prevu` + `prevu-flows`) with progressive-disclosure `references/`.

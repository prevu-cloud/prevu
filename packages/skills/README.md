# @prevu/skills

Agent skills for [Prevu](https://prevu.cloud) - drop-in instructions that teach Claude Code, Cursor, OpenHands, and other coding agents how to drive the Prevu CLI.

## Install

```sh
npm install -D @prevu/skills

# Sync into your agent of choice
npx skills experimental_sync -a claude-code
# or: -a cursor / -a openhands / etc.
```

This symlinks the skills from `node_modules/@prevu/skills/skills/` into the agent's skills directory.

Alternative - install from the GitHub mirror without npm:

```sh
npx skills add prevu-cloud/prevu -a claude-code
```

## What you get

Two skills, designed around how agents actually load context (description always-on; body on trigger; references on-demand):

### `prevu`

The reference skill. Triggers when the user mentions Prevu, the CLI, env work, tokens. Body is a short overview + command map; deep detail lives in `references/`:

- `references/auth.md` - sign-in, token storage, recovering from auth errors.
- `references/env.md` - every env subcommand with examples + SSH key resolution rules.
- `references/keys.md` - saved SSH key model.
- `references/lifecycle.md` - status state machine and destructive-action guidance.
- `references/troubleshooting.md` - concrete failure modes and fixes.

### `prevu-flows`

The workflow skill. Triggers on multi-step user scenarios:

- `references/mirror-dev.md` - **AFK loop**: mirror local dev to a Prevu env so the user can preview changes from their phone while iterating with the agent in chat. Edit-locally -> push -> env-pulls -> preview -> review -> repeat.
- `references/share-preview.md` - share a WIP branch as a public preview URL for a teammate, designer, PM, or future-self on another device.

## Why two skills, not five

Skills compete for "always-on" context budget via their `description`. Anthropic's own skill-creator guidance pushes domain organization (one skill per domain, references on-demand) over command-per-skill splits. Prevu's auth/env/keys always co-occur - splitting them just multiplies the always-on tax. The flows are scenario-narrative with distinct trigger phrases, so they get their own skill.

## Versioning

Independent SemVer (`0.2.0` at launch). Tracks CLI majors (`0.x` skills with `0.x` CLI).

## License

MIT

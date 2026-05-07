# Prevu

Open-source client tools and agent assets for [Prevu](https://prevu.cloud).

Prevu gives coding agents disposable staging environments with SSH access,
preview URLs, and a simple command-line workflow. This repository contains the
public surface area:

- `apps/cli` - the `prevu` command-line interface.
- `packages/skills` - agent skills that teach coding agents how to use Prevu.
- `images/staging-ubuntu` - the public staging image contract and a local build helper.

The hosted Prevu service, account system, billing, and internal environment
orchestration are not part of this repository.

## Install the CLI

```sh
npm install -g @prevu/cli
prevu auth login
prevu env list
```

Requires Node.js 20 or newer.

## Install the Skills

```sh
npm install -D @prevu/skills
npx skills experimental_sync -a claude-code
```

The skills are plain `SKILL.md` files plus references. They are meant to help
agents use the CLI consistently without guessing command syntax.

## Development

```sh
bun install
bun run typecheck
bun run test
bun run build
```

## Packages

### `@prevu/cli`

The CLI talks to the Prevu API over HTTPS and stores an optional personal access
token in `~/.prevu/config.json`.

### `@prevu/skills`

Agent-facing documentation packaged for skill managers.

### Staging Image Contract

The image contract documents what a Prevu environment image should provide:
the `prevu` user, `/workspace`, SSH, Docker, and common build tools. It does
not expose or require knowledge of Prevu's hosted infrastructure.

## License

MIT

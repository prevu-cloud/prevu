# Prevu

**Open-source tools for using Prevu from coding agents.**

Prevu gives coding agents real staging environments: SSH access, preview URLs, and a CLI workflow that lets an agent run a project, expose it, and hand you a URL to review from any device.

This repository contains the public, open-source pieces of Prevu. The hosted control plane, account system, billing, and internal orchestration are intentionally not included here.

## What this repo is for

Use this repo if you want to:

- install the `prevu` CLI and drive Prevu from your terminal or agent;
- add Prevu skills to Claude Code, Cursor, OpenHands, or another coding agent;
- understand the public contract for a Prevu staging environment image;
- contribute to the open-source agent-facing surface area of Prevu.

The core workflow is:

```text
agent changes code -> agent runs it in Prevu -> Prevu exposes a URL -> human reviews -> agent iterates
```

## Packages

| Package / path | What it does |
| --- | --- |
| [`apps/cli`](./apps/cli) | `@prevu/cli`, the command-line interface for auth, environment lifecycle, SSH, services, and port exposure. |
| [`packages/skills`](./packages/skills) | `@prevu/skills`, agent instructions that teach coding agents how to use the CLI without guessing commands. |
| [`images/staging-ubuntu`](./images/staging-ubuntu) | Public staging-image contract: expected user, workspace, metadata files, SSH, Docker, and common build tools. |

## Install the CLI

```sh
npm install -g @prevu/cli
prevu auth login
prevu env list
```

Requires Node.js 20 or newer.

Generate a personal access token at <https://app.prevu.cloud/keys>, then run `prevu auth login` and paste the token when prompted.

Common commands:

```sh
# Create or inspect an environment
prevu env create my-app
prevu env get my-app

# Run commands through SSH
prevu env ssh my-app
prevu env exec my-app -- pwd

# Start a long-running dev server and expose it
prevu env service start my-app web -- npm run dev -- --host 0.0.0.0
prevu env expose my-app --port 3000
prevu env urls my-app
```

See [`apps/cli/README.md`](./apps/cli/README.md) for the full command reference.

## Install the agent skills

```sh
npm install -D @prevu/skills
npx skills experimental_sync -a claude-code
```

The skills are plain `SKILL.md` files plus references. They help agents use Prevu predictably for flows such as:

- mirroring local development to a Prevu environment for phone/AFK review;
- sharing a work-in-progress branch as a public preview URL;
- recovering from auth, SSH, lifecycle, and port-exposure issues.

You can also install the skills from the GitHub mirror:

```sh
npx skills add prevu-cloud/prevu -a claude-code
```

See [`packages/skills/README.md`](./packages/skills/README.md) for details.

## Staging image contract

Prevu environments are expected to provide a predictable baseline for coding agents:

- user: `prevu`
- workspace: `/workspace`
- metadata: `/opt/prevu/environment.json`
- provision marker: `/opt/prevu/provisioned`
- SSH server enabled
- Docker and Docker Compose available to `prevu`
- Git, curl, jq, build tools, Python 3, Go, and Bun

See [`images/staging-ubuntu/README.md`](./images/staging-ubuntu/README.md) for the current contract and local build helper.

## Development

```sh
bun install
bun run typecheck
bun run test
bun run build
```

Workspace scripts currently focus on the CLI package:

- `bun run typecheck` — TypeScript checks for `@prevu/cli`
- `bun run test` — CLI test suite
- `bun run build` — bundles the CLI

## What is not included

This repository does not contain the hosted Prevu service implementation:

- production control plane;
- account and billing system;
- internal VM lifecycle orchestration;
- private infrastructure manifests;
- hosted deployment credentials or configuration.

Those are part of the managed Prevu service at <https://prevu.cloud> and <https://app.prevu.cloud>.

## License

MIT

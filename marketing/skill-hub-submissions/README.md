# Prevu skill hub submission kit

Prevu has two public agent skills in `prevu-cloud/prevu`:

- `prevu`: command-level reference for the Prevu CLI.
- `prevu-flows`: workflow playbooks for mobile review loops and shareable WIP previews.

## Canonical URLs

- Website: https://prevu.cloud
- GitHub: https://github.com/prevu-cloud/prevu
- Root skills directory: https://github.com/prevu-cloud/prevu/tree/main/skills
- `prevu` skill: https://github.com/prevu-cloud/prevu/tree/main/skills/prevu
- `prevu-flows` skill: https://github.com/prevu-cloud/prevu/tree/main/skills/prevu-flows
- NPM CLI: https://www.npmjs.com/package/@prevu/cli
- NPM skills package: https://www.npmjs.com/package/@prevu/skills

## Short description

Prevu gives coding agents real preview environments: a VM, SSH, logs, services, and public HTTPS preview URLs so humans can review running software before production.

## One-line listing copy

Preview environments for coding agents. Use Prevu skills to spin up VM-backed staging environments, expose public URLs, inspect logs, and share work-in-progress software with humans.

## Longer listing copy

Prevu is a developer tool for AI coding workflows. It gives agents a real VM-backed preview environment where they can run app changes, expose HTTPS URLs, inspect services and logs, and hand humans a reviewable link before production. The open-source `prevu` and `prevu-flows` skills teach Claude Code, Codex, Cursor, OpenHands, OpenClaw, and other skill-compatible agents how to use the Prevu CLI without guessing commands or staging-flow details.

Use cases:

- Review agent-generated changes on a live URL before merging.
- Keep work moving while away from the laptop by reviewing a Prevu URL from a phone.
- Share a WIP branch with a teammate, designer, or PM without waiting for production deploys.
- Give agents a repeatable staging loop with SSH, logs, exposed ports, and service commands.

## Tags

agent skills, coding agents, developer tools, preview environments, staging environments, devops, CLI, Claude Code, Codex, Cursor, OpenHands, OpenClaw, AI engineering, review workflows, public preview URL

## Category suggestions

- Developer Tools
- DevOps & Deployment
- Coding Agents
- Agent Workflows
- CLI Tools
- Productivity

## Install commands

```sh
npm install -g @prevu/cli
npm install -D @prevu/skills
npx skills experimental_sync -a claude-code
```

Alternative:

```sh
npx skills add prevu-cloud/prevu -a claude-code
```

## Submission status

| Site | URL | Method | Status | Notes |
| --- | --- | --- | --- | --- |
| SkillsMD | https://skillsmd.dev | Web form | Pending | Direct submit form accepts repo, skill name, description, optional email. |
| askill | https://askill.sh/submit | Web form | Pending | Direct submit form accepts GitHub URL. |
| SkillKit | https://skillkit.io/submit | Web form | Pending | Direct submit form accepts GitHub repository URL. |
| Skillery | https://skillery.dev/submit | GitHub sign-in | Blocked on account session | Requires GitHub sign-in in browser. |
| Open Agent Skills | https://openagentskills.dev | GitHub/email | Pending | Site asks for GitHub repository contribution; contact available. |
| SkillsCat | https://skills.cat | CLI/GitHub | Pending | Docs mention publishing via CLI; identify publish route. |
| Sundial | https://www.sundialhub.com | CLI/dashboard | Pending | Docs mention `npx sundial-hub` publishing. |
| runaskill | https://runaskill.com | GitHub/listing | Pending | Need inspect submission path. |
| Gaia | https://gaia.tiongson.co | GitHub PR | Pending | Site mentions review batches and GitHub PRs. |
| AgDex | https://agdex.ai | Directory submission | Pending | Agent resource directory; useful fallback if pure skill registry path is unavailable. |


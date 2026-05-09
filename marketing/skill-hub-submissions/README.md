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

Preview environments for coding agents. Use Prevu skills to spin up VM-backed preview environments, expose public URLs, inspect logs, and share work-in-progress software with humans.

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
| Awesome Skills Directory | https://www.awesomeskills.dev/en/skill/prevu-prevu | Web form | Live | `prevu` indexed successfully. |
| AgentSkills.in | https://agentskills.in | Web form | Live | Submitted `prevu-cloud/prevu`; site reported 4 indexed skills. |
| SkillKit | https://skillkit.io/submit | Web form | Submitted | Review queue accepted `https://github.com/prevu-cloud/prevu`. |
| Skills.re | https://skills.re/submit | Web form | Queued | Submitted root `skills/prevu` and `skills/prevu-flows`; job `skills-upload-2a83a645-d7e2-46f5-9aae-081cc515b307`. |
| forAgents.dev | https://foragents.dev | API submission | Submitted | Pending review as `fbdaffce-b3ea-4b7a-9eab-a3a8787da0e0`. |
| AbsolutelySkilled | https://github.com/AbsolutelySkilled/AbsolutelySkilled/pull/6 | GitHub PR | Submitted | Adds `prevu-preview-environments` skill. |
| block/agent-skills | https://github.com/block/agent-skills/pull/34 | GitHub PR | Submitted | Adds `prevu-preview-environments` skill for Goose-style agent skills. |
| AgenticSkills | https://agenticskills.io/submit | Web form | Blocked by site config | Full form submitted, but the page returned `Submission review queue is not configured.` |
| agentskill.sh | https://agentskill.sh/submit | Repo import | Rate-limited | Repo import attempted; page returned `Too many submissions. Please try again in an hour.` Google sign-in was not authorized. |
| OmniSkill Registry | https://omniskill.online | Repo import | Blocked by site API | Repo import attempted; page returned `Network error: Unexpected non-whitespace character after JSON at position 4`. |
| AgentVerus | https://agentverus.ai/skill/7e66eafe-e613-4e95-913c-9442614377d8 | Security scan | Listed with report | Direct `skills/prevu/SKILL.md` scan created a trust report with score 87 conditional after explicit safety boundaries were added. |
| mdskills.ai | https://mdskills.ai/submit | Auth-gated form | Blocked on account authorization | Submit redirects to sign-in with GitHub, Google, or email; do not continue without a dedicated account decision. |
| Agent Skill Source | https://agentskillsource.com/submit | Web form | Submitted for review | Form submitted as `Prevu Preview Environments`; page confirmed `Submission Received!` and review-by-email flow. |
| skillz.directory | https://www.skillz.directory/submit | Web form | Blocked by email validator | Full form was ready, but the page rejected `hello@prevu.cloud` as invalid; avoid using a personal email just to bypass the validator. |
| SkillsMD | https://skillsmd.dev | Web form + API | Blocked by site lookup | Form and direct API both returned `GitHub repo not found: prevu-cloud/prevu`, despite GitHub API returning 200. |
| askill | https://askill.sh/submit | Web form | Blocked by parser/cache | Submission reached the parser but reported `skills/prevu/SKILL.md failed`; retry after root skill simplification or contact maintainer. |
| AI Skill Market | https://aiskill.market/submit | Web form | Blocked by site lookup | Full multi-step form submitted, but final submit returned `GitHub repository not found. Please contact support.` |
| Skillery | https://skillery.dev/submit | GitHub sign-in | Blocked on account authorization | Requires authorizing GitHub OAuth app; do not continue without explicit account-action approval. |
| SkillPM | https://skillpm.dev/registry | NPM keyword indexing | Prepared | Added `agent-skill` and related discovery keywords to `@prevu/skills`; next npm publish should make it discoverable. |
| Open Agent Skills | https://openagentskills.dev | GitHub/email | Backlog | Site asks for GitHub repository contribution; keep GitHub activity light before opening more PRs. |
| Machina | https://machina.directory | GitHub-auth form | Backlog | Directory has an explicit submit flow, but requires GitHub login; defer until account-rate risk is lower. |
| skillsdir.dev | https://skillsdir.dev/add | GitHub issue / CLI | Backlog | Submission is via GitHub issue or `skill publish`; defer further GitHub activity for now. |
| SkillsCat | https://skills.cat | CLI/GitHub | Pending | Docs mention publishing via CLI; identify publish route. |
| Sundial | https://www.sundialhub.com | CLI/dashboard | Pending | Docs mention `npx sundial-hub` publishing. |
| runaskill | https://runaskill.com | GitHub/listing | Pending | Need inspect submission path. |
| Gaia | https://gaia.tiongson.co | GitHub PR | Pending | Site mentions review batches and GitHub PRs. |
| AgDex | https://agdex.ai | Directory submission | Pending | Agent resource directory; useful fallback if pure skill registry path is unavailable. |

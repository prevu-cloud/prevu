# Submission field bank

Use this file when a directory asks for slightly different product fields. Keep the wording centered on preview environments, not generic staging URLs.

## Product identity

Name:

```text
Prevu
```

Tagline:

```text
Preview environments for coding agents
```

Short description:

```text
Prevu gives coding agents VM-backed preview environments with SSH, logs, services, and public HTTPS URLs so humans can review running software before production.
```

Long description:

```text
Prevu is a preview-environment layer for AI coding workflows. It gives coding agents a VM-backed environment where they can run app changes, inspect services and logs, expose public HTTPS URLs, and hand humans a reviewable link before production. The open-source repo includes the Prevu CLI plus portable SKILL.md workflows for agents that need a repeatable preview loop.
```

## URLs

Website:

```text
https://prevu.cloud
```

Repository:

```text
https://github.com/prevu-cloud/prevu
```

Skills directory:

```text
https://github.com/prevu-cloud/prevu/tree/main/skills
```

Primary skill:

```text
https://github.com/prevu-cloud/prevu/tree/main/skills/prevu
```

Flow skill:

```text
https://github.com/prevu-cloud/prevu/tree/main/skills/prevu-flows
```

NPM CLI:

```text
https://www.npmjs.com/package/@prevu/cli
```

NPM skills package:

```text
https://www.npmjs.com/package/@prevu/skills
```

Discord:

```text
https://discord.gg/2a2MzpSX
```

## Install commands

Primary:

```sh
npm install -g @prevu/cli
```

Skills:

```sh
npm install -D @prevu/skills
npx skills experimental_sync -a claude-code
```

Alternative:

```sh
npx skills add prevu-cloud/prevu -a claude-code
```

## Categories

Use the most specific available option:

1. Developer Tools
2. DevOps
3. AI Agents
4. Coding Agents
5. CLI Tools
6. Productivity
7. Open Source

## Tags

```text
agent skills, coding agents, preview environments, developer tools, devops, cli, ai engineering, public preview urls, vm-backed environments, logs, ssh, human review
```

## Founder note

```text
I am building Prevu because coding agents can now change code faster than humans can safely review running behavior. Prevu gives the agent a real preview environment and gives the human a link they can click before production.
```

## Safety note

```text
Prevu is for pre-production review workflows. The skills tell agents not to expose private services, not to copy secrets into logs or public URLs, and not to treat a preview environment as production hosting.
```

## Social proof

```text
The Prevu skill is live on Awesome Skills Directory, indexed on AgentSkills.in, and has an AgentVerus security report. The repo has also been submitted to several skill and developer-tool directories for review.
```

# Launch posts

## Hacker News

Title:

Show HN: Prevu - preview environments for coding agents

Body:

I built Prevu, a preview-environment layer for AI coding workflows.

Coding agents can already edit code, run commands, and open PRs. The part that still feels awkward is reviewing the running product. A diff is useful, but a PM, designer, founder, or teammate usually wants a link they can click before anything reaches production.

Prevu gives an agent a VM-backed environment where it can run the app, inspect services/logs, expose a public HTTPS URL, and hand that URL to a human for review.

The CLI and skills are open source:

https://github.com/prevu-cloud/prevu

The skills are the interesting bit for agent workflows. `prevu` gives command-level guidance for the CLI, and `prevu-flows` teaches higher-level review loops such as "mirror my dev environment so I can review from my phone" or "share this WIP branch with a teammate."

I am trying to make this feel like a real review layer for agent work, not another one-off tunnel.

## Reddit: r/ClaudeAI / r/Cursor / r/AI_Agents

Title:

I made open-source Prevu skills for VM-backed preview environments

Body:

I have been working on Prevu, a small preview-environment layer for coding agents.

The problem: agents can write code and open PRs, but humans still need to review the running behavior. Screenshots and diffs help, but the best handoff is usually a public URL backed by a real environment.

Prevu gives agents:

- a VM-backed preview environment
- SSH access
- service and log inspection
- public HTTPS preview URLs
- a repeatable human review loop

The open-source repo now includes agent skills:

https://github.com/prevu-cloud/prevu

Install:

```sh
npm install -g @prevu/cli
npm install -D @prevu/skills
npx skills experimental_sync -a claude-code
```

I would love feedback from people using Claude Code, Codex, Cursor, OpenHands, OpenClaw, or similar tools. The big question I am exploring is: what should the agent-to-human review handoff look like when the agent can actually run the product?

## Dev.to / Medium

Title:

Preview environments are the missing review layer for coding agents

Subtitle:

Agents can write code, but humans still need to click the running product.

Canonical intro:

Coding agents are getting good at changing code. They can edit files, run commands, explain failures, and even prepare pull requests. But after the code changes, there is still a very human bottleneck: someone has to review what the product actually does.

A diff cannot tell you whether the flow feels right. A screenshot cannot cover the edge cases. A local tunnel depends on someone's laptop staying awake.

Prevu is built around a simple idea: agent work should produce a reviewable preview environment by default.

## Product Hunt teaser

Name:

Prevu

Tagline:

Preview environments for coding agents

Description:

Prevu gives AI coding agents VM-backed preview environments with SSH, logs, services, and public HTTPS URLs, so humans can review running software before production. The open-source CLI and skills help Claude Code, Codex, Cursor, OpenHands, OpenClaw, and other agents operate the preview loop without guessing.


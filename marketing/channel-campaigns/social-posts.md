# Social posts

## X short post

Coding agents can write code.

The harder part is reviewing the running product.

Prevu gives agents VM-backed preview environments with SSH, logs, services, and public HTTPS URLs so humans can click before production.

CLI + skills are open source:
https://github.com/prevu-cloud/prevu

## X thread

1/ Coding agents are moving fast, but review still has a gap.

They can edit code, run commands, and open PRs. But the human usually still needs to ask: "Can I click it?"

2/ Prevu is a preview-environment layer for agent work.

An agent gets a VM-backed environment, runs the app, exposes a public HTTPS URL, checks services/logs, and hands the link to a human.

3/ The goal is not just "a staging URL".

The goal is a repeatable review loop:

- agent changes code
- environment runs it
- URL gets shared
- human reviews behavior
- agent iterates

4/ We published open-source skills for this flow.

`prevu` teaches command-level CLI usage.
`prevu-flows` teaches workflows like mobile review and WIP branch sharing.

5/ Repo:

https://github.com/prevu-cloud/prevu

Try:

```sh
npm install -g @prevu/cli
npm install -D @prevu/skills
```

## LinkedIn

AI coding agents are quickly becoming capable of changing code and preparing pull requests.

But teams still need a trustworthy way to review the running software before production.

That is the gap Prevu is trying to fill: preview environments for coding-agent work.

Prevu gives agents a VM-backed environment with SSH, service/log inspection, exposed ports, and public HTTPS URLs. Instead of asking a teammate to infer behavior from a diff, the agent can hand them a link to the running product.

We also published open-source agent skills so Claude Code, Codex, Cursor, OpenHands, OpenClaw, and other skill-compatible agents can use the Prevu CLI consistently.

Open source repo:
https://github.com/prevu-cloud/prevu

## Discord / Slack community post

I have been building Prevu: preview environments for coding agents.

The use case is simple: when an agent changes code, it should be able to run the app in a real environment and give humans a public HTTPS URL to review before production.

Open-source CLI + skills:
https://github.com/prevu-cloud/prevu

The skills cover command-level CLI usage plus higher-level flows like phone review and sharing WIP branches. Would love feedback from anyone using Claude Code, Codex, Cursor, OpenHands, OpenClaw, or Goose-style agent skills.


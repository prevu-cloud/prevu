# No-login promotion playbook

Use this when GitHub/OAuth activity should stay quiet. The goal is to keep moving without asking for account permissions or posting through a personal identity.

## Today-safe actions

- Submit web forms that accept a public repo URL and `hello@prevu.cloud`.
- Prepare posts for the maintainer to publish manually later.
- Record broken forms with exact error text so follow-up emails are concrete.
- Improve repo landing copy, social images, and install instructions.
- Search for communities and newsletters, but do not sign in or authorize apps.

## Do not do silently

- Authorize GitHub, Google, Discord, X, Reddit, Product Hunt, or Medium apps.
- Use a personal email address to bypass a form validator.
- Open more GitHub PRs to directory repos during a rate-risk window.
- Post comments from the maintainer's account without a final human review.

## Low-risk post queue

### Hacker News / Lobsters

Title:

```text
Show HN: Prevu, preview environments for coding agents
```

Body:

```text
Prevu gives coding agents a real VM-backed preview environment they can operate from a CLI: run services, inspect logs, expose public HTTPS URLs, and hand a human a link to review running software before production.

The repo now includes portable SKILL.md workflows for agents, so Claude Code, Codex, Cursor, Cline, and similar tools can learn when to create a preview, how to expose a port, and what safety boundaries to respect.

Repo: https://github.com/prevu-cloud/prevu
Site: https://prevu.cloud
```

### Reddit

```text
I am building Prevu, a preview environment layer for coding agents.

The idea is simple: when an agent changes code, it should be able to run the app in a real VM-backed environment, expose an HTTPS URL, and give a human a review link before production. That is different from only reading diffs or screenshots.

The open-source repo now includes SKILL.md workflows for agents:
- create or reuse a Prevu environment
- run project services
- expose review URLs
- inspect logs and services
- avoid unsafe operations like exposing private services or copying secrets

Repo: https://github.com/prevu-cloud/prevu
```

### Newsletter/creator pitch

```text
Hi, I am building Prevu, preview environments for coding agents.

Coding agents can now edit code quickly, but humans still need to review running behavior. Prevu gives agents a VM-backed environment with SSH, logs, service discovery, and public HTTPS URLs, so the agent can hand back a live preview instead of only a diff.

The open-source repo includes portable SKILL.md workflows for Claude Code, Codex, Cursor, Cline, and similar tools:
https://github.com/prevu-cloud/prevu

Thought it might be relevant for your audience if you cover agent tooling or AI developer workflows.
```

## Next manual checklist

- Publish one launch thread manually from the preferred identity.
- Pick one community at a time and reply to comments for 20 minutes.
- Send at most five creator/newsletter pitches per day.
- Follow up on broken directory forms after the repo has been indexed by a few more sites.

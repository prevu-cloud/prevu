# Comment reply bank

Use these as starting points for launch-thread replies. Keep the tone practical and curious.

## "Isn't this just staging?"

It overlaps with staging, but the product shape is different.

Traditional staging is usually a team-owned environment tied to CI/CD. Prevu is meant to be operated by coding agents during work in progress. The agent can create or reuse a VM-backed preview environment, run the project with the repo's own commands, expose a public HTTPS URL, inspect logs/services, and return the link to a human for review.

So the core category is preview environments for coding-agent work, not production-like release staging.

## "Why not use Vercel/Netlify previews?"

Those are great for supported frontend stacks.

Prevu is aimed at the messier cases: full-stack apps, custom dev commands, workers, logs, Docker, services, and agent workflows where the agent needs a real Linux environment it can operate directly.

The point is not to replace frontend preview hosting. It is to give agents a reliable environment when preview hosting is too narrow.

## "Why not just use a local tunnel?"

Local tunnels are useful, but they depend on a developer's laptop, local services, local ports, and local network state.

Prevu moves the review target into a VM-backed environment the agent can operate. That makes the review link easier to share and keeps the loop available when the human is away from the laptop.

## "How does an agent use it?"

Install the CLI and skills:

```sh
npm install -g @prevu/cli
npm install -D @prevu/skills
npx skills experimental_sync -a claude-code
```

Then the agent can follow the `prevu` command reference and `prevu-flows` playbooks to create environments, run services, expose ports, check logs, and report preview URLs.

## "What agents does this work with?"

The CLI is agent-agnostic. The skills are written for SKILL.md-compatible workflows and target tools such as Claude Code, Codex, Cursor, OpenHands, OpenClaw, and similar coding agents.

## "Is it production hosting?"

No. Prevu is for the review loop before production.

The intended lifecycle is:

```text
agent changes code -> Prevu runs it -> public URL -> human review -> agent iterates
```

Production deployment should remain in the team's existing production path.

## "Is the repo open source?"

Yes:

https://github.com/prevu-cloud/prevu

The open-source repo includes the CLI and the skills package. The hosted product is at:

https://prevu.cloud

## "What would you like feedback on?"

The most useful feedback is workflow-level:

- Where does your agent get stuck when trying to run a real project?
- What information should the agent report back with the preview URL?
- Which logs/services/debug views are most useful before asking a human to review?
- What would make the phone-review or teammate-share loop feel natural?


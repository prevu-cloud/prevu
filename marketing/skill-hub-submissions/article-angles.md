# Article and social angles

## Medium / blog angle

Title:

Preview environments are the missing review layer for coding agents

Thesis:

Coding agents can edit, test, and open pull requests, but humans still need to review the running software. Prevu turns agent work into a live preview environment with a public URL, logs, services, SSH, and a repeatable handoff loop.

Outline:

1. Agents are good at changing code; teams still need to inspect behavior.
2. Screenshots and diffs are not enough for product review.
3. A preview environment should be a real VM, not a fragile local tunnel.
4. The agent workflow: edit locally, push, run in Prevu, expose HTTPS, share URL.
5. Skills make this repeatable across Claude Code, Codex, Cursor, and other agents.
6. Try it with `@prevu/cli` and `@prevu/skills`.

## X / LinkedIn post

Coding agents can already write code and open PRs.

The bottleneck is reviewing the running product.

Prevu gives agents a real preview environment: VM, SSH, logs, services, exposed HTTPS URLs, and a repeatable human review loop.

We also published open-source agent skills so Claude Code, Codex, Cursor, OpenHands, and OpenClaw can use the CLI without guessing.

GitHub: https://github.com/prevu-cloud/prevu

## Reddit / Hacker News style

Show HN: Prevu - preview environments for coding agents

Prevu is a small preview layer for AI coding workflows. It gives coding agents a VM-backed environment where they can run app changes, expose a public HTTPS URL, inspect logs/services, and hand the result to a human for review before production.

The CLI and agent skills are open source:

https://github.com/prevu-cloud/prevu

The part I care about most is making the review loop concrete. Diffs are useful, but a PM/designer/founder usually wants a link they can click. The `prevu` and `prevu-flows` skills teach agents how to create that link and operate the environment consistently.


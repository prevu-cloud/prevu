---
name: prevu-flows
description: "Use when the user wants to mirror their local dev to a Prevu environment so they can preview changes from their phone while AFK, or when they want to share an in-progress branch as a public preview URL for a teammate, designer, or PM. Mentions: AFK, mobile preview, phone preview, mirror dev, share preview, preview URL, prevu.page, drive from mobile, review on phone, send a teammate a preview, share WIP branch."
---

# Prevu - Workflow Flows

Two multi-step user-facing scenarios that wire the `prevu` CLI into a coherent loop. Each has its own playbook in `references/`. Load this skill when the user's intent is a *workflow*, not a single command. For command-level reference (every flag, every exit code), the `prevu` skill is the source.

## Flow A - Mirror local dev to the user's phone (the AFK loop)

**Read `references/mirror-dev.md`** when the user wants to keep iterating with you while away from their laptop. Trigger phrases:

- "I'm heading out, can you keep working on this?"
- "Mirror this to Prevu / spin up a remote dev env"
- "I want to review changes on my phone tonight"
- "Set up so I can drive it from mobile"
- "Keep coding while I'm AFK"

The shape of the loop:

```
user (phone): "change X"
  down
you: edit locally -> commit -> push
  down
env: pulls -> dev server hot-reloads
  down
user (phone): refreshes preview URL -> "no, do Y"
  down ... repeat until accepted ...
```

Crucial: **Prevu is the preview target, not the editing machine.** Edits happen in the user's local checkout where their files, history, and secrets live. The env only sees what you push. Don't dual-edit.

## Flow B - Share a WIP preview URL

**Read `references/share-preview.md`** when the user wants someone else (teammate, designer, PM, or themselves later from a different device) to see in-progress work without waiting for a deploy. Trigger phrases:

- "Show this to the backend team"
- "Send my designer a preview link"
- "I want a shareable URL for this branch"
- "Get this in front of <person>"

The shape of the flow is shorter than mirror-dev: provision (or reuse) -> push the branch -> install + start dev server -> expose HTTPS -> hand back one URL. Once the URL is sent, you're done. No iterate loop unless the user comes back with feedback.

## Decision tree - which flow?

| User said...                                          | Use                  |
|-----------------------------------------------------|----------------------|
| "Going AFK / keep coding / drive from mobile"       | Flow A (mirror-dev)  |
| "Show / share / send" + a person or audience        | Flow B (share-preview)|
| "Just create a Prevu env" with no further intent    | The `prevu` skill - `env create` is enough |
| "Deploy" / "production"                             | Neither - Prevu is staging |

## Common ground (loaded with either flow)

Both flows assume:

- The user is signed in (`prevu auth whoami` works). If not, surface the dashboard URL.
- A stable, project-scoped slug (NOT randomised per session). Both flows pick `${PREVU_SLUG:-<project-dir-name>}`.
- The env is idempotently reused: `env get` first, `create` if missing, then `env wait` before SSH/exec.
- The dev server runs the **same command and port** as the user's local setup. Read `package.json` / `pyproject.toml` / `Procfile`; ask the user if it's non-standard.
- The dev server binds to `0.0.0.0`, not `localhost`, so the Ingress can reach it.
- HTTPS exposure (the default) - never TCP for browser previews.
- The public URL is printed prominently. The user is on a phone or sharing in chat; one tappable link.

## When to stop the flow

- **Flow A**: when the user says they're done / accepts. Leave the URL and env slug clearly documented for follow-up.
- **Flow B**: when the URL is in the user's hands. You're done unless the user asks you to clean up the preview.

In neither flow do you `destroy` without explicit consent. That's the most common agent mistake against Prevu's persistence model.

## Token-cost notes

This skill is intentionally short - it routes you. Once you've matched a flow, load the corresponding `references/<flow>.md` and follow that playbook. Don't pre-load both flows.

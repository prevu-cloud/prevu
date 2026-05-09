# Flow B - Share a WIP preview URL

The user wants someone - a teammate, designer, PM, or themselves later from a different device - to see in-progress work without waiting for a deploy. **Provision (or reuse) -> push the branch -> install + start -> expose HTTPS -> hand back one URL.** No iterate loop unless the user comes back with feedback.

## Difference vs Flow A

- One-shot: end goal is a URL in someone else's hands, not a sustained edit/preview loop.
- The recipient is often **not** the user. They get a URL, nothing else. Don't hand them SSH commands or expect them to install anything.
- After summary, leave the URL and env slug clearly documented. Do not destroy unless explicitly asked.

## Playbook

```bash
# 1. Auth + slug + reuse-or-create
prevu auth whoami --format json >/dev/null || {
  echo "Run \`prevu auth login\` (token at https://app.prevu.cloud/keys)" >&2
  exit 3
}

SLUG="${PREVU_SLUG:-$(basename "$(git rev-parse --show-toplevel 2>/dev/null || pwd)" \
  | tr '[:upper:]' '[:lower:]' | tr -c 'a-z0-9-_' '-' \
  | sed 's/^-*//;s/-*$//' | cut -c1-16)}"

STATUS=$(prevu env get "$SLUG" --format json 2>/dev/null | jq -r '.data.status // ""')
case "$STATUS" in
  "")     prevu env create "$SLUG" --format json ;;
esac
prevu env wait "$SLUG" --timeout 300

# 2. Push the branch the user wants reviewed (might not be `main`)
BRANCH=${BRANCH:-$(git symbolic-ref --short HEAD)}
git push -u origin "$BRANCH"

# 3. Decide dev command + port (see the table below). Match the local setup.
DEV_CMD="npm run dev -- --hostname 0.0.0.0 --port 3000"
PORT=3000

# 4. Bring up the dev server in the env
REPO_URL=$(git remote get-url origin)
REPO_DIR="/workspace/$(basename "$REPO_URL" .git)"

prevu env exec "$SLUG" --no-strict-host -- "
  set -e
  if [ ! -d '$REPO_DIR/.git' ]; then
    cd /workspace && git clone '$REPO_URL'
  fi
  cd '$REPO_DIR' && git fetch && git checkout '$BRANCH' && git pull
  if   [ -f bun.lockb ];           then bun install
  elif [ -f pnpm-lock.yaml ];      then pnpm install
  elif [ -f yarn.lock ];           then yarn install
  elif [ -f package-lock.json ];   then npm install
  fi
"

prevu env service start "$SLUG" web --cwd "$REPO_DIR" --port "$PORT" -- $DEV_CMD
prevu env service logs "$SLUG" web --tail 30

# 5. Expose HTTPS and produce the share-ready message
URL=$(prevu env expose "$SLUG" --port "$PORT" --format json | jq -r '.data.url')

cat <<MSG
link Share this with <recipient>:
   $URL

   Branch: $BRANCH
   Note: it's a live dev server, expect occasional reloads.
MSG
```

## Same defaults as Flow A

Read `references/mirror-dev.md` for:

- The dev-command-by-framework table (Next.js, Vite, Django, etc.)
- The `0.0.0.0` requirement
- Env-var / secrets handling
- Database options

The differences for sharing are about **what you say**, not what you run.

## Messaging the user (and the recipient)

After expose succeeds, give the user a copy-paste-ready block:

> Share with <name>:
>
> > Hey, here's the WIP preview: https://my-project-3000.prevu.page
> > It's live off the `feat/redesign-checkout` branch. Tell me what's off.

For the recipient, **lead with the URL**. Don't dump SSH commands, branch names mid-paragraph, or Prevu-internal jargon. They're being asked to click a link and look at something.

## After the share

Three branches:

1. **Recipient comes back with feedback -> user wants to iterate.** Switch to Flow A's iterate loop (Phase 2 in `mirror-dev.md`). Same env, same URL.
2. **Recipient approved.** Leave the env slug, URL, branch, and service name in the summary.
3. **One-shot review, no plans for follow-up.** Still do not destroy unless the user explicitly asks. The user might want to re-share next week.

`destroy` only on explicit request.

## Pitfalls

- **Sharing a TCP-mode URL** for a browser preview - the recipient sees a cert warning. Always default to HTTPS mode.
- **Sharing a localhost-bound dev server** - recipient gets a 502. Always `--host 0.0.0.0`.
- **Sharing without pushing the branch first** - env clones `main`, recipient sees stale work.
- **Auto-destroy after sharing** - the user often wants to come back to the same URL after feedback. Keep the slug + URL stable unless the user asks for cleanup.
- **Treating the recipient as if they're the user** - they don't have `prevu` installed. They get a URL, full stop.

## Failure recovery

| Symptom                                              | Action                                                  |
|------------------------------------------------------|---------------------------------------------------------|
| `expose` returns but URL 502s                        | Dev server bound to `127.0.0.1`, or process crashed. Run `prevu env service logs "$SLUG" web`. |
| Recipient says "looks like the old version"         | You forgot to `git checkout` the branch on the env. Re-run the `git fetch && git checkout && git pull` step. |
| Recipient hits a cert warning                        | TCP mode by mistake. `unexpose` + re-expose without `--mode tcp`. |
| Recipient hits the URL hours later, dev server gone  | Re-start the dev command with `prevu env service restart "$SLUG" web`, then check logs. |

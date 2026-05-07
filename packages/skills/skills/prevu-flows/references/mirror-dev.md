# Flow A - Mirror local dev to the user's phone

The user is leaving their laptop. They want to keep iterating with you from their phone - review changes live, give the next instruction, repeat. **Edit locally -> push -> env pulls -> preview -> user reviews -> repeat.**

## Mental model

Prevu is the **preview target**, not the editing machine. Files live in the user's local checkout - their git, their secrets. The env only ever sees what you push. The dev server in the env hot-reloads off the watched filetree, so each round is *one commit + one short SSH*.

## Phase 1 - One-time setup per env (run once at session start)

```bash
# 1. Sign-in sanity
prevu auth whoami --format json >/dev/null || {
  echo "Run \`prevu auth login\` (token at https://app.prevu.cloud/keys)" >&2
  exit 3
}

# 2. Pick a stable, project-scoped slug - NEVER randomise per session
SLUG="${PREVU_SLUG:-$(basename "$(git rev-parse --show-toplevel 2>/dev/null || pwd)" \
  | tr '[:upper:]' '[:lower:]' | tr -c 'a-z0-9-_' '-' \
  | sed 's/^-*//;s/-*$//' | cut -c1-16)}"

# 3. Reuse or create
STATUS=$(prevu env get "$SLUG" --format json 2>/dev/null | jq -r '.data.status // ""')
case "$STATUS" in
  "")     prevu env create "$SLUG" --format json ;;
  *)      echo "reusing $SLUG ($STATUS)" ;;
esac

prevu env wait "$SLUG" --timeout 300

# 4. Detect the dev command + port from the LOCAL project. Match what the
#    user runs on their laptop - read package.json#scripts.dev, Procfile,
#    or ask. See "Detect" below.
DEV_CMD="npm run dev -- --hostname 0.0.0.0 --port 3000"
PORT=3000

# 5. Push the current branch so the env can clone/pull it
BRANCH=$(git symbolic-ref --short HEAD)
git push -u origin "$BRANCH"

# 6. Bootstrap the env: clone, install, start the dev server as a Prevu service
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

# 7. Expose HTTPS and hand back the URL
URL=$(prevu env expose "$SLUG" --port "$PORT" --format json | jq -r '.data.url')
echo "Preview ready: $URL"
```

## Phase 2 - The iterate loop (runs N times per round of feedback)

```bash
# user: "change X"  ->  you edit locally as usual

git add -A
git commit -m "<concise summary>"
git push

# Sync the env to the new commit. Single short SSH:
prevu env exec "$SLUG" --no-strict-host -- "
  set -e
  cd '$REPO_DIR'
  git fetch && git reset --hard origin/'$BRANCH'
  # Re-install only when deps actually moved
  if git diff --name-only HEAD@{1} HEAD | grep -qE '(package\\.json|lock|pnpm-lock|bun\\.lockb|yarn\\.lock)'; then
    if   [ -f bun.lockb ];      then bun install
    elif [ -f pnpm-lock.yaml ]; then pnpm install
    elif [ -f yarn.lock ];      then yarn install
    else                             npm install; fi
  fi
"

# Dev server hot-reloads off the watched filetree. Tell the user:
echo "[ok] pushed. refresh https://$URL on your phone."
```

That's the whole iterate path. No re-create, no re-expose, no re-install (unless deps actually changed).

## Detect the dev command + port

Match the env's startup to whatever the user runs locally - same framework, same flags, same port. Inspect the project:

```bash
jq -r '.scripts.dev // .scripts.start // empty' package.json
grep -E 'runserver|uvicorn|flask run' Procfile manage.py 2>/dev/null
```

Common defaults:

| Framework  | Command                                        | Port |
|------------|------------------------------------------------|------|
| Next.js    | `npm run dev -- --hostname 0.0.0.0 -p 3000`    | 3000 |
| Vite       | `vite --host 0.0.0.0 --port 5173`              | 5173 |
| Remix      | `remix dev`                                    | 3000 |
| Nuxt       | `nuxt dev --host 0.0.0.0`                      | 3000 |
| SvelteKit  | `vite dev --host 0.0.0.0`                      | 5173 |
| Django     | `python manage.py runserver 0.0.0.0:8000`      | 8000 |
| Rails      | `bin/rails server -b 0.0.0.0`                  | 3000 |
| FastAPI    | `uvicorn main:app --host 0.0.0.0 --port 8000`  | 8000 |

**Always bind to `0.0.0.0`**. The Ingress can't reach `127.0.0.1`-bound servers.

If the project has a non-standard runner (custom Make target, Procfile entry, weird CLI), **ask the user** what they normally type. Don't guess.

## Environment variables and secrets

The env starts clean. If the local dev server depends on `.env.local`, two options:

1. Push a sanitized copy (prod tokens stripped) on a non-tracked branch, or rsync via SSH.
2. Have the user maintain a Prevu-only `.env` they keep in sync.

**Never commit `.env`** to git. If you hit a missing-var error during the first start, ask the user how to provide it.

## Database and other infra

The env is a single VM. No DB / Redis / Kafka by default. Project-by-project:

- Use a hosted DB (Supabase, Neon, Planetscale) - same connection string as local.
- Use Docker Compose inside the env when the project already has it.
- Install one-off local services inside the env only when the user accepts that they are part of this workspace.
- If local dev uses `docker compose`, install Docker once and `docker compose up -d` as part of Phase 1.

## What to tell the user (mobile-friendly messages)

After Phase 1:

> mobile Preview: https://my-project-3000.prevu.page
> Tell me what to change - your phone will refresh as I push.

After every iterate-loop push:

> [ok] pushed `add hero animation`. Refresh.

Keep these short. No SSH dumps, no infrastructure tools status. The user is on a phone in chat.

## End of session

When the user accepts / signs off, leave the preview URL, env slug, branch, and service name in the summary. **Don't destroy** unless explicitly asked. Same env tomorrow = warm cache, no re-clone, faster preview.

## Pitfalls

- **Edit-on-env without committing back**: avoid Pattern 2 (heredoc edits via SSH) unless the user is fully phone-only AND aware the env is the source of truth for the session. Default to local-first.
- **`git push --force` after dual-editing**: the env's `git reset --hard` will discard. Pull first, or don't dual-edit.
- **Different dev command on env vs local**: confused user. Always run the same command - read the project, don't invent.
- **Wrong port exposed**: Vite chose 3001 because 3000 was taken. Read the dev-server log to confirm what bound, then `unexpose` + `expose` the right port.
- **`destroy` "to clean up"**: the user expected to come back to it. Only destroy on explicit request.

## Failure recovery cheat sheet

| Symptom                                          | Action                                                    |
|--------------------------------------------------|-----------------------------------------------------------|
| `env create` exit 5 (conflict)                   | Slug taken. `env get` to confirm yours; rename if not.    |
| `env wait` exit 8 (timeout)                      | Open `https://app.prevu.cloud/envs/$SLUG`; read events.   |
| Preview URL 502s                                 | Server bound to `127.0.0.1`, crashed, or wrong port. Run `prevu env service logs "$SLUG" web`. |
| `git clone` SSH-auth fails on env                | Repo private. Use HTTPS clone with a PAT, or push a deploy key. |
| OOM on install                                   | Bump profile (destroy + create with `--memory-gi 8`). Confirm with user before destroying. |
| Hot reload doesn't trigger                       | Add `CHOKIDAR_USEPOLLING=1` to the dev command.           |

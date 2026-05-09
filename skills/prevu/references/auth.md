# Auth - `prevu auth`

The CLI authenticates with a personal access token (PAT). Tokens are user-scoped, long-lived until revoked, and minted only from the dashboard.

## Where the token comes from

> https://app.prevu.cloud/keys

Tokens look like `prv_<24 hex>`. They're shown **once**; only a hash is stored server-side. Direct the user to that page if they don't have one. There is **no** programmatic mint API - you can't generate a token for the user.

## Resolution order

1. `--token <pat>` flag (per call)
2. `PREVU_TOKEN` env var
3. `~/.prevu/config.json` (mode 0600), populated by `prevu auth login`

99% of users do `auth login` once. CI uses the env var.

## Subcommands

```bash
prevu auth login                       # interactive: prompt + persist
prevu auth login --with-token "$PAT"   # non-interactive: write the given token
prevu auth logout                      # delete ~/.prevu/config.json
prevu auth whoami                      # show whoever the current token resolves to
```

`login` validates the token by calling `/api/v1/me` before persisting; an invalid token errors without writing anything.

`whoami --format json`:

```jsonc
{
  "data": {
    "id": "u_xxxx",
    "email": "user@example.com",
    "githubLogin": "user",
    "role": "user",
    "plan": "beta"
  }
}
```

## When the agent should run these

- **`prevu auth whoami --format json`** at the start of a session to confirm the user is signed in. Exit 3 = not signed in; surface the dashboard URL.
- **Don't** run `prevu auth login` on the user's behalf - it's interactive (paste a token). Tell them where to get one.
- **`prevu auth logout`** only when explicitly asked.

## Recovering from exit 3 (auth)

Any command can return 3 (token missing / expired / revoked). Don't try to recover automatically - there's no flow to mint a token without the user's browser. Stop and ask:

> Sign in with `prevu auth login`, generating a token at https://app.prevu.cloud/keys.

## Multi-account / multi-Prevu API

No built-in profile switcher. Workarounds when you need to talk to two:

```bash
prevu env list --token "$PAT_A" --api-url https://staging.prevu.example.com
PREVU_TOKEN="$PAT_B" PREVU_API_URL=https://app.prevu.cloud prevu env list
```

Use sparingly. The default - one token in the config file - is correct for almost everyone.

## Security

- Token grants full account access. Treat it like a password - never paste into chat, logs, or commits.
- `whoami` does not echo the token; safe to log.
- Config is `0600` in a `0700` dir on Unix; on Windows the user-profile ACL applies.
- Revocation is immediate via the dashboard.

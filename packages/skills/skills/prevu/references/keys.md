# SSH keys - `prevu keys`

Prevu persists SSH public keys per user. The web dashboard and the CLI read from the same store. You usually don't need this - `env create` auto-discovers `~/.ssh/id_*.pub` - but knowing the model helps when SSH auth fails.

## What's stored

| Field         | Notes                                                         |
|---------------|---------------------------------------------------------------|
| `id`          | Server-assigned, `key_xxxxxxxxxxxx`                           |
| `name`        | Defaults to the comment's hostname half (`qjy@macbook` -> `macbook`) |
| `publicKey`   | Full body, exactly as pasted                                  |
| `fingerprint` | SHA-256 of the base64 keymaterial                             |
| timestamps    | `createdAt`, `lastUsedAt`                                     |

Uniqueness is on `(user, fingerprint)`. **Re-pasting the same key is a no-op**, not a duplicate row.

## list

```bash
prevu keys list                       # human table
prevu keys list --format json         # for jq
```

## Use a saved key in create / expose

```bash
prevu env create my-project --ssh-key-id macbook         # by name
prevu env create my-project --ssh-key-id key_abc123      # or by id
prevu env expose my-project --port 3000 --ssh-key-id macbook
```

The CLI matches `--ssh-key-id` against either id or name; if names collide, prefer the id.

## Adding / deleting

The CLI does **not** include key add/delete subcommands. Keys are added implicitly when you pass a fresh `--ssh-public-key` or `--ssh-key-file` to `env create` / `env expose` - the server saves it on first use, deduped by fingerprint.

To remove keys (or rename them, see last-used timestamps), send the user to the dashboard:

> https://app.prevu.cloud/keys

## When you'd actually need this skill

- The user asks "which keys does Prevu have for me?"
- You want to use `--ssh-key-id` to skip auto-discovery (multi-key user, default isn't right)
- You're debugging SSH auth failures - a stale or wrong key on the server can cause it

## Anti-patterns

- **Don't paste the user's pubkey on every call.** Idempotent, but `--ssh-key-id` is faster and clearer in logs.
- **Don't generate a new key per env.** One key per device is the model.
- **Never store the user's private key anywhere.** Prevu only ever sees public keys; keep it that way.

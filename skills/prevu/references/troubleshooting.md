# Troubleshooting

Concrete failure modes and fixes. Match the symptom in column 1, apply the action in column 3.

## Auth / token

| Exit | Symptom                                              | Action                                                       |
|------|------------------------------------------------------|--------------------------------------------------------------|
| 3    | Any command fails immediately                        | `prevu auth whoami` to confirm. If still 3, the token is gone or revoked - surface https://app.prevu.cloud/keys to the user. |
| -    | `auth login` prompted but token validation failed    | Token typo or expired. Generate a new one and re-paste.      |
| -    | Token works for `whoami` but every other call 401s   | Hosted instance permissions issue; ask the user to re-mint.  |

## Create / lifecycle

| Exit | Symptom                                              | Action                                                       |
|------|------------------------------------------------------|--------------------------------------------------------------|
| 5    | `env create` complains slug already exists           | `env get <slug>`; if it's the user's own -> reuse. If somebody else's -> rename. |
| 5    | "Environment cap reached"                            | User is at 5 active envs. List environments and destroy one only with explicit consent. |
| 8    | `env wait` times out                                 | Open `https://app.prevu.cloud/envs/<slug>`, read events. Common: cloud-init failure, image import slow on first env. |
| -    | Status stuck on `creating` long after VM should be up| The base image is still being prepared. The dashboard event log shows progress. |

## SSH

| Symptom                                              | Cause / fix                                                  |
|------------------------------------------------------|--------------------------------------------------------------|
| `ssh: ... Permission denied (publickey)`             | The pubkey on the env doesn't match your private key. Either re-`expose` with the right `--ssh-key-*`, or destroy + recreate. |
| `ssh: connect to host ...: Connection refused`       | sshd not listening yet. Re-run `prevu env wait`.             |
| Hangs on `Verifying host key...`                     | Use `prevu env ssh --no-strict-host` for first-connect.     |
| `ssh: command not found`                             | OpenSSH client missing. macOS/Linux ship with it; Windows users need WSL or the OpenSSH optional feature. |
| `prevu env ssh` / `env exec` exits != 0 with no output | The remote command itself failed; capture stderr by passing the command after `--` rather than relying on default shell. Prefer `env exec` for one-shots - exit 2 on a missing command is a clearer failure mode than a silent interactive shell. |

## Exposed ports

| Symptom                                              | Cause / fix                                                  |
|------------------------------------------------------|--------------------------------------------------------------|
| Browser shows 502 on the prevu.page URL              | Dev server bound to `127.0.0.1`, not `0.0.0.0`. Restart with the right host flag. |
| Browser shows 502 on TCP-mode endpoint               | Service has no endpoints - the app crashed or isn't on that port. SSH in and check. |
| Cert warning on the URL                              | You used `--mode tcp`. Switch to default HTTPS for browser previews. |
| `expose` returns "LoadBalancer endpoint not yet ready"| Retry in a few seconds. public endpoint allocation can take a few seconds. |

## Sync

| Symptom                                              | Cause / fix                                                  |
|------------------------------------------------------|--------------------------------------------------------------|
| `git pull` on the env says "Authentication failed"   | Cloning over SSH needs deploy keys. Switch to HTTPS clone with a PAT, or push a deploy key. |

## Network

| Symptom                                              | Cause / fix                                                  |
|------------------------------------------------------|--------------------------------------------------------------|
| Exit 7 (server) intermittently                       | 5xx from the Prevu API. Retry once. If persistent, check the user's status page. |
| Exit 8 (timeout) on a fast call                      | Default 30s timeout - slow network. Bump with `PREVU_TIMEOUT_MS=60000`. |
| All commands hang for ~30s then exit 8               | DNS or network egress issue. Verify `curl -sI https://app.prevu.cloud` works from the same shell. |

## API endpoint

| Symptom                                              | Cause / fix                                                  |
|------------------------------------------------------|--------------------------------------------------------------|
| 404 on every API call                                | `PREVU_API_URL` points at the wrong host or missing `/api/v1` mount. |
| `whoami` works but `env list` returns 500            | The API service is not fully upgraded. Ask the Prevu operator to check the service version. |

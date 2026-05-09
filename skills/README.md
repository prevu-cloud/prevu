# Prevu agent skills

This root `skills/` directory mirrors the published `@prevu/skills` package so agent skill registries can import the repository directly from GitHub.

Canonical package source:

- `packages/skills/skills/prevu`
- `packages/skills/skills/prevu-flows`

Install options:

```sh
npm install -D @prevu/skills
npx skills experimental_sync -a claude-code
```

```sh
npx skills add prevu-cloud/prevu -a claude-code
```

# Community execution plan

This plan is intentionally account-safe: prepare and sequence the work first, then publish only from an approved brand or maintainer account.

## Goal

Turn the skill-hub proof points into developer discovery for Prevu's core category:

> Preview environments for coding agents.

## Day 0: publish one primary launch post

Pick one primary surface first so replies are manageable.

Recommended first post:

- Hacker News Show HN if the account is ready.
- Otherwise Reddit in a focused agent or developer-tools community.

Use `launch-posts.md` as the source copy. Keep the title direct:

```text
Show HN: Prevu - preview environments for coding agents
```

Main CTA:

```text
https://github.com/prevu-cloud/prevu
```

Support links to include only when useful:

- Website: https://prevu.cloud
- Live skill listing: https://www.awesomeskills.dev/en/skill/prevu-prevu
- Security scan: https://agentverus.ai/skill/7e66eafe-e613-4e95-913c-9442614377d8

## Day 0: reply window

Reserve 20-30 minutes after publishing. Use `comment-reply-bank.md`, but do not paste replies mechanically. The best first replies should clarify:

- Prevu is not just a staging URL.
- The agent gets a VM-backed preview environment it can operate.
- Humans review a running product before production.
- The skills make the workflow repeatable across coding agents.

## Day 1: targeted community posts

Post to one or two communities only. Avoid cross-posting the same text everywhere.

### Claude Code / Codex communities

Angle:

```text
Agents need a reliable way to hand humans a running preview, not just a diff.
```

CTA:

```text
npm install -g @prevu/cli
npm install -D @prevu/skills
```

### Cursor / AI coding communities

Angle:

```text
Share a WIP UI change with a teammate before production deploys.
```

CTA:

```text
https://github.com/prevu-cloud/prevu/tree/main/skills
```

### DevOps communities

Angle:

```text
Preview environments for agent work, backed by a VM instead of a developer laptop.
```

CTA:

```text
https://prevu.cloud
```

## Day 2: long-form article repost

Publish `technical-article.md` as the base version on Dev.to or Medium. Link back to the blog canonical when possible.

Add these proof points near the end:

- Live on Awesome Skills Directory.
- Indexed on AgentSkills.in.
- Submitted to SkillKit, Skills.re, forAgents.dev, Agent Skill Source, and CLIHunt.
- AgentVerus report is available for the core skill.

## Day 3: visual post

Use `visual-briefs.md` to produce one GIF or screenshot sequence:

1. Agent asks for a preview.
2. Prevu environment starts or is reused.
3. App runs in the VM.
4. Public HTTPS URL is exposed.
5. Human opens the link.

Caption:

```text
The output of an agent change should be a reviewable preview environment.
```

## Day 5: maintainer follow-ups

Use `directory-followups.md` for broken directories. Send at most five follow-ups in one day.

Priority:

1. SkillsMD repository lookup.
2. askill parser failure.
3. AI Skill Market repository lookup.
4. skillz.directory email validator.
5. AgenticSkills queue config.

## Do not automate

- Do not authorize GitHub/Google/Discord/X/Reddit apps from a personal account.
- Do not post comments from a maintainer account without a final read.
- Do not open more directory PRs while GitHub activity should stay quiet.
- Do not use a personal email just to bypass a directory form validator.

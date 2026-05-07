import { test, expect } from "bun:test";
import { spawnSync } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const CLI = ["bun", "src/index.ts"];
const TEST_CONFIG_DIR = mkdtempSync(join(tmpdir(), "prevu-cli-test-"));

function run(args: string[], env: Record<string, string> = {}) {
  return spawnSync(CLI[0], [...CLI.slice(1), ...args], {
    encoding: "utf8",
    env: { ...process.env, NO_COLOR: "1", PREVU_CONFIG_DIR: TEST_CONFIG_DIR, PREVU_TOKEN: "", ...env },
  });
}

test("--version prints something", () => {
  const r = run(["--version"]);
  expect(r.status).toBe(0);
  expect(r.stdout.trim().length).toBeGreaterThan(0);
});

test("--help lists env subcommands", () => {
  const r = run(["--help"]);
  expect(r.status).toBe(0);
  expect(r.stdout).toContain("env list");
  expect(r.stdout).toContain("env urls");
  expect(r.stdout).toContain("auth login");
});

test("unknown command exits with usage error (code 2)", () => {
  const r = run(["nope"]);
  expect(r.status).toBe(2);
});

test("env list without token returns auth error (code 3)", () => {
  const r = run(["env", "list"], { PREVU_TOKEN: "" });
  expect(r.status).toBe(3);
});

test("env list --format json without token returns json error envelope", () => {
  const r = run(["env", "list", "--format", "json"], { PREVU_TOKEN: "" });
  expect(r.status).toBe(3);
  const parsed = JSON.parse(r.stdout);
  expect(parsed.error).toBeDefined();
  expect(parsed.error.type).toBe("auth");
});

test("env create requires a slug positional", () => {
  const r = run(["env", "create"]);
  expect(r.status).toBe(2);
});

test("env exec requires a slug positional", () => {
  const r = run(["env", "exec"]);
  expect(r.status).toBe(2);
});

test("env exec without a command exits with usage error", () => {
  const r = run(["env", "exec", "demo"]);
  expect(r.status).toBe(2);
  expect(r.stderr + r.stdout).toContain("Missing command");
});

test("env exec --format json without command emits json error envelope", () => {
  const r = run(["env", "exec", "demo", "--format", "json"]);
  expect(r.status).toBe(2);
  const parsed = JSON.parse(r.stdout);
  expect(parsed.error?.type).toBe("usage");
});

test("env service start without a command exits with usage error", () => {
  const r = run(["env", "service", "start", "demo", "web"]);
  expect(r.status).toBe(2);
  expect(r.stderr + r.stdout).toContain("Missing service command");
});

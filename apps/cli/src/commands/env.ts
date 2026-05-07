/**
 * Environment commands. All API-mode.
 */
import { spawn } from "node:child_process";
import type { ApiEnvironment, ApiPort, ApiQuota, ApiService } from "../api-client.js";
import { CliError } from "../error.js";
import { emit, renderTable, type IO } from "../output.js";
import { resolvePublicKey } from "../ssh-key.js";
import type { Command } from "../cli.js";

const SSH_USER_DOMAIN = process.env.PREVU_SSH_USER_DOMAIN ?? "prevu.page";
const SSH_GATEWAY_PORT = Number(process.env.PREVU_SSH_GATEWAY_PORT ?? 22);

const list: Command = {
  name: ["env", "list"],
  description: "List your environments.",
  run: async ({ client, io }) => {
    const envs = await client.listEnvironments();
    emit(io, envs.map(envSummary), () => {
      const headers = ["SLUG", "STATUS", "PROFILE", "CREATED"];
      const rows = envs.map((e) => [
        e.slug,
        `${e.status}/${e.computeState ?? "unknown"}`,
        `${e.profile.cpuCores}c/${e.profile.memoryGi}Gi/${e.profile.diskGi}Gi`,
        e.createdAt.slice(0, 19).replace("T", " "),
      ]);
      console.log(renderTable(headers, rows));
    });
  },
};

const get: Command = {
  name: ["env", "get"],
  description: "Show one environment in detail.",
  args: {
    slug: { type: "positional", description: "Environment slug", required: true },
  },
  run: async ({ args, client, io }) => {
    const env = await client.getEnvironment(String(args.slug));
    emit(io, env, () => printEnvDetail(env));
  },
};

const create: Command = {
  name: ["env", "create"],
  description: "Create a new environment.",
  args: {
    slug: { type: "positional", description: "Environment slug", required: true },
    name: { type: "string", description: "Display name (optional)" },
    project: { type: "string", description: "Project label (optional)" },
    cpu: { type: "number", description: "vCPU cores" },
    "memory-gi": { type: "number", description: "Memory GiB" },
    "disk-gi": { type: "number", description: "Disk GiB" },
    "ssh-key-id": { type: "string", description: "Use a saved SSH key by id or name" },
    "ssh-key-file": { type: "string", description: "Path to a public key file (.pub)" },
    "ssh-public-key": { type: "string", description: "Inline public key body" },
  },
  run: async ({ args, client, io }) => {
    const sshPublicKey = await resolvePublicKey(
      {
        sshKeyId: optStr(args, "ssh-key-id"),
        sshKeyFile: optStr(args, "ssh-key-file"),
        sshPublicKey: optStr(args, "ssh-public-key"),
      },
      client,
    );
    const env = await client.createEnvironment({
      slug: String(args.slug),
      name: optStr(args, "name"),
      project: optStr(args, "project"),
      cpu: optNum(args, "cpu"),
      memoryGi: optNum(args, "memory-gi"),
      diskGi: optNum(args, "disk-gi"),
      sshPublicKey,
    });
    emit(io, env, () => {
      console.log(`Created ${env.slug} (status: ${env.status}).`);
      console.log(`Wait for it: prevu env wait ${env.slug}`);
    });
  },
};

const quota: Command = {
  name: ["env", "quota"],
  description: "Show your retained slots, active concurrency, shared compute pool, and disk pool usage.",
  run: async ({ client, io }) => {
    const snapshot = await client.getQuota();
    emit(io, snapshot, () => printQuota(snapshot));
  },
};

const destroy: Command = {
  name: ["env", "destroy"],
  description: "Destroy an environment. Workspace data is lost.",
  args: { slug: { type: "positional", description: "Environment slug", required: true } },
  run: async ({ args, client, io }) => {
    await client.destroyEnvironment(String(args.slug));
    okMessage(io, `Destroyed ${args.slug}.`, { slug: args.slug });
  },
};

const pause: Command = {
  name: ["env", "pause"],
  description: "Pause compute. Storage is preserved.",
  args: { slug: { type: "positional", description: "Environment slug", required: true } },
  run: async ({ args, client, io }) => {
    await client.pauseEnvironment(String(args.slug));
    okMessage(io, `Paused ${args.slug}.`, { slug: args.slug });
  },
};

const resume: Command = {
  name: ["env", "resume"],
  description: "Resume a paused environment.",
  args: { slug: { type: "positional", description: "Environment slug", required: true } },
  run: async ({ args, client, io }) => {
    await client.resumeEnvironment(String(args.slug));
    okMessage(
      io,
      `Resumed ${args.slug}. Run \`prevu env wait ${args.slug}\` to block until SSH is ready.`,
      { slug: args.slug },
    );
  },
};

const wait: Command = {
  name: ["env", "wait"],
  description: "Block until the env is ready (SSH reachable).",
  args: {
    slug: { type: "positional", description: "Environment slug", required: true },
    timeout: { type: "number", description: "Max seconds to wait (default 300)", default: 300 },
    interval: { type: "number", description: "Poll interval seconds (default 3)", default: 3 },
  },
  run: async ({ args, client, io }) => {
    const slug = String(args.slug);
    const timeoutMs = Number(args.timeout) * 1000;
    const intervalMs = Number(args.interval) * 1000;
    const deadline = Date.now() + timeoutMs;
    let last = "";
    while (Date.now() < deadline) {
      const state = await client.refreshState(slug);
      if (state.ready) {
        emit(io, state, () => console.log(`${slug}: ready (${state.message})`));
        return;
      }
      if (io.format === "table" && state.message !== last) {
        console.log(`${slug}: ${state.status} - ${state.message}`);
        last = state.message;
      }
      await sleep(intervalMs);
    }
    throw new CliError({
      type: "timeout",
      message: `Timed out waiting for ${slug} to become ready.`,
      hint: "Increase --timeout or check the dashboard for errors.",
    });
  },
};

const sshCommand: Command = {
  name: ["env", "ssh-command"],
  description: "Print the ssh command for an environment.",
  args: { slug: { type: "positional", description: "Environment slug", required: true } },
  run: async ({ args, io }) => {
    const cmd = sshLineFor(String(args.slug));
    emit(io, { command: cmd }, () => console.log(cmd));
  },
};

const urls: Command = {
  name: ["env", "urls"],
  description: "Show SSH and exposed URLs for an environment.",
  args: { slug: { type: "positional", description: "Environment slug", required: true } },
  run: async ({ args, client, io }) => {
    const env = await client.getEnvironment(String(args.slug));
    const rows = urlRows(env);
    emit(io, { ssh: sshLineFor(env.slug), ports: env.ports ?? [] }, () => {
      console.log(renderTable(["NAME", "URL"], rows));
    });
  },
};

const ssh: Command = {
  name: ["env", "ssh"],
  description: "Open an interactive SSH session. Pass a command after `--` to run non-interactively.",
  args: {
    slug: { type: "positional", description: "Environment slug", required: true },
    "no-strict-host": { type: "boolean", description: "Skip strict-host-key checking" },
  },
  run: async ({ args, rest }) => {
    const slug = String(args.slug);
    const sshArgs = sshArgsFor(slug, !!args["no-strict-host"]);
    if (rest.length > 0) sshArgs.push(...rest);
    await runSsh(sshArgs);
  },
};

const exec: Command = {
  name: ["env", "exec"],
  description: "Run a single command on an environment via SSH (non-interactive).",
  args: {
    slug: { type: "positional", description: "Environment slug", required: true },
    "no-strict-host": { type: "boolean", description: "Skip strict-host-key checking" },
  },
  run: async ({ args, rest }) => {
    if (rest.length === 0) {
      throw new CliError({
        type: "usage",
        message: "Missing command to run.",
        hint: "Example: prevu env exec myenv -- ls -la /workspace",
      });
    }
    const slug = String(args.slug);
    const sshArgs = sshArgsFor(slug, !!args["no-strict-host"]);
    sshArgs.push(...rest);
    await runSsh(sshArgs);
  },
};

const expose: Command = {
  name: ["env", "expose"],
  description: "Expose a port (HTTPS by default).",
  args: {
    slug: { type: "positional", description: "Environment slug", required: true },
    port: { type: "number", description: "Port number (1-65535)", aliases: ["-p"] },
    mode: { type: "string", description: "https|tcp (default https)", default: "https" },
    "ssh-key-id": { type: "string", description: "Saved SSH key id or name" },
    "ssh-key-file": { type: "string", description: "Path to a public key file" },
    "ssh-public-key": { type: "string", description: "Inline public key body" },
  },
  run: async ({ args, client, io }) => {
    if (typeof args.port !== "number") {
      throw new CliError({ type: "usage", message: "--port is required." });
    }
    const mode = String(args.mode);
    if (mode !== "https" && mode !== "tcp") {
      throw new CliError({ type: "usage", message: "--mode must be 'https' or 'tcp'." });
    }
    const sshPublicKey = await resolvePublicKey(
      {
        sshKeyId: optStr(args, "ssh-key-id"),
        sshKeyFile: optStr(args, "ssh-key-file"),
        sshPublicKey: optStr(args, "ssh-public-key"),
      },
      client,
    );
    const port = await client.exposePort({
      slug: String(args.slug),
      port: args.port,
      mode,
      sshPublicKey,
    });
    emit(io, port, () => printPort(port));
  },
};

const unexpose: Command = {
  name: ["env", "unexpose"],
  description: "Remove a port exposure.",
  args: {
    slug: { type: "positional", description: "Environment slug", required: true },
    port: { type: "number", description: "Port number to unexpose", aliases: ["-p"] },
  },
  run: async ({ args, client, io }) => {
    if (typeof args.port !== "number") {
      throw new CliError({ type: "usage", message: "--port is required." });
    }
    await client.unexposePort(String(args.slug), args.port);
    okMessage(io, `Unexposed ${args.slug}:${args.port}.`, { slug: args.slug, port: args.port });
  },
};

const serviceList: Command = {
  name: ["env", "service", "list"],
  description: "List lightweight services in an environment.",
  args: { slug: { type: "positional", description: "Environment slug", required: true } },
  run: async ({ args, client, io }) => {
    const services = await client.listServices(String(args.slug));
    emit(io, services, () => {
      if (services.length === 0) {
        console.log("No services.");
        return;
      }
      console.log(renderTable(
        ["NAME", "STATUS", "PORT", "PID", "COMMAND"],
        services.map((s) => [
          s.name,
          s.status,
          s.port ? String(s.port) : "-",
          s.pid ? String(s.pid) : "-",
          s.command ?? "",
        ]),
      ));
    });
  },
};

const serviceStart: Command = {
  name: ["env", "service", "start"],
  description: "Start a lightweight long-running service.",
  args: {
    slug: { type: "positional", description: "Environment slug", required: true },
    name: { type: "positional", description: "Service name", required: true },
    port: { type: "number", description: "Service port" },
    cwd: { type: "string", description: "Working directory inside the env (default /workspace)" },
  },
  run: async ({ args, rest, client, io }) => {
    if (rest.length === 0) {
      throw new CliError({
        type: "usage",
        message: "Missing service command.",
        hint: "Example: prevu env service start myenv backend --port 3000 -- npm run dev",
      });
    }
    const service = await client.startService({
      slug: String(args.slug),
      name: String(args.name),
      command: shellCommand(rest),
      port: optNum(args, "port"),
      cwd: optStr(args, "cwd"),
    });
    emit(io, service, () => printService(service));
  },
};

const serviceLogs: Command = {
  name: ["env", "service", "logs"],
  description: "Print stdout/stderr for a service.",
  args: {
    slug: { type: "positional", description: "Environment slug", required: true },
    name: { type: "positional", description: "Service name", required: true },
    tail: { type: "number", description: "Lines to print per stream (default 200)", default: 200 },
  },
  run: async ({ args, client, io }) => {
    const logs = await client.serviceLogs(String(args.slug), String(args.name), Number(args.tail));
    emit(io, { logs }, () => process.stdout.write(logs.endsWith("\n") ? logs : `${logs}\n`));
  },
};

const serviceRestart: Command = {
  name: ["env", "service", "restart"],
  description: "Restart a service by its Prevu registry PID.",
  args: {
    slug: { type: "positional", description: "Environment slug", required: true },
    name: { type: "positional", description: "Service name", required: true },
  },
  run: async ({ args, client, io }) => {
    const service = await client.restartService(String(args.slug), String(args.name));
    emit(io, service, () => printService(service));
  },
};

const serviceStop: Command = {
  name: ["env", "service", "stop"],
  description: "Stop a service by its Prevu registry PID.",
  args: {
    slug: { type: "positional", description: "Environment slug", required: true },
    name: { type: "positional", description: "Service name", required: true },
  },
  run: async ({ args, client, io }) => {
    const service = await client.stopService(String(args.slug), String(args.name));
    emit(io, service, () => printService(service));
  },
};

export const ENV_COMMANDS: Command[] = [
  list,
  get,
  create,
  quota,
  destroy,
  pause,
  resume,
  wait,
  sshCommand,
  urls,
  ssh,
  exec,
  expose,
  unexpose,
  serviceList,
  serviceStart,
  serviceLogs,
  serviceRestart,
  serviceStop,
];

// -- helpers ------------------------------------------------------

function envSummary(env: ApiEnvironment) {
  return {
    slug: env.slug,
    status: env.status,
    computeState: env.computeState,
    profile: env.profile,
    createdAt: env.createdAt,
    lastActiveAt: env.lastActiveAt,
  };
}

function printEnvDetail(env: ApiEnvironment): void {
  console.log(`slug:        ${env.slug}`);
  console.log(`name:        ${env.name}`);
  console.log(`status:      ${env.status}`);
  console.log(`compute:     ${env.computeState ?? "unknown"}`);
  console.log(`profile:     ${env.profile.cpuCores}c / ${env.profile.memoryGi} GiB / ${env.profile.diskGi} GiB`);
  console.log(`namespace:   ${env.namespace}`);
  console.log(`created:     ${env.createdAt}`);
  console.log(`last_active: ${env.lastActiveAt}`);
  if (env.ports && env.ports.length > 0) {
    console.log(`ports:`);
    for (const p of env.ports) printPort(p, "  ");
  }
}

function printQuota(quota: ApiQuota): void {
  const { entitlement, usage } = quota;
  console.log(`plan:    ${entitlement.planName}`);
  console.log(`slots:   ${usage.retainedEnvironments} / ${entitlement.environmentLimit}`);
  console.log(`active:  ${usage.activeEnvironments} / ${entitlement.activeEnvironmentLimit}`);
  console.log(`compute: ${usage.allocatedCpuCores} / ${entitlement.computePoolCpuCores} vCPU, ${usage.allocatedMemoryGi} / ${entitlement.computePoolMemoryGi} GiB`);
  console.log(`disk:    ${usage.allocatedDiskGi} / ${entitlement.diskPoolGi} GiB`);
}

function printPort(p: ApiPort, indent = ""): void {
  console.log(`${indent}${p.port} -> ${p.url ?? portUrl(p)}`);
}

function printService(service: ApiService): void {
  console.log(`${service.name}: ${service.status}`);
  if (service.port) console.log(`port:    ${service.port}`);
  if (service.pid) console.log(`pid:     ${service.pid}`);
  if (service.cwd) console.log(`cwd:     ${service.cwd}`);
  if (service.command) console.log(`command: ${service.command}`);
}

function sshLineFor(slug: string): string {
  const portArg = SSH_GATEWAY_PORT === 22 ? "" : ` -p ${SSH_GATEWAY_PORT}`;
  return `ssh${portArg} prevu+${slug}@${slug}.${SSH_USER_DOMAIN}`;
}

function runSsh(sshArgs: string[]): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const child = spawn("ssh", sshArgs, { stdio: "inherit" });
    child.on("close", (code) => {
      process.exitCode = code ?? 0;
      resolve();
    });
    child.on("error", (err) => {
      reject(
        new CliError({
          type: "generic",
          message: `Failed to launch ssh: ${err.message}`,
          hint: "Make sure the OpenSSH client is installed and on PATH. On Windows, use WSL or install OpenSSH client.",
        }),
      );
    });
  });
}

function sshArgsFor(slug: string, skipHostCheck: boolean): string[] {
  const args: string[] = [];
  if (SSH_GATEWAY_PORT !== 22) args.push("-p", String(SSH_GATEWAY_PORT));
  if (skipHostCheck) {
    args.push(
      "-o",
      "StrictHostKeyChecking=no",
      "-o",
      "UserKnownHostsFile=/dev/null",
      "-o",
      "LogLevel=ERROR",
    );
  }
  args.push(`prevu+${slug}@${slug}.${SSH_USER_DOMAIN}`);
  return args;
}

function okMessage(io: IO, msg: string, payload: unknown): void {
  emit(io, payload, () => console.log(msg));
}

function optStr(args: Record<string, unknown>, key: string): string | undefined {
  const v = args[key];
  return typeof v === "string" ? v : undefined;
}

function optNum(args: Record<string, unknown>, key: string): number | undefined {
  const v = args[key];
  return typeof v === "number" ? v : undefined;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function shellCommand(parts: string[]): string {
  if (parts.length === 1) return parts[0];
  return parts.map((part) => {
    if (/^[A-Za-z0-9_/:=.,@%+-]+$/.test(part)) return part;
    return `'${part.replace(/'/g, `'\\''`)}'`;
  }).join(" ");
}

function portUrl(p: Pick<ApiPort, "mode" | "host" | "externalPort">): string {
  return p.mode === "https" ? `https://${p.host}/` : `tcp://${p.host}:${p.externalPort}`;
}

function urlRows(env: ApiEnvironment): string[][] {
  const rows = [["ssh", sshLineFor(env.slug)]];
  for (const p of env.ports ?? []) {
    rows.push([String(p.port), p.url ?? portUrl(p)]);
  }
  return rows;
}

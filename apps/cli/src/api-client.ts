/**
 * HTTP client for the Prevu Prevu API API.
 */
import { CliError, fromHttpStatus } from "./error.js";

export const DEFAULT_API_URL = "https://app.prevu.cloud";

export interface ApiPort {
  id: string;
  port: number;
  mode: "https" | "tcp";
  host: string;
  externalPort: number;
  url: string;
  createdAt: string;
}

export interface ApiService {
  name: string;
  command?: string;
  cwd?: string;
  port?: number | null;
  status: string;
  pid?: number | null;
  startedAt?: string;
  updatedAt?: string;
}

export interface ApiEnvironment {
  id: string;
  slug: string;
  ownerId: string;
  name: string;
  project?: string | null;
  namespace: string;
  profile: { cpuCores: number; memoryGi: number; diskGi: number };
  image: { name: string; sourceUrl: string; diskSizeGi: number };
  status: string;
  computeState: string;
  sshHost: string | null;
  sshPort: number | null;
  createdAt: string;
  lastActiveAt: string;
  pausedAt: string | null;
  destroyedAt: string | null;
  ports?: ApiPort[];
}

export interface ApiQuota {
  entitlement: {
    planId: string | null;
    subscriptionId: string | null;
    planName: string;
    environmentLimit: number;
    activeEnvironmentLimit: number;
    computePoolCpuCores: number;
    computePoolMemoryGi: number;
    diskPoolGi: number;
  };
  usage: {
    retainedEnvironments: number;
    activeEnvironments: number;
    allocatedCpuCores: number;
    allocatedMemoryGi: number;
    allocatedDiskGi: number;
  };
}

export interface ApiSshKey {
  id: string;
  name: string;
  publicKey: string;
  fingerprint: string;
  createdAt: string;
  lastUsedAt: string | null;
}

export interface ApiUser {
  id: string;
  name: string | null;
  email: string | null;
  githubLogin: string | null;
  role: "user" | "admin";
  plan: string;
}

export interface RefreshState {
  ready: boolean;
  message: string;
  status: string;
}

export class ApiClient {
  constructor(
    private readonly baseUrl: string,
    private readonly token: string | undefined,
    private readonly userAgent: string,
  ) {}

  static create(args: { apiUrl: string; token?: string; userAgent: string }): ApiClient {
    return new ApiClient(args.apiUrl.replace(/\/$/, ""), args.token, args.userAgent);
  }

  hasToken(): boolean {
    return !!this.token;
  }

  // -- Environments ----------------------------------------------

  async listEnvironments(): Promise<ApiEnvironment[]> {
    const data = await this.request<{ environments: ApiEnvironment[] }>("GET", "/api/v1/environments");
    return data.environments;
  }

  async getQuota(): Promise<ApiQuota> {
    return this.request<ApiQuota>("GET", "/api/v1/quota");
  }

  async getEnvironment(slug: string): Promise<ApiEnvironment> {
    const data = await this.request<{ environment: ApiEnvironment }>(
      "GET",
      `/api/v1/environments/${encodeURIComponent(slug)}`,
    );
    return data.environment;
  }

  async createEnvironment(input: {
    slug: string;
    name?: string;
    project?: string;
    cpu?: number;
    memoryGi?: number;
    diskGi?: number;
    sshPublicKey: string;
  }): Promise<ApiEnvironment> {
    const data = await this.request<{ environment: ApiEnvironment }>(
      "POST",
      "/api/v1/environments",
      input,
    );
    return data.environment;
  }

  async destroyEnvironment(slug: string): Promise<void> {
    await this.request("DELETE", `/api/v1/environments/${encodeURIComponent(slug)}`);
  }

  async pauseEnvironment(slug: string): Promise<void> {
    await this.request("POST", `/api/v1/environments/${encodeURIComponent(slug)}/pause`);
  }

  async resumeEnvironment(slug: string): Promise<void> {
    await this.request("POST", `/api/v1/environments/${encodeURIComponent(slug)}/resume`);
  }

  async refreshState(slug: string): Promise<RefreshState> {
    return this.request("POST", `/api/v1/environments/${encodeURIComponent(slug)}/refresh`);
  }

  async exposePort(input: {
    slug: string;
    port: number;
    mode: "https" | "tcp";
    sshPublicKey: string;
  }): Promise<ApiPort> {
    const data = await this.request<{ port: ApiPort }>(
      "POST",
      `/api/v1/environments/${encodeURIComponent(input.slug)}/ports`,
      { port: input.port, mode: input.mode, sshPublicKey: input.sshPublicKey },
    );
    return data.port;
  }

  async unexposePort(slug: string, port: number): Promise<void> {
    await this.request(
      "DELETE",
      `/api/v1/environments/${encodeURIComponent(slug)}/ports/${port}`,
    );
  }

  async listServices(slug: string): Promise<ApiService[]> {
    const data = await this.request<{ services: ApiService[] }>(
      "GET",
      `/api/v1/environments/${encodeURIComponent(slug)}/services`,
    );
    return data.services;
  }

  async startService(input: {
    slug: string;
    name: string;
    command: string;
    port?: number;
    cwd?: string;
  }): Promise<ApiService> {
    const data = await this.request<{ service: ApiService }>(
      "POST",
      `/api/v1/environments/${encodeURIComponent(input.slug)}/services`,
      {
        name: input.name,
        command: input.command,
        port: input.port,
        cwd: input.cwd,
      },
    );
    return data.service;
  }

  async serviceLogs(slug: string, name: string, tail?: number): Promise<string> {
    const query = tail ? `?tail=${encodeURIComponent(String(tail))}` : "";
    return this.requestText(
      "GET",
      `/api/v1/environments/${encodeURIComponent(slug)}/services/${encodeURIComponent(name)}/logs${query}`,
    );
  }

  async restartService(slug: string, name: string): Promise<ApiService> {
    const data = await this.request<{ service: ApiService }>(
      "POST",
      `/api/v1/environments/${encodeURIComponent(slug)}/services/${encodeURIComponent(name)}/restart`,
    );
    return data.service;
  }

  async stopService(slug: string, name: string): Promise<ApiService> {
    const data = await this.request<{ service: ApiService }>(
      "DELETE",
      `/api/v1/environments/${encodeURIComponent(slug)}/services/${encodeURIComponent(name)}`,
    );
    return data.service;
  }

  // -- Keys ------------------------------------------------------

  async listSshKeys(): Promise<ApiSshKey[]> {
    const data = await this.request<{ keys: ApiSshKey[] }>("GET", "/api/v1/keys");
    return data.keys;
  }

  // -- Self ------------------------------------------------------

  async getMe(): Promise<ApiUser> {
    const data = await this.request<{ user: ApiUser }>("GET", "/api/v1/me");
    return data.user;
  }

  // --------------------------------------------------------------

  private async request<T = unknown>(method: string, path: string, body?: unknown): Promise<T> {
    const { data } = await this.rawRequest(method, path, body);
    return data as T;
  }

  private async requestText(method: string, path: string, body?: unknown): Promise<string> {
    const { text } = await this.rawRequest(method, path, body);
    return text;
  }

  private async rawRequest(method: string, path: string, body?: unknown): Promise<{ data: unknown; text: string }> {
    if (!this.token) {
      throw new CliError({
        type: "auth",
        message: "Not signed in.",
        hint: "Run `prevu auth login`, or set PREVU_TOKEN.",
      });
    }
    const url = this.baseUrl + path;
    const controller = new AbortController();
    const timeoutMs = Number(process.env.PREVU_TIMEOUT_MS ?? 30_000);
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    let response: Response;
    try {
      response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${this.token}`,
          "User-Agent": this.userAgent,
          ...(body !== undefined ? { "content-type": "application/json" } : {}),
        },
        body: body !== undefined ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });
    } catch (error) {
      if ((error as { name?: string }).name === "AbortError") {
        throw new CliError({
          type: "timeout",
          message: `Request timed out after ${timeoutMs}ms: ${method} ${path}`,
        });
      }
      throw new CliError({
        type: "server",
        message: `Network error talking to ${this.baseUrl}: ${(error as Error).message}`,
      });
    } finally {
      clearTimeout(timer);
    }

    const text = await response.text();
    let data: unknown = undefined;
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }
    }

    if (!response.ok) {
      const message = extractError(data) ?? `HTTP ${response.status}`;
      throw fromHttpStatus(response.status, message);
    }
    return { data, text };
  }
}

function extractError(data: unknown): string | undefined {
  if (typeof data === "string") return data;
  if (data && typeof data === "object" && "error" in data) {
    const err = (data as { error: unknown }).error;
    if (typeof err === "string") return err;
    if (err && typeof err === "object") return JSON.stringify(err);
  }
  return undefined;
}

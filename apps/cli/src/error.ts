/**
 * Typed CLI errors with stable exit codes. Agents and CI scripts read
 * the exit code; humans read the message + hint.
 */
export type ErrorType =
  | "generic"
  | "usage"
  | "auth"
  | "not_found"
  | "conflict"
  | "rate_limit"
  | "server"
  | "timeout";

const EXIT_CODES: Record<ErrorType, number> = {
  generic: 1,
  usage: 2,
  auth: 3,
  not_found: 4,
  conflict: 5,
  rate_limit: 6,
  server: 7,
  timeout: 8,
};

export class CliError extends Error {
  public readonly type: ErrorType;
  public readonly hint?: string;
  public readonly exitCode: number;

  constructor(args: { type?: ErrorType; message: string; hint?: string }) {
    super(args.message);
    this.type = args.type ?? "generic";
    this.hint = args.hint;
    this.exitCode = EXIT_CODES[this.type];
  }
}

export function fromHttpStatus(status: number, message: string): CliError {
  if (status === 401 || status === 403) return new CliError({ type: "auth", message });
  if (status === 404) return new CliError({ type: "not_found", message });
  if (status === 409) return new CliError({ type: "conflict", message });
  if (status === 429) return new CliError({ type: "rate_limit", message });
  if (status >= 500) return new CliError({ type: "server", message });
  return new CliError({ type: "generic", message });
}

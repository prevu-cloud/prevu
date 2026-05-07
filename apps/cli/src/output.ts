/**
 * Output rendering: pretty table for humans, JSON envelope for agents.
 *
 * JSON shape: { data?: ..., error?: { type, message, hint? } }. Always
 * one object per invocation, on stdout, regardless of command.
 */
export type Format = "table" | "json";

export interface IO {
  format: Format;
  color: boolean;
}

export function ioFromGlobals(g: { format?: string; noColor?: boolean }): IO {
  const format = g.format === "json" ? "json" : "table";
  const noColorEnv = !!process.env.NO_COLOR;
  const isTty = process.stdout.isTTY;
  const color = !g.noColor && !noColorEnv && isTty && format === "table";
  return { format, color };
}

export function emit(io: IO, data: unknown, render: () => void): void {
  if (io.format === "json") {
    process.stdout.write(JSON.stringify({ data }) + "\n");
    return;
  }
  render();
}

export function emitError(
  io: IO,
  err: { type: string; message: string; hint?: string },
): void {
  if (io.format === "json") {
    process.stdout.write(JSON.stringify({ error: err }) + "\n");
    return;
  }
  const c = makeColors(io);
  process.stderr.write(`${c.red("error:")} ${err.message}\n`);
  if (err.hint) process.stderr.write(`  ${c.dim("hint:")} ${err.hint}\n`);
}

export function makeColors(io: IO) {
  if (!io.color) {
    return {
      red: id,
      green: id,
      yellow: id,
      cyan: id,
      bold: id,
      dim: id,
    };
  }
  return {
    red: (s: string) => `\x1b[31m${s}\x1b[0m`,
    green: (s: string) => `\x1b[32m${s}\x1b[0m`,
    yellow: (s: string) => `\x1b[33m${s}\x1b[0m`,
    cyan: (s: string) => `\x1b[36m${s}\x1b[0m`,
    bold: (s: string) => `\x1b[1m${s}\x1b[0m`,
    dim: (s: string) => `\x1b[2m${s}\x1b[0m`,
  };
}

const id = (s: string) => s;

/** Render rows as an aligned plain-text table. */
export function renderTable(headers: string[], rows: string[][]): string {
  const widths = headers.map((h, i) =>
    Math.max(h.length, ...rows.map((r) => (r[i] ?? "").length)),
  );
  const fmtRow = (cells: string[]) =>
    cells.map((c, i) => c.padEnd(widths[i])).join("  ").trimEnd();
  const lines = [fmtRow(headers), fmtRow(widths.map((w) => "-".repeat(w)))];
  for (const row of rows) lines.push(fmtRow(row));
  return lines.join("\n");
}

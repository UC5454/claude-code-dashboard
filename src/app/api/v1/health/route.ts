import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { NextResponse } from "next/server";

function getLogDir() {
  return process.env.LOG_DIR?.replace(/^~(?=\/)/, os.homedir()) ?? `${os.homedir()}/.claude-code-dashboard/logs`;
}

function dirStats(dir: string): { bytes: number; events: number; files: number } {
  if (!fs.existsSync(dir)) return { bytes: 0, events: 0, files: 0 };

  const files = fs.readdirSync(dir).filter((name) => name.endsWith(".jsonl"));
  let bytes = 0;
  let events = 0;

  for (const file of files) {
    const filePath = path.join(dir, file);
    const content = fs.readFileSync(filePath, "utf8");
    bytes += Buffer.byteLength(content, "utf8");
    events += content.split(/\r?\n/).filter(Boolean).length;
  }

  return { bytes, events, files: files.length };
}

export async function GET(): Promise<NextResponse> {
  const logDir = getLogDir();
  const stats = dirStats(logDir);
  return NextResponse.json({ status: "ok", logDir, ...stats, timestamp: new Date().toISOString() });
}

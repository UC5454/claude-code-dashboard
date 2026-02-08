import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";
import type { BaseEvent } from "@/types";

export async function parseJSONL(filePath: string): Promise<BaseEvent[]> {
  if (!fs.existsSync(filePath)) return [];

  const events: BaseEvent[] = [];
  const stream = fs.createReadStream(filePath, { encoding: "utf8" });
  const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });

  let lineNo = 0;
  for await (const line of rl) {
    lineNo += 1;
    if (!line.trim()) continue;

    try {
      const parsed = JSON.parse(line) as BaseEvent;
      if (parsed.event && parsed.ts) {
        events.push(parsed);
      }
    } catch {
      console.error(`[parser] invalid JSONL line skipped: ${filePath}:${lineNo}`);
    }
  }

  return events;
}

export function filterByDateRange(events: BaseEvent[], start: Date, end: Date): BaseEvent[] {
  const startMs = start.getTime();
  const endMs = end.getTime();

  return events.filter((event) => {
    const ts = new Date(event.ts).getTime();
    return Number.isFinite(ts) && ts >= startMs && ts <= endMs;
  });
}

export function filterByUser(events: BaseEvent[], uid: string): BaseEvent[] {
  return events.filter((event) => event.uid === uid);
}

export function filterByEventType(events: BaseEvent[], eventType: string): BaseEvent[] {
  return events.filter((event) => event.event === eventType);
}

function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export async function loadEvents(logDir: string, startDate: Date, endDate: Date): Promise<BaseEvent[]> {
  const events: BaseEvent[] = [];
  const cursor = new Date(Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), startDate.getUTCDate()));
  const end = new Date(Date.UTC(endDate.getUTCFullYear(), endDate.getUTCMonth(), endDate.getUTCDate()));

  while (cursor <= end) {
    const filePath = path.join(logDir, `${toDateKey(cursor)}.jsonl`);
    if (fs.existsSync(filePath)) {
      events.push(...(await parseJSONL(filePath)));
    }
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return filterByDateRange(events, startDate, endDate);
}

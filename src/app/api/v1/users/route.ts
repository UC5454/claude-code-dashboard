import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { aggregateByUser } from "@/lib/aggregator";
import { loadEvents } from "@/lib/parser";
import { fetchUserProfiles } from "@/lib/supabase";
import type { UserSummary } from "@/types";

const SORTABLE = new Set(["skill", "subagent", "mcp", "command", "message", "total", "lastActive", "name"]);

function getLogDir() {
  return process.env.LOG_DIR?.replace(/^~(?=\/)/, os.homedir()) ?? `${os.homedir()}/.claude-code-dashboard/logs`;
}

function parseRange(request: NextRequest) {
  const startRaw = request.nextUrl.searchParams.get("start");
  const endRaw = request.nextUrl.searchParams.get("end");

  const end = endRaw ? new Date(endRaw) : new Date();
  const start = startRaw ? new Date(startRaw) : new Date(Date.now() - 6 * 86400000);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) {
    return null;
  }
  return { start, end };
}

async function resolveName(uid: string): Promise<string> {
  if (process.env.VERCEL) {
    const profiles = await fetchUserProfiles();
    return profiles[uid] ?? uid;
  }

  const profilePath = path.join(os.homedir(), ".claude-code-dashboard", "user-profile.json");
  if (!fs.existsSync(profilePath)) return uid;
  try {
    const profile = JSON.parse(fs.readFileSync(profilePath, "utf8")) as { uid?: string; git_name?: string };
    if (profile.uid === uid && profile.git_name) return profile.git_name;
  } catch {
    return uid;
  }
  return uid;
}

export async function GET(request: NextRequest): Promise<NextResponse<UserSummary[] | { error: string }>> {
  const range = parseRange(request);
  if (!range) return NextResponse.json({ error: "invalid start/end" }, { status: 400 });

  const sortBy = request.nextUrl.searchParams.get("sort_by") ?? "total";
  const sortOrder = request.nextUrl.searchParams.get("sort_order") ?? "desc";

  if (!SORTABLE.has(sortBy) || !["asc", "desc"].includes(sortOrder)) {
    return NextResponse.json({ error: "invalid sort parameters" }, { status: 400 });
  }

  const events = await loadEvents(getLogDir(), range.start, range.end);
  const users = await Promise.all(
    aggregateByUser(events).map(async (user) => ({ ...user, name: await resolveName(user.uid) })),
  );

  users.sort((a, b) => {
    const dir = sortOrder === "asc" ? 1 : -1;
    const av = a[sortBy as keyof UserSummary];
    const bv = b[sortBy as keyof UserSummary];
    if (typeof av === "number" && typeof bv === "number") return (av - bv) * dir;
    return String(av).localeCompare(String(bv)) * dir;
  });

  return NextResponse.json(users);
}

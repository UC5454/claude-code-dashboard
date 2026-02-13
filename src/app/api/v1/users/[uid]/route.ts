import os from "node:os";
import { NextRequest, NextResponse } from "next/server";
import { aggregateUserDetail } from "@/lib/aggregator";
import { loadEvents } from "@/lib/parser";
import { fetchUserProfiles, resolveUserName } from "@/lib/supabase";
import type { UserDetail } from "@/types";

function getLogDir() {
  return process.env.LOG_DIR?.replace(/^~(?=\/)/, os.homedir()) ?? `${os.homedir()}/.claude-code-dashboard/logs`;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ uid: string }> },
): Promise<NextResponse<UserDetail | { error: string }>> {
  const { uid } = await params;

  const startRaw = request.nextUrl.searchParams.get("start");
  const endRaw = request.nextUrl.searchParams.get("end");
  const end = endRaw ? new Date(endRaw) : new Date();
  const start = startRaw ? new Date(startRaw) : new Date(Date.now() - 6 * 86400000);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) {
    return NextResponse.json({ error: "invalid start/end" }, { status: 400 });
  }

  const events = await loadEvents(getLogDir(), start, end);
  const detail = aggregateUserDetail(events, uid);

  const profiles = await fetchUserProfiles();
  const name = resolveUserName(profiles, uid);

  return NextResponse.json({ ...detail, name });
}

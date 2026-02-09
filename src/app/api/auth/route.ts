import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const token = process.env.DASHBOARD_AUTH_TOKEN;

  if (!token) {
    return NextResponse.json({ error: "Auth not configured" }, { status: 500 });
  }

  const body = (await request.json()) as { token?: string };

  if (!body.token || body.token !== token) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set("dashboard_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete("dashboard_token");
  return response;
}

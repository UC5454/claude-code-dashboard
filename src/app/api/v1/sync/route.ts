import { NextRequest, NextResponse } from "next/server";
import { uploadLogFile } from "@/lib/supabase";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const authHeader = request.headers.get("authorization");
  const expected = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!expected || authHeader !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    const body = (await request.json()) as { date: string; data: string };
    if (!body.date || !body.data) {
      return NextResponse.json({ error: "date and data required" }, { status: 400 });
    }
    const ok = await uploadLogFile(body.date, body.data);
    return NextResponse.json({ ok, date: body.date });
  }

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    const results: { date: string; ok: boolean }[] = [];

    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        const dateKey = key.replace(".jsonl", "");
        const text = await value.text();
        const ok = await uploadLogFile(dateKey, text);
        results.push({ date: dateKey, ok });
      }
    }

    return NextResponse.json({ results });
  }

  return NextResponse.json({ error: "Unsupported content type" }, { status: 400 });
}

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

export const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

const BUCKET = "dashboard-logs";

const fileCache = new Map<string, { text: string; fetchedAt: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000;

export async function fetchLogFile(dateKey: string): Promise<string | null> {
  if (!supabase) return null;

  const cacheKey = `${dateKey}.jsonl`;
  const cached = fileCache.get(cacheKey);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return cached.text;
  }

  const { data, error } = await supabase.storage.from(BUCKET).download(`${dateKey}.jsonl`);
  if (error || !data) return null;

  const text = await data.text();
  fileCache.set(cacheKey, { text, fetchedAt: Date.now() });
  return text;
}

export async function uploadLogFile(dateKey: string, content: string | Buffer): Promise<boolean> {
  if (!supabase) return false;

  const { error } = await supabase.storage.from(BUCKET).upload(`${dateKey}.jsonl`, content, {
    contentType: "application/x-ndjson",
    upsert: true,
  });
  return !error;
}

export async function listLogFiles(): Promise<string[]> {
  if (!supabase) return [];

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .list("", { limit: 200, sortBy: { column: "name", order: "desc" } });

  if (error || !data) return [];
  return data.filter((f) => f.name.endsWith(".jsonl")).map((f) => f.name.replace(".jsonl", ""));
}

let profileCache: { data: Record<string, string>; fetchedAt: number } | null = null;

export async function fetchUserProfiles(): Promise<Record<string, string>> {
  if (profileCache && Date.now() - profileCache.fetchedAt < CACHE_TTL_MS) {
    return profileCache.data;
  }

  if (!supabase) return {};

  const { data, error } = await supabase.storage.from(BUCKET).download("user-profile.json");
  if (error || !data) return {};

  try {
    const text = await data.text();
    const profiles = JSON.parse(text) as Array<{ uid: string; git_name?: string }> | { uid: string; git_name?: string };
    const map: Record<string, string> = {};

    if (Array.isArray(profiles)) {
      for (const p of profiles) {
        if (p.uid && p.git_name) map[p.uid] = p.git_name;
      }
    } else if (profiles.uid && profiles.git_name) {
      map[profiles.uid] = profiles.git_name;
    }

    profileCache = { data: map, fetchedAt: Date.now() };
    return map;
  } catch {
    return {};
  }
}

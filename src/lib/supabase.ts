import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

export const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

const BUCKET = "dashboard-logs";

const fileCache = new Map<string, { text: string; fetchedAt: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000;

// --- Multi-user Storage Layout ---
// {uid}/profile.json     — user profile
// {uid}/{date}.jsonl     — daily log file
// Legacy flat files (no uid prefix) are also supported for backward compatibility

export interface UserProfile {
  uid: string;
  git_name?: string;
  git_email?: string;
  hostname?: string;
  os?: string;
  registered_at?: string;
}

let userListCache: { uids: string[]; fetchedAt: number } | null = null;

export async function listUserDirs(): Promise<string[]> {
  if (userListCache && Date.now() - userListCache.fetchedAt < CACHE_TTL_MS) {
    return userListCache.uids;
  }

  if (!supabase) return [];

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .list("", { limit: 200 });

  if (error || !data) return [];

  // Folders have id=null in Supabase Storage; JSONL files at root are legacy (single-user)
  const uids = data.filter((f) => f.id === null).map((f) => f.name);
  userListCache = { uids, fetchedAt: Date.now() };
  return uids;
}

export async function fetchLogFile(dateKey: string, uid?: string): Promise<string | null> {
  if (!supabase) return null;

  const path = uid ? `${uid}/${dateKey}.jsonl` : `${dateKey}.jsonl`;
  const cached = fileCache.get(path);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return cached.text;
  }

  const { data, error } = await supabase.storage.from(BUCKET).download(path);
  if (error || !data) return null;

  const text = await data.text();
  fileCache.set(path, { text, fetchedAt: Date.now() });
  return text;
}

export async function fetchAllUsersLogFile(dateKey: string): Promise<string[]> {
  const uids = await listUserDirs();
  const texts: string[] = [];

  // Fetch from all user directories + legacy root
  const fetches = [
    ...uids.map((uid) => fetchLogFile(dateKey, uid)),
    fetchLogFile(dateKey), // legacy flat file
  ];
  const results = await Promise.all(fetches);

  for (const text of results) {
    if (text) texts.push(text);
  }

  return texts;
}

export async function uploadLogFile(path: string, content: string | Buffer): Promise<boolean> {
  if (!supabase) return false;

  const { error } = await supabase.storage.from(BUCKET).upload(path, content, {
    contentType: "application/x-ndjson",
    upsert: true,
  });
  return !error;
}

export async function listLogFiles(): Promise<string[]> {
  if (!supabase) return [];

  // List from all user directories
  const uids = await listUserDirs();
  const allDates = new Set<string>();

  const lists = await Promise.all(
    uids.map(async (uid) => {
      const { data } = await supabase!.storage.from(BUCKET).list(uid, { limit: 200 });
      return (data ?? []).filter((f) => f.name.endsWith(".jsonl")).map((f) => f.name.replace(".jsonl", ""));
    }),
  );

  for (const dates of lists) {
    for (const d of dates) allDates.add(d);
  }

  // Also check legacy root files
  const { data: rootData } = await supabase.storage.from(BUCKET).list("", { limit: 200 });
  if (rootData) {
    for (const f of rootData) {
      if (f.name.endsWith(".jsonl")) allDates.add(f.name.replace(".jsonl", ""));
    }
  }

  return [...allDates].sort().reverse();
}

let profileCache: { data: Record<string, UserProfile>; fetchedAt: number } | null = null;

export async function fetchUserProfiles(): Promise<Record<string, UserProfile>> {
  if (profileCache && Date.now() - profileCache.fetchedAt < CACHE_TTL_MS) {
    return profileCache.data;
  }

  if (!supabase) return {};

  const map: Record<string, UserProfile> = {};

  // Fetch from user directories
  const uids = await listUserDirs();
  const fetches = uids.map(async (uid) => {
    const { data, error } = await supabase!.storage.from(BUCKET).download(`${uid}/profile.json`);
    if (error || !data) return null;
    try {
      return JSON.parse(await data.text()) as UserProfile;
    } catch {
      return null;
    }
  });

  // Also try legacy root profile
  fetches.push(
    (async () => {
      const { data, error } = await supabase!.storage.from(BUCKET).download("user-profile.json");
      if (error || !data) return null;
      try {
        return JSON.parse(await data.text()) as UserProfile;
      } catch {
        return null;
      }
    })(),
  );

  const results = await Promise.all(fetches);
  for (const profile of results) {
    if (profile?.uid) {
      map[profile.uid] = profile;
    }
  }

  profileCache = { data: map, fetchedAt: Date.now() };
  return map;
}

export function resolveUserName(profiles: Record<string, UserProfile>, uid: string): string {
  return profiles[uid]?.git_name ?? uid;
}

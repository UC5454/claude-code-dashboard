"use client";

import Header from "@/components/layout/Header";
import UserTable from "@/components/dashboard/UserTable";
import { useUsers } from "@/lib/api";
import { usePeriod } from "@/hooks/usePeriod";
import type { UserRow } from "@/types";

function formatLastActive(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const hours = Math.max(1, Math.floor(diffMs / 3600000));
  return `${hours}時間前`;
}

export default function UsersPage() {
  const { period } = usePeriod("7D");
  const users = useUsers(period, "total", "desc");

  const rows: UserRow[] =
    users.data?.map((user, index) => ({
      rank: index + 1,
      name: user.name,
      lastActive: formatLastActive(user.lastActive),
      skill: user.skill,
      subagent: user.subagent,
      mcp: user.mcp,
      command: user.command,
      message: user.message,
      total: user.total,
    })) ?? [];

  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-[1440px] mx-auto px-6 py-6">
        <UserTable rows={rows} isLoading={users.isLoading} error={users.error?.message} />
      </main>
    </div>
  );
}

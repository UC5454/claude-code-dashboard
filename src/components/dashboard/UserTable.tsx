"use client";

import { useState } from "react";
import {
  ArrowUpDown,
  Trophy,
  Medal,
  ExternalLink,
} from "lucide-react";
import { userData } from "@/lib/mock-data";
import type { UserRow } from "@/types";

type SortKey = keyof Pick<
  UserRow,
  "skill" | "subagent" | "mcp" | "command" | "message" | "total"
>;

export default function UserTable() {
  const [sortKey, setSortKey] = useState<SortKey>("total");
  const [sortAsc, setSortAsc] = useState(false);

  const sorted = [...userData].sort((a, b) =>
    sortAsc ? a[sortKey] - b[sortKey] : b[sortKey] - a[sortKey]
  );

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(false);
    }
  };

  const getMedalIcon = (rank: number) => {
    if (rank === 1)
      return <Trophy className="w-4 h-4 text-yellow-500" />;
    if (rank === 2)
      return <Medal className="w-4 h-4 text-gray-400" />;
    if (rank === 3)
      return <Medal className="w-4 h-4 text-amber-600" />;
    return <span className="text-sm text-gray-400 w-4 text-center">{rank}</span>;
  };

  const columns: { key: SortKey; label: string }[] = [
    { key: "skill", label: "Skill" },
    { key: "subagent", label: "Subagent" },
    { key: "mcp", label: "MCP" },
    { key: "command", label: "Command" },
    { key: "message", label: "Message" },
    { key: "total", label: "合計" },
  ];

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900">
          ユーザー別利用状況
        </h2>
        <a
          href="#"
          className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
        >
          セットアップガイド
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3 w-12">
                順位
              </th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                ユーザー
              </th>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3 cursor-pointer hover:text-gray-700"
                  onClick={() => handleSort(col.key)}
                >
                  <div className="flex items-center justify-end gap-1">
                    {col.label}
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((user, i) => (
              <tr
                key={user.name}
                className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                  i === 0 ? "bg-yellow-50/50" : ""
                }`}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center">
                    {getMedalIcon(user.rank)}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div>
                    <span className="text-sm font-medium text-gray-900">
                      {user.name}
                    </span>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {user.lastActive}
                    </p>
                  </div>
                </td>
                <td className="px-4 py-3 text-right text-sm text-gray-700">
                  {user.skill}
                </td>
                <td className="px-4 py-3 text-right text-sm text-gray-700">
                  {user.subagent}
                </td>
                <td className="px-4 py-3 text-right text-sm text-gray-700">
                  {user.mcp}
                </td>
                <td className="px-4 py-3 text-right text-sm text-gray-700">
                  {user.command}
                </td>
                <td className="px-4 py-3 text-right text-sm text-gray-700">
                  {user.message}
                </td>
                <td className="px-4 py-3 text-right text-sm font-bold text-gray-900">
                  {user.total.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

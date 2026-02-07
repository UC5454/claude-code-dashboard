import Header from "@/components/layout/Header";
import { Users } from "lucide-react";

export default function UsersPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-[1440px] mx-auto px-6 py-6">
        <div className="flex flex-col items-center justify-center py-24">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Users className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">準備中</h2>
          <p className="text-sm text-gray-500 max-w-md text-center">
            ユーザー一覧・個別詳細機能は現在開発中です。
            ユーザーごとの利用パターン、アクティビティ履歴を提供予定です。
          </p>
        </div>
      </main>
    </div>
  );
}

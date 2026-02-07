import Header from "@/components/layout/Header";
import KPICard from "@/components/dashboard/KPICard";
import AIInsights from "@/components/dashboard/AIInsights";
import UserTable from "@/components/dashboard/UserTable";
import { kpiData } from "@/lib/mock-data";

export default function DashboardPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-[1440px] mx-auto px-6 py-6">
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
            Overview
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {kpiData.map((kpi) => (
              <KPICard key={kpi.label} data={kpi} />
            ))}
          </div>
        </section>

        <AIInsights />
        <UserTable />
      </main>
    </div>
  );
}

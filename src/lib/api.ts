"use client";

import { useEffect, useMemo, useState } from "react";
import type {
  InsightsResponse,
  KPISummary,
  Period,
  ToolAnalysis,
  ToolCategory,
  UserDetail,
  UserSummary,
} from "@/types";

interface FetchState<T> {
  data?: T;
  error?: Error;
  isLoading: boolean;
}

function periodToDateRange(period: Period): { start: string; end: string } {
  const end = new Date();
  const start = new Date(end);

  if (period === "1D") start.setUTCDate(end.getUTCDate() - 1);
  if (period === "7D") start.setUTCDate(end.getUTCDate() - 7);
  if (period === "30D") start.setUTCDate(end.getUTCDate() - 30);
  if (period === "All") start.setUTCFullYear(end.getUTCFullYear() - 10);

  return { start: start.toISOString(), end: end.toISOString() };
}

function useFetchJSON<T>(url: string, refreshInterval?: number): FetchState<T> {
  const [state, setState] = useState<FetchState<T>>({ isLoading: true });

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      try {
        if (mounted) setState((prev) => ({ data: prev.data, isLoading: true }));
        const response = await fetch(url, { cache: "no-store" });
        if (!response.ok) {
          throw new Error(`Request failed: ${response.status}`);
        }
        const payload = (await response.json()) as T;
        if (mounted) setState({ data: payload, isLoading: false });
      } catch (error) {
        if (mounted) {
          setState({
            isLoading: false,
            error: error instanceof Error ? error : new Error("Unknown error"),
          });
        }
      }
    };

    void run();

    if (!refreshInterval) {
      return () => {
        mounted = false;
      };
    }

    const id = setInterval(() => {
      void run();
    }, refreshInterval);

    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, [url, refreshInterval]);

  return state;
}

export function useKPIs(period: Period): FetchState<KPISummary> {
  const { start, end } = useMemo(() => periodToDateRange(period), [period]);
  return useFetchJSON<KPISummary>(`/api/v1/kpis?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`);
}

export function useUsers(period: Period, sortBy: string, sortOrder: string): FetchState<UserSummary[]> {
  const { start, end } = useMemo(() => periodToDateRange(period), [period]);
  return useFetchJSON<UserSummary[]>(
    `/api/v1/users?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}&sort_by=${encodeURIComponent(sortBy)}&sort_order=${encodeURIComponent(sortOrder)}`,
  );
}

export function useToolAnalysis(category: ToolCategory, period: Period): FetchState<ToolAnalysis> {
  const { start, end } = useMemo(() => periodToDateRange(period), [period]);
  return useFetchJSON<ToolAnalysis>(
    `/api/v1/tools/${category}?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`,
  );
}

export function useUserDetail(uid: string, period: Period): FetchState<UserDetail> {
  const { start, end } = useMemo(() => periodToDateRange(period), [period]);
  return useFetchJSON<UserDetail>(
    `/api/v1/users/${encodeURIComponent(uid)}?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`,
  );
}

export function useInsights(period: Period): FetchState<InsightsResponse> {
  const { start, end } = useMemo(() => periodToDateRange(period), [period]);
  return useFetchJSON<InsightsResponse>(
    `/api/v1/insights?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`,
    3600000,
  );
}

export interface KPIData {
  label: string;
  value: string;
  change: number;
  changeLabel: string;
  sparkData: number[];
  suffix?: string;
  type?: "default" | "progress";
  progressValue?: number;
  progressTotal?: number;
  progressPercent?: number;
}

export interface InsightCard {
  type: "TREND UP" | "TREND DOWN" | "POWER USER" | "USECASE INSIGHT";
  color: string;
  borderColor: string;
  title: string;
  description: string;
}

export interface UserRow {
  rank: number;
  name: string;
  lastActive: string;
  skill: number;
  subagent: number;
  mcp: number;
  command: number;
  message: number;
  total: number;
}

export interface TrendDataPoint {
  time: string;
  count: number;
}

export interface SkillDistribution {
  name: string;
  value: number;
  color: string;
}

export interface SkillBarData {
  name: string;
  count: number;
}

export type Period = "1D" | "7D" | "30D" | "All";
export type Tab = "dashboard" | "tools" | "tokens" | "users";
export type ToolSubTab = "skill" | "subagent" | "mcp" | "command";
export type TrendSubTab = "total" | "byUser" | "byUsecase";

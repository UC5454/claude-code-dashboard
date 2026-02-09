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
  type: "TREND UP" | "TREND DOWN" | "POWER USER" | "USECASE INSIGHT" | "TREND_UP" | "TREND_DOWN" | "POWER_USER" | "USECASE_INSIGHT";
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

export interface BaseEvent {
  event: string;
  ts: string;
  sid: string;
  uid: string;
  mid: string;
  pmode: string;
  project: string;
  [key: string]: unknown;
}

export type ToolCategory = "skills" | "subagents" | "mcp" | "commands";

export interface KPIBucket {
  current: number;
  previous: number;
  changeRate: number;
  sparkline: number[];
}

export interface KPISummary {
  skills: KPIBucket;
  subagents: KPIBucket;
  mcpCalls: KPIBucket;
  messages: KPIBucket;
  activeUsers: { active: number; total: number; rate: number };
  sessions: KPIBucket;
}

export interface UserSummary {
  uid: string;
  name: string;
  lastActive: string;
  skill: number;
  subagent: number;
  mcp: number;
  command: number;
  message: number;
  total: number;
}

export interface ToolAnalysis {
  category: ToolCategory;
  total: number;
  trend: TrendDataPoint[];
  distribution: SkillDistribution[];
  ranking: SkillBarData[];
}

export interface InsightsResponse {
  generatedAt: string;
  insights: InsightCard[];
  cached: boolean;
}

export type Period = "1D" | "7D" | "30D" | "All";
export type Tab = "dashboard" | "tools" | "tokens" | "users";
export type ToolSubTab = "skill" | "subagent" | "mcp" | "command";
export type TrendSubTab = "total" | "byUser" | "byUsecase";

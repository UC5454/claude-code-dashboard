import type { InsightCard } from "@/types";

interface GeminiInsight {
  type: "TREND_UP" | "TREND_DOWN" | "POWER_USER" | "USECASE_INSIGHT";
  title: string;
  description: string;
  metric?: string;
  change_rate?: number;
}

type GoogleGenerativeAIType = {
  new (apiKey: string): {
    getGenerativeModel: (config: { model: string }) => {
      generateContent: (prompt: string) => Promise<{ response: { text: () => string } }>;
    };
  };
};

const typeToStyle: Record<GeminiInsight["type"], { type: InsightCard["type"]; color: string; borderColor: string }> = {
  TREND_UP: { type: "TREND UP", color: "text-emerald-700", borderColor: "border-l-emerald-500" },
  TREND_DOWN: { type: "TREND DOWN", color: "text-red-700", borderColor: "border-l-red-500" },
  POWER_USER: { type: "POWER USER", color: "text-orange-700", borderColor: "border-l-orange-500" },
  USECASE_INSIGHT: { type: "USECASE INSIGHT", color: "text-blue-700", borderColor: "border-l-blue-500" },
};

function buildPrompt(aggregatedData: object): string {
  return `以下のClaude Code利用データを分析し、5つのインサイトをJSON形式で返してください。

インサイトの種類:
- TREND_UP: 増加トレンド（メトリクス名、変化率%、理由）
- TREND_DOWN: 減少トレンド（同上）
- POWER_USER: ヘビーユーザーの特定
- USECASE_INSIGHT: 主要なユースケースパターン

出力形式:
[
  { "type": "TREND_UP", "title": "タイトル", "description": "詳細", "metric": "メトリクス名", "change_rate": 数値 }
]

データ:
${JSON.stringify(aggregatedData, null, 2)}`;
}

function extractJSONArray(text: string): string {
  const start = text.indexOf("[");
  const end = text.lastIndexOf("]");
  if (start === -1 || end === -1 || end <= start) throw new Error("Gemini response did not contain JSON array");
  return text.slice(start, end + 1);
}

function toInsightCards(parsed: GeminiInsight[], maxCount: number): InsightCard[] {
  return parsed.slice(0, maxCount).map((item) => {
    const style = typeToStyle[item.type] ?? typeToStyle.USECASE_INSIGHT;
    return {
      type: style.type,
      color: style.color,
      borderColor: style.borderColor,
      title: item.title,
      description: item.description,
    };
  });
}

async function generateViaSdk(apiKey: string, prompt: string): Promise<string> {
  const importer = new Function("m", "return import(m)") as (m: string) => Promise<unknown>;
  const mod = (await importer("@google/generative-ai")) as { GoogleGenerativeAI: GoogleGenerativeAIType };
  const genAI = new mod.GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  const result = await model.generateContent(prompt);
  return result.response.text();
}

async function generateViaRest(apiKey: string, prompt: string): Promise<string> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json", temperature: 0.3 },
      }),
    },
  );

  if (!response.ok) throw new Error(`Gemini API error: ${response.status}`);
  const payload = (await response.json()) as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
  const text = payload.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Gemini response text is empty");
  return text;
}

function buildUserPrompt(userData: object): string {
  return `以下のユーザー個別のClaude Code利用データを分析し、3つのインサイトをJSON形式で返してください。

インサイトの種類:
- TREND_UP: 利用が増加しているツール・機能
- TREND_DOWN: 利用が減少しているツール・機能
- USECASE_INSIGHT: このユーザー固有の利用パターン・改善提案

出力形式:
[
  { "type": "TREND_UP", "title": "タイトル", "description": "詳細説明（改善提案を含む）" }
]

ユーザーデータ:
${JSON.stringify(userData, null, 2)}`;
}

export async function generateUserInsights(userData: object, maxCount: number): Promise<InsightCard[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set");

  const prompt = buildUserPrompt(userData);

  let rawText = "";
  try {
    rawText = await generateViaSdk(apiKey, prompt);
  } catch {
    rawText = await generateViaRest(apiKey, prompt);
  }

  const parsed = JSON.parse(extractJSONArray(rawText)) as GeminiInsight[];
  return toInsightCards(parsed, maxCount);
}

export async function generateInsights(aggregatedData: object, maxCount: number): Promise<InsightCard[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set");

  const prompt = buildPrompt(aggregatedData);

  let rawText = "";
  try {
    rawText = await generateViaSdk(apiKey, prompt);
  } catch {
    rawText = await generateViaRest(apiKey, prompt);
  }

  const parsed = JSON.parse(extractJSONArray(rawText)) as GeminiInsight[];
  return toInsightCards(parsed, maxCount);
}

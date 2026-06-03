import fs from "fs";
import path from "path";

// NOTE: /tmp is ephemeral in serverless — counts reset per cold start and are
// not shared across multiple Vercel function instances. Good enough for a demo;
// swap for Vercel KV or Redis for production accuracy.
const STORE_PATH = path.join("/tmp", "salon-usage.json");

interface UsageData {
  daily: Record<string, number>;   // "2026-06-03" → count
  monthly: Record<string, number>; // "2026-06"    → count
  rateLimitHits: number;
  errors: number;
  lastUpdated: string;
}

function empty(): UsageData {
  return { daily: {}, monthly: {}, rateLimitHits: 0, errors: 0, lastUpdated: new Date().toISOString() };
}

function read(): UsageData {
  try {
    if (!fs.existsSync(STORE_PATH)) return empty();
    return JSON.parse(fs.readFileSync(STORE_PATH, "utf-8")) as UsageData;
  } catch {
    return empty();
  }
}

function write(data: UsageData): void {
  try {
    data.lastUpdated = new Date().toISOString();
    fs.writeFileSync(STORE_PATH, JSON.stringify(data), "utf-8");
  } catch (err) {
    console.error("[usage-store] write failed:", err);
  }
}

function todayKey() { return new Date().toISOString().slice(0, 10); }
function monthKey() { return new Date().toISOString().slice(0, 7); }

export function checkAndIncrementUsage(): { allowed: boolean; reason?: string } {
  const dailyCap   = parseInt(process.env.DAILY_CONVERSATION_CAP   ?? "500",  10);
  const monthlyCap = parseInt(process.env.MONTHLY_CONVERSATION_CAP ?? "8000", 10);

  const data = read();
  const today = todayKey();
  const month = monthKey();
  const dailyCount   = data.daily[today]   ?? 0;
  const monthlyCount = data.monthly[month] ?? 0;

  if (dailyCount   >= dailyCap)   return { allowed: false, reason: "daily_cap"   };
  if (monthlyCount >= monthlyCap) return { allowed: false, reason: "monthly_cap" };

  data.daily[today]   = dailyCount   + 1;
  data.monthly[month] = monthlyCount + 1;
  write(data);
  return { allowed: true };
}

export function incrementRateLimitHits(): void {
  const data = read();
  data.rateLimitHits = (data.rateLimitHits ?? 0) + 1;
  write(data);
}

export function incrementErrors(): void {
  const data = read();
  data.errors = (data.errors ?? 0) + 1;
  write(data);
}

export function getUsageStats() {
  const data = read();
  return {
    todayCount:    data.daily[todayKey()]   ?? 0,
    monthCount:    data.monthly[monthKey()] ?? 0,
    rateLimitHits: data.rateLimitHits       ?? 0,
    errors:        data.errors              ?? 0,
    lastUpdated:   data.lastUpdated,
    caps: {
      daily:   parseInt(process.env.DAILY_CONVERSATION_CAP   ?? "500",  10),
      monthly: parseInt(process.env.MONTHLY_CONVERSATION_CAP ?? "8000", 10),
    },
  };
}

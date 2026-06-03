import { getUsageStats } from "@/lib/usageStore";

export async function GET(request: Request) {
  const adminSecret = process.env.ADMIN_SECRET;

  if (!adminSecret) {
    console.error("[admin] ADMIN_SECRET env var is not set");
    return new Response(JSON.stringify({ error: "Admin access not configured" }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }

  const authHeader = request.headers.get("authorization") ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

  if (token !== adminSecret) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json", "WWW-Authenticate": 'Bearer realm="admin"' },
    });
  }

  const stats = getUsageStats();

  return new Response(
    JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        today: {
          conversations: stats.todayCount,
          cap: stats.caps.daily,
          remainingToday: Math.max(0, stats.caps.daily - stats.todayCount),
        },
        thisMonth: {
          conversations: stats.monthCount,
          cap: stats.caps.monthly,
          remainingThisMonth: Math.max(0, stats.caps.monthly - stats.monthCount),
        },
        rateLimitHits: stats.rateLimitHits,
        errors: stats.errors,
        lastUpdated: stats.lastUpdated,
      },
      null,
      2
    ),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}

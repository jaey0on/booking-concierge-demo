interface Window {
  count: number;
  resetAt: number;
}

interface IpRecord {
  minute: Window;
  hour: Window;
  day: Window;
}

// In-memory store — resets on cold start, not shared across instances.
const store = new Map<string, IpRecord>();
let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < 5 * 60_000) return;
  lastCleanup = now;
  for (const [ip, record] of store) {
    if (record.day.resetAt < now) store.delete(ip);
  }
}

function getOrCreate(ip: string): IpRecord {
  cleanup();
  const now = Date.now();
  let record = store.get(ip);
  if (!record) {
    record = {
      minute: { count: 0, resetAt: now + 60_000       },
      hour:   { count: 0, resetAt: now + 3_600_000    },
      day:    { count: 0, resetAt: now + 86_400_000   },
    };
    store.set(ip, record);
  }
  if (record.minute.resetAt < now) record.minute = { count: 0, resetAt: now + 60_000    };
  if (record.hour.resetAt   < now) record.hour   = { count: 0, resetAt: now + 3_600_000 };
  if (record.day.resetAt    < now) record.day    = { count: 0, resetAt: now + 86_400_000};
  return record;
}

export function checkRateLimit(ip: string): { allowed: boolean; reason?: string; retryAfter?: number } {
  const record = getOrCreate(ip);
  const now    = Date.now();

  if (record.minute.count >= 10)  return { allowed: false, reason: "per_minute", retryAfter: Math.ceil((record.minute.resetAt - now) / 1000) };
  if (record.hour.count   >= 50)  return { allowed: false, reason: "per_hour",   retryAfter: Math.ceil((record.hour.resetAt   - now) / 1000) };
  if (record.day.count    >= 100) return { allowed: false, reason: "per_day",    retryAfter: Math.ceil((record.day.resetAt    - now) / 1000) };

  record.minute.count++;
  record.hour.count++;
  record.day.count++;
  return { allowed: true };
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

import { createHash } from "crypto";

function getAllowedOrigins(): string[] {
  const localPorts = [3000, 3001, 3002, 3003, 3004].map(
    (p) => `http://localhost:${p}`
  );
  const extra = (process.env.ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);
  return [...localPorts, ...extra];
}

/** Returns false if the Origin header is present but not in the allowlist. */
export function isOriginAllowed(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true; // same-origin browser requests often omit Origin
  return getAllowedOrigins().includes(origin);
}

/** Rejects requests with no User-Agent (likely raw curl/bots without one). */
export function hasValidUserAgent(request: Request): boolean {
  const ua = request.headers.get("user-agent");
  return typeof ua === "string" && ua.trim().length > 0;
}

/** One-way hash of an IP for privacy-safe logging. */
export function hashIp(ip: string): string {
  const salt = process.env.IP_HASH_SALT ?? "atelier-salon-demo";
  return createHash("sha256").update(ip + salt).digest("hex").slice(0, 12);
}

/** Scrub the API key from any string before logging it. */
export function redactSecrets(message: string): string {
  const key = process.env.ANTHROPIC_API_KEY;
  if (key) message = message.replace(new RegExp(key, "g"), "[REDACTED]");
  const admin = process.env.ADMIN_SECRET;
  if (admin) message = message.replace(new RegExp(admin, "g"), "[REDACTED]");
  return message;
}

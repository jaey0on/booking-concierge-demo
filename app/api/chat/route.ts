import Anthropic from "@anthropic-ai/sdk";
import { buildSystemPrompt } from "@/lib/systemPrompt";
import { checkRateLimit, getClientIp } from "@/lib/rateLimiter";
import { checkAndIncrementUsage, incrementRateLimitHits, incrementErrors } from "@/lib/usageStore";
import { validateRequestBody, sanitizeInput, detectInjection } from "@/lib/inputValidator";
import { isOriginAllowed, hasValidUserAgent, hashIp, redactSecrets } from "@/lib/security";

// Fail loudly at startup if the API key is missing rather than silently crashing on first request.
if (!process.env.ANTHROPIC_API_KEY) {
  throw new Error(
    "[chat] ANTHROPIC_API_KEY is not set. Add it to .env.local and restart the dev server."
  );
}

const client = new Anthropic();

const CANNED_INJECTION_RESPONSE =
  "I'm here to help with salon services and booking — is there anything I can help you with today?";

const CANNED_HIGH_VOLUME_RESPONSE =
  "We're experiencing high volume right now — please call or text us directly.";

function jsonError(status: number, message: string, extra?: Record<string, string>) {
  return new Response(JSON.stringify({ error: message, ...extra }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function streamText(text: string): Response {
  const encoder = new TextEncoder();
  return new Response(
    new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(text));
        controller.close();
      },
    }),
    { headers: { "Content-Type": "text/plain; charset=utf-8" } }
  );
}

export async function POST(request: Request) {
  const ip     = getClientIp(request);
  const ipHash = hashIp(ip);

  // ── 1. CORS ──────────────────────────────────────────────────────────────
  if (!isOriginAllowed(request)) {
    console.error(`[chat] blocked: bad origin ipHash=${ipHash} origin=${request.headers.get("origin")}`);
    return jsonError(403, "Forbidden");
  }

  // ── 2. Bot detection — User-Agent ─────────────────────────────────────
  if (!hasValidUserAgent(request)) {
    console.error(`[chat] blocked: missing user-agent ipHash=${ipHash}`);
    return jsonError(400, "Bad request");
  }

  // ── 3. Per-IP rate limiting ───────────────────────────────────────────
  const rl = checkRateLimit(ip);
  if (!rl.allowed) {
    incrementRateLimitHits();
    console.error(`[chat] rate-limited: ipHash=${ipHash} reason=${rl.reason}`);
    return new Response(
      JSON.stringify({ error: "Too many requests — please wait a moment before trying again." }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          ...(rl.retryAfter ? { "Retry-After": String(rl.retryAfter) } : {}),
        },
      }
    );
  }

  // ── 4. Parse JSON ────────────────────────────────────────────────────
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError(400, "Invalid JSON body");
  }

  // ── 5. Validate structure + lengths ──────────────────────────────────
  const validated = validateRequestBody(body);
  if (!validated.valid) {
    return jsonError(validated.status, validated.error);
  }

  const messages = validated.messages;

  // ── 6. Sanitize + injection detection ────────────────────────────────
  // Mutate the last user message in place after sanitizing.
  for (const msg of messages) {
    if (msg.role === "user") {
      msg.content = sanitizeInput(msg.content);
    }
  }

  const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
  if (lastUserMsg && detectInjection(lastUserMsg.content)) {
    console.error(`[chat] injection attempt: ipHash=${ipHash} ts=${new Date().toISOString()}`);
    // Return canned response — don't call the API, don't reveal detection.
    return streamText(CANNED_INJECTION_RESPONSE);
  }

  // ── 7. Global usage caps ─────────────────────────────────────────────
  const usage = checkAndIncrementUsage();
  if (!usage.allowed) {
    console.error(`[chat] usage cap hit: reason=${usage.reason} ipHash=${ipHash}`);
    return streamText(CANNED_HIGH_VOLUME_RESPONSE);
  }

  // ── 8. Stream from Claude ────────────────────────────────────────────
  const readableStream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      try {
        const stream = client.messages.stream({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 1024,
          system: buildSystemPrompt(),
          messages,
        });

        for await (const chunk of stream) {
          if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
            controller.enqueue(encoder.encode(chunk.delta.text));
          }
        }
      } catch (err) {
        incrementErrors();
        // Log real error server-side with secrets redacted — never send to client.
        const raw = err instanceof Error ? `${err.message}\n${err.stack ?? ""}` : String(err);
        console.error(`[chat] API error: ipHash=${ipHash} ts=${new Date().toISOString()} err=${redactSecrets(raw)}`);
        controller.enqueue(encoder.encode("__ERROR__:Something went wrong — please try again."));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readableStream, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

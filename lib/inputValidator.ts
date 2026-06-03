const MAX_MESSAGE_LENGTH = 500;
const MAX_MESSAGES = 20;

// Patterns that indicate prompt injection attempts
const INJECTION_PATTERNS: RegExp[] = [
  /ignore\s+(previous|prior|all|your)\s+instructions/i,
  /disregard\s+(your|previous|all|the)/i,
  /forget\s+(everything|all|your|previous)/i,
  /override\s+(your|the|all)\s*(instructions|rules|prompt)?/i,
  /you\s+are\s+now\s+(a|an|the)/i,
  /pretend\s+(you\s+are|to\s+be|that\s+you)/i,
  /act\s+as\s+(a|an|if\s+you\s+are)/i,
  /new\s+role\s*:/i,
  /system\s*:\s*you\s+are/i,
  /reveal\s+(your\s+)?(system\s+)?prompt/i,
  /show\s+(me\s+)?your\s+(system\s+)?prompt/i,
  /what\s+(are|were)\s+your\s+instructions/i,
  /\bjailbreak\b/i,
  /\bDAN\b/,
  /\bdo\s+anything\s+now\b/i,
];

export function detectInjection(text: string): boolean {
  return INJECTION_PATTERNS.some((p) => p.test(text));
}

/** Strip HTML tags and dangerous URI schemes from user input. */
export function sanitizeInput(text: string): string {
  return text
    .replace(/<[^>]*>/g, "")        // strip HTML tags
    .replace(/javascript\s*:/gi, "") // strip js: URIs
    .replace(/data\s*:/gi, "")      // strip data: URIs
    .trim();
}

type ValidateOk = { valid: true; messages: Array<{ role: "user" | "assistant"; content: string }> };
type ValidateFail = { valid: false; error: string; status: number };

export function validateRequestBody(body: unknown): ValidateOk | ValidateFail {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { valid: false, error: "Invalid request body", status: 400 };
  }

  const { messages } = body as Record<string, unknown>;

  if (!Array.isArray(messages)) {
    return { valid: false, error: "messages must be an array", status: 400 };
  }

  if (messages.length === 0) {
    return { valid: false, error: "messages cannot be empty", status: 400 };
  }

  if (messages.length > MAX_MESSAGES) {
    return { valid: false, error: `Conversation too long (max ${MAX_MESSAGES} messages)`, status: 400 };
  }

  for (const msg of messages) {
    if (!msg || typeof msg !== "object" || Array.isArray(msg)) {
      return { valid: false, error: "Invalid message format", status: 400 };
    }
    const { role, content } = msg as Record<string, unknown>;
    if (typeof role !== "string" || typeof content !== "string") {
      return { valid: false, error: "Each message must have a string role and content", status: 400 };
    }
    if (role !== "user" && role !== "assistant") {
      return { valid: false, error: "Message role must be 'user' or 'assistant'", status: 400 };
    }
    if (content.length > MAX_MESSAGE_LENGTH) {
      return { valid: false, error: `Message too long (max ${MAX_MESSAGE_LENGTH} characters)`, status: 400 };
    }
  }

  return {
    valid: true,
    messages: messages as Array<{ role: "user" | "assistant"; content: string }>,
  };
}

import ServiceCard, { type ServiceCardData } from "./ServiceCard";

interface Message {
  role: "user" | "assistant";
  content: string;
  serviceCard?: ServiceCardData;
}

function parseMessage(content: string): { text: string; serviceCard?: ServiceCardData } {
  const serviceCardRegex = /<service-card>([\s\S]*?)<\/service-card>/;
  const match = content.match(serviceCardRegex);

  if (!match) return { text: content };

  try {
    const serviceCard = JSON.parse(match[1].trim()) as ServiceCardData;
    const text = content.replace(serviceCardRegex, "").trim();
    return { text, serviceCard };
  } catch {
    return { text: content };
  }
}

function renderText(text: string) {
  const lines = text.split("\n").filter((l) => l !== "");
  const elements: React.ReactNode[] = [];
  let listItems: string[] = [];
  let listType: "ol" | "ul" | null = null;

  const flushList = (key: string) => {
    if (!listItems.length) return;
    const Tag = listType!;
    elements.push(
      <Tag
        key={key}
        className={Tag === "ol" ? "list-decimal" : "list-disc"}
        style={{ paddingLeft: "1.4em", margin: "8px 0", display: "flex", flexDirection: "column", gap: "6px" }}
      >
        {listItems.map((item, i) => (
          <li key={i} style={{ lineHeight: "1.5" }}>
            {renderInline(item)}
          </li>
        ))}
      </Tag>
    );
    listItems = [];
    listType = null;
  };

  lines.forEach((line, i) => {
    const numberedMatch = line.match(/^(\d+)\.\s+(.*)/);
    const bulletMatch = line.match(/^[-*]\s+(.*)/);

    if (numberedMatch) {
      if (listType === "ul") flushList(`flush-${i}`);
      listType = "ol";
      listItems.push(numberedMatch[2]);
    } else if (bulletMatch) {
      if (listType === "ol") flushList(`flush-${i}`);
      listType = "ul";
      listItems.push(bulletMatch[1]);
    } else {
      flushList(`flush-${i}`);
      elements.push(
        <p key={i} style={{ margin: "0 0 8px 0", lineHeight: "1.65" }}>
          {renderInline(line)}
        </p>
      );
    }
  });

  flushList("final");
  return elements;
}

function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i} style={{ fontWeight: 600 }}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

export default function ChatMessage({
  message,
  isStreaming,
}: {
  message: Message;
  isStreaming?: boolean;
}) {
  const isUser = message.role === "user";
  const { text, serviceCard } = parseMessage(message.content);

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}>
      <div className={`max-w-[85%] ${isUser ? "" : "w-full"}`}>
        {!isUser && (
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center mb-1.5 text-xs font-bold"
            style={{ backgroundColor: "#1a1a1a", color: "#FAF8F4" }}
          >
            A
          </div>
        )}
        <div
          className="px-4 py-3 rounded-2xl"
          style={
            isUser
              ? {
                  backgroundColor: "#1a1a1a",
                  color: "#FAF8F4",
                  borderBottomRightRadius: "4px",
                  fontSize: "15px",
                  lineHeight: "1.65",
                  fontWeight: 500,
                }
              : {
                  backgroundColor: "#FFFFFF",
                  color: "#1a1a1a",
                  borderBottomLeftRadius: "4px",
                  border: "1px solid #E8E3DA",
                  fontSize: "15px",
                  lineHeight: "1.65",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                }
          }
        >
          {isUser ? (
            text
          ) : (
            <div>
              {renderText(text)}
              {isStreaming && (
                <span
                  className="inline-block w-0.5 h-4 ml-0.5 animate-pulse align-middle"
                  style={{ backgroundColor: "#D4AF37" }}
                />
              )}
            </div>
          )}
          {!isUser && !isStreaming && text === "" && (
            <span
              className="inline-block w-0.5 h-4 animate-pulse align-middle"
              style={{ backgroundColor: "#D4AF37" }}
            />
          )}
        </div>
        {serviceCard && !isStreaming && <ServiceCard data={serviceCard} />}
      </div>
    </div>
  );
}

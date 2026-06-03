"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import ChatMessage from "./ChatMessage";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const INITIAL_MESSAGE: Message = {
  role: "assistant",
  content:
    "Hi! I can help you figure out the perfect service and stylist. What are you thinking about today?",
};

const QUICK_REPLIES = [
  "Haircut",
  "Color/highlights",
  "Not sure yet",
  "Just have a question",
];

interface ChatWidgetProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function ChatWidget({ open, onOpenChange }: ChatWidgetProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = open !== undefined ? open : internalOpen;
  const setIsOpen = (val: boolean) => {
    setInternalOpen(val);
    onOpenChange?.(val);
  };
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [hasUsedQuickReply, setHasUsedQuickReply] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isStreaming) return;

      const userMessage: Message = { role: "user", content: text.trim() };
      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);
      setInput("");
      setIsStreaming(true);

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "" },
      ]);

      abortControllerRef.current = new AbortController();

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: updatedMessages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
          }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.error || `API error ${response.status}`);
        }
        if (!response.body) throw new Error("No response body");

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let accumulated = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          accumulated += chunk;
          if (accumulated.startsWith("__ERROR__:")) {
            throw new Error(accumulated.replace("__ERROR__:", ""));
          }
          setMessages((prev) => {
            const next = [...prev];
            next[next.length - 1] = { role: "assistant", content: accumulated };
            return next;
          });
        }
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
        setMessages((prev) => {
          const next = [...prev];
          next[next.length - 1] = {
            role: "assistant",
            content: "I'm sorry, something went wrong. Please try again.",
          };
          return next;
        });
      } finally {
        setIsStreaming(false);
      }
    },
    [messages, isStreaming]
  );

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleQuickReply = (reply: string) => {
    setHasUsedQuickReply(true);
    sendMessage(reply);
  };

  const showQuickReplies = !hasUsedQuickReply && messages.length === 1 && !isStreaming;

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen(true)}
        aria-label="Open booking concierge"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300"
        style={{
          backgroundColor: "#1a1a1a",
          boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
          display: isOpen ? "none" : "flex",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "#D4AF37";
          e.currentTarget.style.boxShadow = "0 8px 32px rgba(212,175,55,0.4)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "#1a1a1a";
          e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,0,0,0.2)";
        }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path
            d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z"
            fill="#FAF8F4"
          />
        </svg>
      </button>

      {/* Widget */}
      <div
        className="fixed bottom-6 right-6 z-50 w-[420px] max-w-[calc(100vw-24px)] flex flex-col rounded-2xl overflow-hidden"
        style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid #E8E3DA",
          boxShadow: "0 24px 64px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.06)",
          height: "600px",
          maxHeight: "calc(100vh - 48px)",
          transform: isOpen ? "translateY(0) scale(1)" : "translateY(24px) scale(0.95)",
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
          transition: "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease",
          transformOrigin: "bottom right",
        }}
      >
        {/* Top gold line */}
        <div
          className="h-0.5 w-full shrink-0"
          style={{ background: "linear-gradient(90deg, transparent, #D4AF37, transparent)" }}
        />

        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 shrink-0"
          style={{ backgroundColor: "#FAF8F4", borderBottom: "1px solid #E8E3DA" }}
        >
          <div>
            <h3 className="font-serif text-base font-semibold" style={{ color: "#1a1a1a" }}>
              Booking Concierge
            </h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#22c55e" }} />
              <span className="text-xs" style={{ color: "#8a8078" }}>Available now</span>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            aria-label="Close chat"
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-150"
            style={{ color: "#8a8078" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = "#E8E3DA")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = "transparent")}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div
          className="flex-1 overflow-y-auto px-4 py-4"
          style={{ backgroundColor: "#FAF8F4" }}
        >
          {messages.map((message, i) => (
            <ChatMessage
              key={i}
              message={message}
              isStreaming={isStreaming && i === messages.length - 1}
            />
          ))}

          {/* Quick reply chips */}
          {showQuickReplies && (
            <div className="flex flex-wrap gap-2 mt-2 mb-1">
              {QUICK_REPLIES.map((reply) => (
                <button
                  key={reply}
                  onClick={() => handleQuickReply(reply)}
                  className="px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-150"
                  style={{
                    backgroundColor: "transparent",
                    border: "1px solid #1a1a1a",
                    color: "#1a1a1a",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#1a1a1a";
                    e.currentTarget.style.color = "#FAF8F4";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = "#1a1a1a";
                  }}
                >
                  {reply}
                </button>
              ))}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div
          className="px-4 py-3 shrink-0"
          style={{ backgroundColor: "#FFFFFF", borderTop: "1px solid #E8E3DA" }}
        >
          <form onSubmit={handleSubmit} className="flex gap-2 items-center">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything..."
              disabled={isStreaming}
              className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none transition-all duration-150"
              style={{
                backgroundColor: "#FAF8F4",
                border: "1px solid #E8E3DA",
                color: "#1a1a1a",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#D4AF37")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#E8E3DA")}
            />
            <button
              type="submit"
              disabled={!input.trim() || isStreaming}
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-150"
              style={{
                backgroundColor: !input.trim() || isStreaming ? "#E8E3DA" : "#1a1a1a",
                color: !input.trim() || isStreaming ? "#aaa49c" : "#FAF8F4",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </form>
        </div>

        {/* Footer */}
        <div
          className="px-4 py-2 text-center shrink-0"
          style={{ backgroundColor: "#FFFFFF", borderTop: "1px solid #F0EDE6" }}
        >
          <p className="text-xs" style={{ color: "#aaa49c" }}>
            Powered by <span style={{ color: "#B8962E" }}>Modern Gent AI</span>
          </p>
        </div>
      </div>
    </>
  );
}

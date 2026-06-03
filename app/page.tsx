"use client";

import { useState } from "react";
import Hero from "@/components/Hero";
import ChatWidget from "@/components/ChatWidget";

export default function Home() {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <main className="flex flex-col flex-1">
      <Hero onOpenChat={() => setChatOpen(true)} />
      <ChatWidget open={chatOpen} onOpenChange={setChatOpen} />
    </main>
  );
}

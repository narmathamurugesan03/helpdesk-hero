// ============================================================
// Floating Chatbot Assistant — keyword-matching helpdesk bot
// ============================================================
import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Sparkles } from "lucide-react";

interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: Date;
}

const QUICK_ACTIONS = [
  { label: "Create Ticket", query: "How to create a ticket?" },
  { label: "View My Tickets", query: "Check my ticket status" },
  { label: "Contact Agent", query: "Contact support" },
];

const BOT_RESPONSES: { keywords: string[]; response: string }[] = [
  { keywords: ["create", "new ticket", "raise", "submit"], response: "To create a ticket, go to the 'Create Ticket' page from the sidebar or click the '+ New Ticket' button on the dashboard. Fill in the title, description, category, and priority, then submit." },
  { keywords: ["status", "check", "track", "my ticket"], response: "You can check your ticket status by navigating to 'All Tickets' or 'My Tickets' from the sidebar. Each ticket shows its current status — Open, In Progress, or Closed." },
  { keywords: ["contact", "agent", "support", "help", "talk"], response: "You can contact an agent by adding a comment on your ticket. Agents will respond directly in the ticket thread. For urgent issues, mark the priority as 'High'." },
  { keywords: ["password", "reset", "forgot"], response: "For password reset, go to the login page and click 'Forgot Password'. If you're locked out of an internal system, create a ticket under 'Account Access' category." },
  { keywords: ["vpn", "network", "connect", "internet"], response: "For network or VPN issues, create a ticket under the 'Network' category. Include your VPN client version and any error messages you see." },
  { keywords: ["software", "install", "update", "license"], response: "For software-related issues like installations or license problems, create a ticket under 'Software' category. Our team will assist within the SLA window." },
  { keywords: ["hardware", "laptop", "printer", "screen"], response: "For hardware issues, create a ticket under 'Hardware' category. Describe the device model and the specific problem. Attach photos if possible." },
  { keywords: ["hello", "hi", "hey", "good"], response: "Hello! 👋 I'm the Helpdesk Assistant. I can help you with creating tickets, checking status, or answering common IT questions. What do you need?" },
  { keywords: ["thank", "thanks"], response: "You're welcome! If you have any other questions, feel free to ask. 😊" },
];

const DEFAULT_RESPONSE = "I'm not sure I understand. Try asking about creating tickets, checking ticket status, or contacting support. You can also use the quick actions below!";

function getBotReply(input: string): string {
  const lower = input.toLowerCase();
  for (const entry of BOT_RESPONSES) {
    if (entry.keywords.some((kw) => lower.includes(kw))) return entry.response;
  }
  return DEFAULT_RESPONSE;
}

export const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      sender: "bot",
      text: "Hi there! 👋 I'm the Helpdesk Assistant. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    const userMsg: ChatMessage = {
      id: `u${Date.now()}`,
      sender: "user",
      text: text.trim(),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const botMsg: ChatMessage = {
        id: `b${Date.now()}`,
        sender: "bot",
        text: getBotReply(text),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 800 + Math.random() * 600);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const formatTime = (d: Date) =>
    d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:scale-105 transition-transform flex items-center justify-center"
        aria-label="Open chatbot"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>

      {/* Chat panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-2rem)] h-[500px] max-h-[calc(100vh-8rem)] bg-card border border-border rounded-2xl shadow-[var(--shadow-modal)] flex flex-col overflow-hidden animate-fade-in">
          {/* Header */}
          <div className="flex items-center gap-3 px-5 py-4 bg-primary text-primary-foreground flex-shrink-0">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm">Helpdesk Assistant</p>
              <p className="text-xs text-primary-foreground/70">Always online</p>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-1 rounded-lg hover:bg-white/20 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages area */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-muted text-foreground rounded-bl-md"
                  }`}
                >
                  {msg.text}
                  <p className={`text-[10px] mt-1 ${msg.sender === "user" ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                    {formatTime(msg.timestamp)}
                  </p>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-muted px-4 py-3 rounded-2xl rounded-bl-md">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick actions */}
          <div className="px-4 py-2 border-t border-border flex gap-2 flex-wrap flex-shrink-0">
            {QUICK_ACTIONS.map((a) => (
              <button
                key={a.label}
                onClick={() => sendMessage(a.query)}
                className="text-xs px-3 py-1.5 rounded-full border border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground transition-colors font-medium"
              >
                {a.label}
              </button>
            ))}
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="px-4 py-3 border-t border-border flex gap-2 flex-shrink-0">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message…"
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary-dark transition-colors disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

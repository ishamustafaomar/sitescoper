import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { MessageCircle, Send, Loader2, Sparkles, X, RefreshCcw, Bot, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AnalysisResult, ScrapeResult } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";

interface Msg {
  role: "user" | "assistant";
  content: string;
  used_tools?: boolean;
}

interface ChatPanelProps {
  analysis: AnalysisResult;
  scrapeData?: ScrapeResult;
  url: string;
  analysisId?: string;
}

const SUGGESTED_PROMPTS = [
  "What should I fix first?",
  "Rewrite my hero headline",
  "Why is my score so low?",
  "Are you sure I'm missing testimonials? Recheck.",
];

export function ChatPanel({ analysis, scrapeData, url, analysisId }: ChatPanelProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    if (!user) {
      toast({ title: "Sign in to chat", description: "Create a free account to chat with your report." });
      return;
    }
    const userMsg: Msg = { role: "user", content: text };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("chat-with-report", {
        body: {
          messages: next.map((m) => ({ role: m.role, content: m.content })),
          analysis,
          url,
          scrapeMeta: scrapeData?.metadata ?? null,
          detectedSections: (scrapeData as any)?.detectedSections ?? [],
          analysisId,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setMessages((prev) => [...prev, { role: "assistant", content: data?.content ?? "", used_tools: !!data?.used_tools }]);
    } catch (e: any) {
      toast({ title: "Chat error", description: e.message, variant: "destructive" });
      setMessages((prev) => prev.slice(0, -1)); // remove the user message that failed
    } finally {
      setLoading(false);
    }
  };

  const reset = () => setMessages([]);

  return (
    <>
      {/* Floating launcher */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-6 right-6 z-40 gradient-primary p-4 rounded-full shadow-glow hover:scale-105 transition-transform"
            aria-label="Chat with this report"
          >
            <MessageCircle className="h-5 w-5 text-primary-foreground" />
            <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-accent animate-pulse border-2 border-background" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ y: 40, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 260, damping: 26 }}
            className="fixed bottom-4 right-4 left-4 sm:left-auto sm:bottom-6 sm:right-6 sm:w-[420px] h-[min(80vh,640px)] bg-card border border-border rounded-2xl shadow-2xl z-40 flex flex-col overflow-hidden"
            role="dialog"
            aria-label="Chat with report"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-to-r from-primary/5 to-transparent">
              <div className="flex items-center gap-2 min-w-0">
                <div className="gradient-primary p-1.5 rounded-lg shrink-0">
                  <Sparkles className="h-3.5 w-3.5 text-primary-foreground" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-heading font-semibold text-sm">Chat with this report</h3>
                  <p className="text-[10px] text-muted-foreground font-body truncate">Has full context · can re-scan if you push back</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {messages.length > 0 && (
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={reset} title="New chat">
                    <RefreshCcw className="h-3.5 w-3.5" />
                  </Button>
                )}
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setOpen(false)}>
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 && (
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <div className="bg-primary/10 p-1.5 rounded-full mt-0.5">
                      <Bot className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div className="text-xs font-body text-muted-foreground leading-relaxed">
                      I just audited <strong className="text-foreground break-all">{url}</strong>. Ask me anything — what to ship first, why your score is what it is, or push back if I got something wrong.
                    </div>
                  </div>
                  <div className="space-y-1.5 pt-2">
                    {SUGGESTED_PROMPTS.map((p) => (
                      <button
                        key={p}
                        onClick={() => send(p)}
                        className="w-full text-left px-3 py-2 rounded-lg border border-border hover:border-primary/40 hover:bg-primary/5 transition text-xs font-body"
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((m, i) => (
                <div key={i} className={`flex items-start gap-2 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                  <div className={`p-1.5 rounded-full mt-0.5 shrink-0 ${m.role === "user" ? "bg-accent/15" : "bg-primary/10"}`}>
                    {m.role === "user" ? <UserIcon className="h-3.5 w-3.5 text-accent" /> : <Bot className="h-3.5 w-3.5 text-primary" />}
                  </div>
                  <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs font-body leading-relaxed ${
                    m.role === "user"
                      ? "bg-primary text-primary-foreground rounded-tr-sm"
                      : "bg-muted/50 text-foreground rounded-tl-sm"
                  }`}>
                    {m.role === "assistant" ? (
                      <div className="prose prose-xs max-w-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0 prose-strong:text-foreground prose-headings:font-heading prose-headings:text-sm">
                        <ReactMarkdown>{m.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <div className="whitespace-pre-wrap">{m.content}</div>
                    )}
                    {m.used_tools && (
                      <div className="mt-1.5 text-[9px] uppercase tracking-wider opacity-70 flex items-center gap-1">
                        <RefreshCcw className="h-2.5 w-2.5" /> Re-scanned the page
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground font-body">
                  <div className="bg-primary/10 p-1.5 rounded-full">
                    <Bot className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Thinking…
                </div>
              )}
            </div>

            {/* Input */}
            <form
              onSubmit={(e) => { e.preventDefault(); send(input); }}
              className="p-3 border-t border-border bg-card"
            >
              <div className="flex items-end gap-2">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      send(input);
                    }
                  }}
                  placeholder={user ? "Ask anything about this report…" : "Sign in to chat"}
                  disabled={!user || loading}
                  rows={1}
                  className="resize-none min-h-[40px] max-h-32 text-xs font-body"
                />
                <Button type="submit" size="icon" variant="hero" disabled={!input.trim() || loading || !user}>
                  {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                </Button>
              </div>
              <p className="text-[9px] text-muted-foreground font-body mt-1.5 text-center">
                AI can make mistakes — push back if it does.
              </p>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
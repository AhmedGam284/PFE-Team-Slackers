import { Sparkles, X, Send, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { mentorChat } from "@/lib/mentorApi";
import { useAuth } from "@/context/auth";
import type { DiagnosisAnalyzeData } from "@/lib/apiContracts";
import { loadFromStorage, STORAGE_KEYS } from "@/lib/storage";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === "string");

const isTrackRecommendationArray = (
  value: unknown,
): value is Array<{ title: string; reason: string; matchScore: number }> =>
  Array.isArray(value) &&
  value.every((item) => {
    if (typeof item !== "object" || item === null) return false;
    const record = item as Record<string, unknown>;
    return (
      typeof record.title === "string" &&
      typeof record.reason === "string" &&
      typeof record.matchScore === "number" &&
      Number.isFinite(record.matchScore)
    );
  });

const isDiagnosisAnalyzeData = (value: unknown): value is DiagnosisAnalyzeData => {
  if (typeof value !== "object" || value === null) return false;

  const record = value as Record<string, unknown>;
  return (
    typeof record.readinessScore === "number" &&
    Number.isFinite(record.readinessScore) &&
    isStringArray(record.strengths) &&
    isStringArray(record.skillGaps) &&
    isTrackRecommendationArray(record.recommendedPfeTracks) &&
    isStringArray(record.recommendedNextSteps) &&
    typeof record.mentorAdvice === "string"
  );
};

export function AskAIButton() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quickReplies, setQuickReplies] = useState<string[]>([
    "Suggest PFE topics",
    "Plan my next week",
    "Review my scope",
  ]);

  const diagnosis = useMemo(() => {
    return loadFromStorage<DiagnosisAnalyzeData>(STORAGE_KEYS.diagnosis, {
      validate: isDiagnosisAnalyzeData,
      removeIfInvalid: true,
    });
  }, []);

  useEffect(() => {
    if (!open) return;
    if (messages.length) return;

    const name = user?.name ?? "Student";
    const topTrack = diagnosis?.recommendedPfeTracks?.[0]?.title;
    const intro = topTrack
      ? `Hi ${name}! I can help you plan your PFE. Your top track looks like “${topTrack}”. What do you want to do next?`
      : `Hi ${name}! I can help you plan your PFE. What do you want to do next?`;

    setMessages([{ role: "assistant", content: intro }]);
  }, [open, messages.length, user?.name, diagnosis?.recommendedPfeTracks]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    setError(null);
    setIsSending(true);
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: trimmed }]);

    try {
      const res = await mentorChat({
        message: trimmed,
        studentName: user?.name,
        specialization: undefined,
        readinessScore: diagnosis?.readinessScore,
        topTrack: diagnosis?.recommendedPfeTracks?.[0]?.title,
        skillGaps: diagnosis?.skillGaps,
      });

      setMessages((prev) => [...prev, { role: "assistant", content: res.reply }]);
      if (res.quickReplies?.length) setQuickReplies(res.quickReplies);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reach the AI mentor.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[340px] overflow-hidden rounded-2xl border border-border bg-card shadow-elegant animate-in slide-in-from-bottom-4">
          <div className="flex items-center justify-between bg-gradient-primary p-4 text-primary-foreground">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent shadow-glow">
                <Sparkles className="h-4 w-4 text-accent-foreground" />
              </div>
              <div>
                <p className="text-sm font-semibold">AI Mentor</p>
                <p className="text-xs opacity-80">Always here to help</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-primary-foreground hover:bg-white/10" onClick={() => setOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-3 p-4">
            <div className="max-h-64 space-y-2 overflow-auto pr-1">
              {messages.map((m, idx) => (
                <div
                  key={`${m.role}-${idx}`}
                  className={
                    m.role === "assistant"
                      ? "rounded-2xl rounded-tl-sm bg-muted p-3 text-sm text-foreground"
                      : "ml-auto w-fit max-w-[85%] rounded-2xl rounded-tr-sm bg-accent text-sm text-accent-foreground p-3"
                  }
                >
                  {m.content}
                </div>
              ))}

              {error ? (
                <div className="rounded-xl border border-destructive/30 bg-destructive-soft p-2 text-xs text-destructive">
                  {error}
                </div>
              ) : null}
            </div>

            <div className="flex flex-wrap gap-1.5">
              {quickReplies.slice(0, 3).map((q) => (
                <button
                  key={q}
                  className="rounded-full border border-border bg-background px-3 py-1 text-xs hover:border-accent hover:text-accent disabled:opacity-60"
                  disabled={isSending}
                  onClick={() => sendMessage(q)}
                  type="button"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          <form
            className="flex items-center gap-2 border-t border-border p-3"
            onSubmit={(e) => {
              e.preventDefault();
              void sendMessage(input);
            }}
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about your PFE…"
              className="h-9 border-0 bg-muted focus-visible:ring-1 focus-visible:ring-accent"
              disabled={isSending}
            />
            <Button
              size="icon"
              type="submit"
              className="h-9 w-9 bg-accent text-accent-foreground hover:bg-accent/90"
              disabled={isSending || !input.trim()}
              aria-label="Send"
            >
              {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </form>
        </div>
      )}

      <Button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-gradient-accent p-0 shadow-glow animate-pulse-glow hover:scale-105 transition-smooth"
        aria-label="Ask AI Mentor"
      >
        <Sparkles className="h-6 w-6 text-accent-foreground" />
      </Button>
    </>
  );
}

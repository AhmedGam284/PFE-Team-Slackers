import { Sparkles, X, Send } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/auth";

export function AskAIButton() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const firstName = user?.name?.split(" ")[0] ?? "there";

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
            <div className="rounded-2xl rounded-tl-sm bg-muted p-3 text-sm text-foreground">
              👋 Hi {firstName}! Based on your diagnosis, I recommend strengthening your <strong>research methodology</strong> next. Want me to suggest 3 PFE topics?
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button className="rounded-full border border-border bg-background px-3 py-1 text-xs hover:border-accent hover:text-accent">Suggest topics</button>
              <button className="rounded-full border border-border bg-background px-3 py-1 text-xs hover:border-accent hover:text-accent">Find mentor</button>
              <button className="rounded-full border border-border bg-background px-3 py-1 text-xs hover:border-accent hover:text-accent">Career tips</button>
            </div>
          </div>
          <div className="flex items-center gap-2 border-t border-border p-3">
            <Input placeholder="Ask anything about your PFE…" className="h-9 border-0 bg-muted focus-visible:ring-1 focus-visible:ring-accent" />
            <Button size="icon" className="h-9 w-9 bg-accent text-accent-foreground hover:bg-accent/90">
              <Send className="h-4 w-4" />
            </Button>
          </div>
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

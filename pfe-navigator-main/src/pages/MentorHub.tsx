import { useEffect, useMemo, useState } from "react";
import { MessageSquareText, Mail, Send, Inbox, Clock3, UserRound, Sparkles } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/auth";
import { mentorChat } from "@/lib/mentorApi";
import { getAssignedSupervisor, getAssignedSupervisorName, studentJourney } from "@/lib/studentJourney";
import { loadFromStorage, saveToStorage } from "@/lib/storage";
import { useSearchParams } from "react-router-dom";

const HUB_STORAGE_KEY = "pfe-compass-mentor-hub";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type MailMessage = {
  id: string;
  from: "student" | "mentor";
  subject: string;
  body: string;
  time: string;
  read: boolean;
};

type MentorHubState = {
  chat: ChatMessage[];
  inbox: MailMessage[];
  sent: MailMessage[];
};

const defaultInbox = (mentorName: string): MailMessage[] => [
  {
    id: "mail-1",
    from: "mentor",
    subject: "Supervisor alignment for this week",
    body: `Hi, please share your current progress and any blockers before our next sync with ${mentorName}.`,
    time: "Today · 09:10",
    read: false,
  },
  {
    id: "mail-2",
    from: "mentor",
    subject: "PFE scope reminder",
    body: "Keep the prototype small, measurable, and ready for a quick demo during review.",
    time: "Yesterday · 17:45",
    read: true,
  },
];

const isChatMessageArray = (value: unknown): value is ChatMessage[] =>
  Array.isArray(value) &&
  value.every((item) => {
    if (typeof item !== "object" || item === null) return false;
    const record = item as Record<string, unknown>;
    return record.role === "user" || record.role === "assistant";
  });

const isMailMessageArray = (value: unknown): value is MailMessage[] =>
  Array.isArray(value) &&
  value.every((item) => {
    if (typeof item !== "object" || item === null) return false;
    const record = item as Record<string, unknown>;
    return (
      (record.from === "student" || record.from === "mentor") &&
      typeof record.id === "string" &&
      typeof record.subject === "string" &&
      typeof record.body === "string" &&
      typeof record.time === "string" &&
      typeof record.read === "boolean"
    );
  });

const isMentorHubState = (value: unknown): value is MentorHubState => {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  return isChatMessageArray(record.chat) && isMailMessageArray(record.inbox) && isMailMessageArray(record.sent);
};

const formatTime = () =>
  new Date().toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const buildFallbackReply = (text: string, mentorName: string) =>
  `Thanks for the update. I reviewed your message and recommend keeping the next iteration focused on one clear deliverable. We will refine the scope together for ${mentorName}.`;

export default function MentorHub() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const supervisor = getAssignedSupervisor();
  const supervisorName = getAssignedSupervisorName();
  const isMentorView = user?.role === "mentor";
  const mentorLabel = isMentorView ? "Student communication hub" : "Mentor hub";

  const [chatInput, setChatInput] = useState("");
  const [chatError, setChatError] = useState<string | null>(null);
  const [isChatting, setIsChatting] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [mailSubject, setMailSubject] = useState("");
  const [mailBody, setMailBody] = useState("");
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") ?? "chat");
  const [inbox, setInbox] = useState<MailMessage[]>(defaultInbox(supervisorName));
  const [sent, setSent] = useState<MailMessage[]>([]);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "chat" || tab === "mail" || tab === "supervisor") {
      setActiveTab(tab);
    }
  }, [searchParams]);

  useEffect(() => {
    const stored = loadFromStorage<MentorHubState>(HUB_STORAGE_KEY, {
      validate: isMentorHubState,
      removeIfInvalid: true,
    });

    if (!stored) {
      setChatMessages([
        {
          role: "assistant",
          content: isMentorView
            ? `You are viewing the student hub for ${supervisorName}. Use this space to answer messages and send guidance.`
            : `Hi ${user?.name ?? "Student"}! Your assigned supervisor is ${supervisorName}. Use this hub to chat and send professional updates.`,
        },
      ]);
      return;
    }

    setChatMessages(stored.chat.length ? stored.chat : []);
    setInbox(stored.inbox.length ? stored.inbox : defaultInbox(supervisorName));
    setSent(stored.sent);
  }, [isMentorView, supervisorName, user?.name]);

  useEffect(() => {
    saveToStorage(HUB_STORAGE_KEY, {
      chat: chatMessages,
      inbox,
      sent,
    } satisfies MentorHubState);
  }, [chatMessages, inbox, sent]);

  const selectedInboxCount = useMemo(() => inbox.filter((item) => !item.read).length, [inbox]);

  const sendChat = async () => {
    const trimmed = chatInput.trim();
    if (!trimmed) return;

    setChatError(null);
    setIsChatting(true);
    setChatInput("");
    setChatMessages((prev) => [...prev, { role: "user", content: trimmed }]);

    try {
      const response = await mentorChat({
        message: trimmed,
        studentName: user?.name,
        specialization: supervisor.specialty,
        readinessScore: studentJourney.readinessScore,
        topTrack: studentJourney.topicSuggestions[0]?.title,
        skillGaps: [],
      });

      setChatMessages((prev) => [...prev, { role: "assistant", content: response.reply }]);
    } catch {
      setChatMessages((prev) => [...prev, { role: "assistant", content: buildFallbackReply(trimmed, supervisorName) }]);
      setChatError(null);
    } finally {
      setIsChatting(false);
    }
  };

  const sendMail = () => {
    const subject = mailSubject.trim();
    const body = mailBody.trim();
    if (!subject || !body) return;

    const outgoing: MailMessage = {
      id: `sent-${Date.now()}`,
      from: "student",
      subject,
      body,
      time: formatTime(),
      read: true,
    };

    const reply: MailMessage = {
      id: `inbox-${Date.now()}`,
      from: "mentor",
      subject: `Re: ${subject}`,
      body: `Received and noted. I will review this update with ${supervisorName} in mind and follow up on the next guidance step.`,
      time: formatTime(),
      read: false,
    };

    setSent((prev) => [outgoing, ...prev]);
    setInbox((prev) => [reply, ...prev]);
    setMailSubject("");
    setMailBody("");
    setActiveTab("mail");
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-accent">Mentor hub</p>
            <h1 className="mt-1 text-2xl font-bold text-foreground md:text-3xl">{mentorLabel}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Chat with your supervisor, send updates, and keep a professional record of replies.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-background px-4 py-3 shadow-card">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Assigned supervisor</p>
            <p className="mt-1 text-sm font-semibold text-foreground">{supervisorName}</p>
            <p className="text-xs text-muted-foreground">{supervisor.specialty}</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
          <Card className="border-border shadow-card">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="text-base">Supervisor communication</CardTitle>
                <Badge className="border-0 bg-accent-soft text-accent">{selectedInboxCount} unread mail</Badge>
              </div>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
                <TabsList className="grid w-full grid-cols-3 bg-muted/60">
                  <TabsTrigger value="chat"><MessageSquareText className="mr-2 h-4 w-4" /> Chat</TabsTrigger>
                  <TabsTrigger value="mail"><Mail className="mr-2 h-4 w-4" /> Mail</TabsTrigger>
                  <TabsTrigger value="supervisor"><UserRound className="mr-2 h-4 w-4" /> Supervisor</TabsTrigger>
                </TabsList>

                <TabsContent value="chat" className="mt-4 space-y-4">
                  <div className="rounded-2xl border border-border bg-background p-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-gradient-accent text-sm text-accent-foreground">{supervisor.initials}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-foreground">{supervisorName}</p>
                        <p className="text-xs text-muted-foreground">{supervisor.specialty}</p>
                      </div>
                    </div>
                    <div className="mt-4 max-h-[22rem] space-y-3 overflow-auto pr-1">
                      {chatMessages.map((message, index) => (
                        <div
                          key={`${message.role}-${index}`}
                          className={
                            message.role === "assistant"
                              ? "max-w-[85%] rounded-2xl rounded-tl-sm bg-muted p-3 text-sm text-foreground"
                              : "ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-accent p-3 text-sm text-accent-foreground"
                          }
                        >
                          {message.content}
                        </div>
                      ))}
                      {chatError ? <p className="text-xs text-muted-foreground">{chatError}</p> : null}
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {["Review my scope", "Plan next meeting", "Request feedback"].map((quickReply) => (
                        <Button
                          key={quickReply}
                          variant="outline"
                          size="sm"
                          className="border-border"
                          disabled={isChatting}
                          onClick={() => setChatInput(quickReply)}
                        >
                          {quickReply}
                        </Button>
                      ))}
                    </div>
                    <div className="mt-4 flex items-end gap-2">
                      <div className="flex-1 space-y-2">
                        <Label htmlFor="mentor-chat">Message</Label>
                        <Textarea
                          id="mentor-chat"
                          value={chatInput}
                          onChange={(event) => setChatInput(event.target.value)}
                          placeholder="Write a message to your supervisor..."
                          className="min-h-24"
                          disabled={isChatting}
                        />
                      </div>
                      <Button
                        className="bg-accent text-accent-foreground hover:bg-accent/90"
                        onClick={sendChat}
                        disabled={isChatting || !chatInput.trim()}
                      >
                        <Send className="mr-2 h-4 w-4" /> Send
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="mail" className="mt-4 space-y-4">
                  <div className="grid gap-4 lg:grid-cols-2">
                    <Card className="border-border bg-background shadow-none">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Inbox</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {inbox.map((message) => (
                          <div
                            key={message.id}
                            className={`rounded-xl border p-3 ${message.read ? "border-border bg-background" : "border-accent/30 bg-accent-soft/30"}`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="text-sm font-semibold text-foreground">{message.subject}</p>
                                <p className="mt-1 text-xs text-muted-foreground">{message.body}</p>
                              </div>
                              {!message.read ? <span className="mt-1 h-2.5 w-2.5 rounded-full bg-accent" /> : null}
                            </div>
                            <div className="mt-2 flex items-center gap-1 text-[11px] text-muted-foreground">
                              <Clock3 className="h-3 w-3" />
                              <span>{message.time}</span>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Card className="border-border bg-background shadow-none">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Compose mail</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="mail-subject">Subject</Label>
                          <Input id="mail-subject" value={mailSubject} onChange={(event) => setMailSubject(event.target.value)} placeholder="Weekly progress update" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="mail-body">Message</Label>
                          <Textarea
                            id="mail-body"
                            value={mailBody}
                            onChange={(event) => setMailBody(event.target.value)}
                            placeholder="Write a concise update for your supervisor"
                            className="min-h-40"
                          />
                        </div>
                        <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90" onClick={sendMail} disabled={!mailSubject.trim() || !mailBody.trim()}>
                          <Mail className="mr-2 h-4 w-4" /> Send mail
                        </Button>
                      </CardContent>
                    </Card>
                  </div>

                  <Card className="border-border bg-background shadow-none">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Sent mail</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {sent.length ? sent.map((message) => (
                        <div key={message.id} className="rounded-xl border border-border bg-muted/20 p-3">
                          <p className="text-sm font-semibold text-foreground">{message.subject}</p>
                          <p className="mt-1 text-sm text-muted-foreground">{message.body}</p>
                          <p className="mt-2 text-[11px] text-muted-foreground">{message.time}</p>
                        </div>
                      )) : (
                        <p className="text-sm text-muted-foreground">No sent mail yet.</p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="supervisor" className="mt-4 space-y-4">
                  <div className="grid gap-4 md:grid-cols-[0.9fr_1.1fr]">
                    <Card className="border-border bg-background shadow-none">
                      <CardContent className="p-5">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-14 w-14">
                            <AvatarFallback className="bg-gradient-accent text-base text-accent-foreground">{supervisor.initials}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-foreground">{supervisorName}</p>
                            <p className="text-xs text-muted-foreground">{supervisor.specialty}</p>
                          </div>
                        </div>
                        <div className="mt-4 space-y-2 rounded-xl bg-muted/50 p-3 text-xs">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Availability</span>
                            <span className="font-medium text-foreground">{supervisor.availability}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Next slot</span>
                            <span className="font-medium text-foreground">{supervisor.nextSlot}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Fit score</span>
                            <span className="font-medium text-success">{studentJourney.assignedMentor.fit}%</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-border bg-background shadow-none">
                      <CardContent className="p-5">
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-accent" />
                          <p className="text-sm font-semibold text-foreground">Professional workflow</p>
                        </div>
                        <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                          <li>Use chat for quick guidance and alignment questions.</li>
                          <li>Use mail for formal updates, deliverables, and meeting follow-ups.</li>
                          <li>Messages stay local in this demo, so the page works without a database.</li>
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </CardHeader>
          </Card>

          <Card className="border-border shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-2xl border border-border bg-background p-4">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Supervisor lookup</p>
                <p className="mt-1 text-sm font-semibold text-foreground">{supervisorName}</p>
                <p className="mt-1 text-sm text-muted-foreground">Fetched from the shared student journey helper.</p>
              </div>
              <div className="rounded-2xl border border-border bg-background p-4">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Current track</p>
                <p className="mt-1 text-sm font-semibold text-foreground">{studentJourney.topicSuggestions[0].title}</p>
                <p className="mt-1 text-sm text-muted-foreground">Ready for guidance, follow-up, and formal updates.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}

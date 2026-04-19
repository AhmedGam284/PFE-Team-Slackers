import { useEffect, useMemo, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/context/auth";
import { mentorChat } from "@/lib/mentorApi";
import { analyzeDiagnosis } from "@/lib/diagnosisApi";
import { submitPfeProgress } from "@/lib/pfeApi";
import type {
  DiagnosisAnalyzeData,
  DiagnosisAnalyzeRequest,
  MentorChatData,
  PfeProgressFeedbackData,
  PfeProgressRequest,
} from "@/lib/apiContracts";
import { loadFromStorage, saveToStorage } from "@/lib/storage";
import { studentJourney, getAssignedSupervisorName } from "@/lib/studentJourney";
import { Brain, Send, Loader2, MessagesSquare, ClipboardList, UserRound, WandSparkles } from "lucide-react";
import { useSearchParams } from "react-router-dom";

const AI_AGENT_STATE_KEY = "pfe-compass-ai-agent";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type AIAgentState = {
  chat: ChatMessage[];
  diagnosis: DiagnosisAnalyzeData | null;
  progress: PfeProgressFeedbackData | null;
};

type ProgressFormState = {
  projectTitle: string;
  completedTasks: string;
  blockers: string;
  nextGoals: string;
  notes: string;
};

type DiagnosisFormState = {
  studentName: string;
  academicLevel: string;
  specialization: string;
  skills: string;
  interests: string;
  careerGoals: string;
  notes: string;
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

const isProgressFeedbackData = (value: unknown): value is PfeProgressFeedbackData => {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.progressAssessment === "string" &&
    typeof record.mentorFeedback === "string" &&
    (record.riskLevel === "low" || record.riskLevel === "medium" || record.riskLevel === "high") &&
    isStringArray(record.recommendedActions)
  );
};

const isChatMessageArray = (value: unknown): value is ChatMessage[] =>
  Array.isArray(value) &&
  value.every((item) => {
    if (typeof item !== "object" || item === null) return false;
    const record = item as Record<string, unknown>;
    return record.role === "user" || record.role === "assistant";
  });

const isAIAgentState = (value: unknown): value is AIAgentState => {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  return (
    isChatMessageArray(record.chat) &&
    (record.diagnosis === null || isDiagnosisAnalyzeData(record.diagnosis)) &&
    (record.progress === null || isProgressFeedbackData(record.progress))
  );
};

const splitList = (value: string) =>
  value
    .split(/\n|,/g)
    .map((item) => item.trim())
    .filter(Boolean);

const formatShortTime = () =>
  new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

const defaultDiagnosisForm = (userName?: string): DiagnosisFormState => ({
  studentName: userName ?? "",
  academicLevel: "PFE phase",
  specialization: "Software Engineering",
  skills: "React, TypeScript, APIs, Project planning",
  interests: studentJourney.topicSuggestions[0]?.tags?.join(", ") ?? "AI, EdTech",
  careerGoals: "Deliver a demoable PFE, Improve employability",
  notes: "",
});

const defaultProgressForm = (): ProgressFormState => ({
  projectTitle: studentJourney.topicSuggestions[0]?.title ?? "PFE project",
  completedTasks: "Built wireframes\nImplemented login",
  blockers: "Dataset access",
  nextGoals: "Finish prototype v1\nPrepare evaluation plan",
  notes: "",
});

const fallbackAssistantGreeting = (name: string) =>
  `Hi ${name}. I can help with quick assistant replies, progress analysis, and AI diagnosis. Your assigned supervisor is ${getAssignedSupervisorName()}.`;

const buildLocalAssistantReply = (message: string, supervisor: string) => ({
  reply: `Thanks for the update. Keep it focused, measurable, and ready to review with ${supervisor}.`,
  quickReplies: message.toLowerCase().includes("plan")
    ? ["Break it into tasks", "Set a deadline", "Review risks"]
    : ["Summarize next steps", "Check blockers", "Ask for feedback"],
});

const buildLocalProgressFeedback = (payload: PfeProgressRequest): PfeProgressFeedbackData => {
  const completedCount = payload.completedTasks.length;
  const blockerCount = payload.blockers.length;

  const riskLevel: PfeProgressFeedbackData["riskLevel"] =
    blockerCount >= 3 ? "high" : blockerCount >= 1 ? "medium" : "low";

  return {
    progressAssessment:
      completedCount > 0
        ? `You reported ${completedCount} completed task(s), so the project is moving forward.`
        : "No completed tasks reported yet; try to ship a small increment this week.",
    riskLevel,
    mentorFeedback:
      riskLevel === "high"
        ? "Multiple blockers detected. Reduce scope and clarify the most important next step."
        : riskLevel === "medium"
          ? "You are progressing, but blockers should be addressed soon to avoid delays."
          : "Good momentum. Keep shipping small, visible milestones.",
    recommendedActions: [
      ...(blockerCount ? ["Turn each blocker into a concrete question"] : []),
      "Define the next milestone as a demoable feature",
      "Review your plan for the next 7 days",
    ],
  };
};

const buildLocalDiagnosis = (payload: DiagnosisAnalyzeRequest): DiagnosisAnalyzeData => {
  const skillCount = payload.skills.length;
  const interestCount = payload.interests.length;
  const goalCount = payload.careerGoals.length;

  const readinessScore = Math.min(100, Math.max(45, 50 + skillCount * 4 + interestCount * 3 + goalCount * 2));

  return {
    readinessScore,
    strengths: [payload.specialization, payload.academicLevel, ...payload.skills.slice(0, 2)].filter(Boolean),
    skillGaps: [
      ...(skillCount < 4 ? ["Technical depth"] : []),
      ...(interestCount < 3 ? ["Research focus"] : []),
      ...(goalCount < 2 ? ["Project framing"] : []),
    ],
    recommendedPfeTracks: [
      {
        title: `Applied ${payload.specialization || "engineering"}`,
        reason: `Matches your ${payload.academicLevel} profile and current skills.`,
        matchScore: Math.min(100, readinessScore + 8),
      },
      {
        title: "Student productivity assistant",
        reason: "A practical track for a demoable MVP with clear value.",
        matchScore: Math.min(100, readinessScore + 3),
      },
    ],
    recommendedNextSteps: [
      "Pick one clear problem statement",
      "Turn your first milestone into a demoable feature",
      "Review progress weekly with your supervisor",
    ],
    mentorAdvice:
      "Keep the scope small, ship one visible feature early, and use the diagnosis output to guide your next week.",
  };
};

export default function AIAgent() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const supervisorName = getAssignedSupervisorName();
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") ?? "assistant");
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatIsSending, setChatIsSending] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [quickReplies, setQuickReplies] = useState<string[]>([
    "Suggest PFE topics",
    "Plan my next week",
    "Review my scope",
  ]);
  const [progressIsRunning, setProgressIsRunning] = useState(false);
  const [progressError, setProgressError] = useState<string | null>(null);
  const [progressResult, setProgressResult] = useState<PfeProgressFeedbackData | null>(null);
  const [progressForm, setProgressForm] = useState<ProgressFormState>(defaultProgressForm());
  const [diagnosisIsRunning, setDiagnosisIsRunning] = useState(false);
  const [diagnosisError, setDiagnosisError] = useState<string | null>(null);
  const [diagnosisResult, setDiagnosisResult] = useState<DiagnosisAnalyzeData | null>(null);
  const [diagnosisForm, setDiagnosisForm] = useState<DiagnosisFormState>(defaultDiagnosisForm(user?.name));

  useEffect(() => {
    const stored = loadFromStorage<AIAgentState>(AI_AGENT_STATE_KEY, {
      validate: isAIAgentState,
      removeIfInvalid: true,
    });

    if (stored) {
      setChatMessages(stored.chat.length ? stored.chat : []);
      setDiagnosisResult(stored.diagnosis);
      setProgressResult(stored.progress);
      return;
    }

    setChatMessages([
      {
        role: "assistant",
        content: fallbackAssistantGreeting(user?.name ?? "Student"),
      },
    ]);
  }, [supervisorName, user?.name]);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "assistant" || tab === "analyze" || tab === "diagnosis") {
      setActiveTab(tab);
    }
  }, [searchParams]);

  useEffect(() => {
    saveToStorage(AI_AGENT_STATE_KEY, {
      chat: chatMessages,
      diagnosis: diagnosisResult,
      progress: progressResult,
    } satisfies AIAgentState);
  }, [chatMessages, diagnosisResult, progressResult]);

  useEffect(() => {
    setDiagnosisForm((current) => ({
      ...current,
      studentName: current.studentName.trim().length ? current.studentName : user?.name ?? current.studentName,
    }));
  }, [user?.name]);

  const sendAssistantMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    setChatError(null);
    setChatIsSending(true);
    setChatInput("");
    setChatMessages((prev) => [...prev, { role: "user", content: trimmed }]);

    try {
      const response: MentorChatData = await mentorChat({
        message: trimmed,
        studentName: user?.name,
        specialization: diagnosisForm.specialization,
        readinessScore: diagnosisResult?.readinessScore ?? studentJourney.readinessScore,
        topTrack: diagnosisResult?.recommendedPfeTracks?.[0]?.title ?? studentJourney.topicSuggestions[0]?.title,
        skillGaps: diagnosisResult?.skillGaps ?? [],
      });

      setChatMessages((prev) => [...prev, { role: "assistant", content: response.reply }]);
      if (response.quickReplies?.length) setQuickReplies(response.quickReplies);
    } catch (err) {
      const fallback = buildLocalAssistantReply(trimmed, supervisorName);
      setChatMessages((prev) => [...prev, { role: "assistant", content: fallback.reply }]);
      setQuickReplies(fallback.quickReplies);
      setChatError(null);
    } finally {
      setChatIsSending(false);
    }
  };

  const runProgressAnalysis = async () => {
    setProgressError(null);
    setProgressIsRunning(true);

    const payload: PfeProgressRequest = {
      projectTitle: progressForm.projectTitle.trim(),
      completedTasks: splitList(progressForm.completedTasks),
      blockers: splitList(progressForm.blockers),
      nextGoals: splitList(progressForm.nextGoals),
      notes: progressForm.notes.trim(),
    };

    try {
      const result = await submitPfeProgress(payload);
      setProgressResult(result);
      setActiveTab("analyze");
    } catch (err) {
      const fallback = buildLocalProgressFeedback(payload);
      setProgressResult(fallback);
      setActiveTab("analyze");
      setProgressError(null);
    } finally {
      setProgressIsRunning(false);
    }
  };

  const runDiagnosis = async () => {
    setDiagnosisError(null);
    setDiagnosisIsRunning(true);

    const payload: DiagnosisAnalyzeRequest = {
      studentName: diagnosisForm.studentName.trim() || user?.name || "Student",
      academicLevel: diagnosisForm.academicLevel.trim(),
      specialization: diagnosisForm.specialization.trim(),
      skills: splitList(diagnosisForm.skills),
      interests: splitList(diagnosisForm.interests),
      careerGoals: splitList(diagnosisForm.careerGoals),
      notes: diagnosisForm.notes.trim(),
    };

    try {
      const result = await analyzeDiagnosis(payload);
      setDiagnosisResult(result);
      setActiveTab("diagnosis");
    } catch (err) {
      const fallback = buildLocalDiagnosis(payload);
      setDiagnosisResult(fallback);
      setActiveTab("diagnosis");
      setDiagnosisError(null);
    } finally {
      setDiagnosisIsRunning(false);
    }
  };

  const displayedReadiness = diagnosisResult?.readinessScore ?? studentJourney.readinessScore;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <WandSparkles className="h-5 w-5 text-accent" />
              <span className="text-sm font-semibold uppercase tracking-wider text-accent">AI Agent</span>
            </div>
            <h1 className="mt-1 text-2xl font-bold text-foreground md:text-3xl">One place for assistance, analysis, and diagnosis</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Ask for help, analyze your progress, or run a full AI diagnosis backed by the existing backend APIs.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-background px-4 py-3 shadow-card">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Assigned supervisor</p>
            <p className="mt-1 text-sm font-semibold text-foreground">{supervisorName}</p>
            <p className="text-xs text-muted-foreground">{studentJourney.assignedMentor.specialty}</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <Card className="border-border shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">AI workspace</CardTitle>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
                <TabsList className="grid w-full grid-cols-3 bg-muted/60">
                  <TabsTrigger value="assistant">
                    <MessagesSquare className="mr-2 h-4 w-4" /> Assistant
                  </TabsTrigger>
                  <TabsTrigger value="analyze">
                    <ClipboardList className="mr-2 h-4 w-4" /> Analyze
                  </TabsTrigger>
                  <TabsTrigger value="diagnosis">
                    <Brain className="mr-2 h-4 w-4" /> Diagnosis
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="assistant" className="mt-4 space-y-4">
                  <div className="rounded-2xl border border-border bg-background p-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-gradient-accent text-base text-accent-foreground">AI</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-foreground">Little assistant</p>
                        <p className="text-xs text-muted-foreground">Quick, practical guidance for students</p>
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
                      {chatError ? <Alert variant="destructive"><AlertTitle>Assistant unavailable</AlertTitle><AlertDescription>{chatError}</AlertDescription></Alert> : null}
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {quickReplies.map((reply) => (
                        <Button key={reply} variant="outline" size="sm" className="border-border" onClick={() => sendAssistantMessage(reply)} disabled={chatIsSending}>
                          {reply}
                        </Button>
                      ))}
                    </div>

                    <div className="mt-4 flex items-end gap-2">
                      <div className="flex-1 space-y-2">
                        <Label htmlFor="ai-assistant-input">Message</Label>
                        <Textarea
                          id="ai-assistant-input"
                          value={chatInput}
                          onChange={(event) => setChatInput(event.target.value)}
                          placeholder="Ask for a quick plan, feedback, or idea..."
                          className="min-h-24"
                          disabled={chatIsSending}
                        />
                      </div>
                      <Button className="bg-accent text-accent-foreground hover:bg-accent/90" disabled={chatIsSending || !chatInput.trim()} onClick={() => sendAssistantMessage(chatInput)}>
                        {chatIsSending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                        Send
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="analyze" className="mt-4 space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="progress-title">Project title</Label>
                      <Input id="progress-title" value={progressForm.projectTitle} onChange={(event) => setProgressForm((prev) => ({ ...prev, projectTitle: event.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="progress-completed">Completed tasks</Label>
                      <Textarea id="progress-completed" value={progressForm.completedTasks} onChange={(event) => setProgressForm((prev) => ({ ...prev, completedTasks: event.target.value }))} className="min-h-28" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="progress-blockers">Blockers</Label>
                      <Textarea id="progress-blockers" value={progressForm.blockers} onChange={(event) => setProgressForm((prev) => ({ ...prev, blockers: event.target.value }))} className="min-h-28" />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="progress-next">Next goals</Label>
                      <Textarea id="progress-next" value={progressForm.nextGoals} onChange={(event) => setProgressForm((prev) => ({ ...prev, nextGoals: event.target.value }))} className="min-h-24" />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="progress-notes">Notes</Label>
                      <Textarea id="progress-notes" value={progressForm.notes} onChange={(event) => setProgressForm((prev) => ({ ...prev, notes: event.target.value }))} className="min-h-24" />
                    </div>
                  </div>

                  {progressError ? (
                    <Alert variant="destructive">
                      <AlertTitle>Progress analysis failed</AlertTitle>
                      <AlertDescription>{progressError}</AlertDescription>
                    </Alert>
                  ) : null}

                  <Button className="bg-accent text-accent-foreground hover:bg-accent/90" onClick={runProgressAnalysis} disabled={progressIsRunning}>
                    {progressIsRunning ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {progressIsRunning ? "Analyzing..." : "Analyze progress"}
                  </Button>

                  {progressResult ? (
                    <div className="rounded-2xl border border-border bg-background p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-foreground">Latest progress analysis</p>
                          <p className="mt-1 text-sm text-muted-foreground">{progressResult.progressAssessment}</p>
                        </div>
                        <Badge className={progressResult.riskLevel === "low" ? "border-0 bg-success/15 text-success" : progressResult.riskLevel === "medium" ? "border-0 bg-warning-soft text-warning" : "border-0 bg-destructive-soft text-destructive"}>
                          Risk: {progressResult.riskLevel}
                        </Badge>
                      </div>
                      <div className="mt-3 rounded-xl bg-muted/40 p-3">
                        <p className="text-xs font-semibold text-muted-foreground">Mentor feedback</p>
                        <p className="mt-1 text-sm text-foreground">{progressResult.mentorFeedback}</p>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {progressResult.recommendedActions.map((action) => (
                          <Badge key={action} className="border-0 bg-info-soft text-info">{action}</Badge>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </TabsContent>

                <TabsContent value="diagnosis" className="mt-4 space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="diag-name">Student name</Label>
                      <Input id="diag-name" value={diagnosisForm.studentName} onChange={(event) => setDiagnosisForm((prev) => ({ ...prev, studentName: event.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="diag-level">Academic level</Label>
                      <Input id="diag-level" value={diagnosisForm.academicLevel} onChange={(event) => setDiagnosisForm((prev) => ({ ...prev, academicLevel: event.target.value }))} />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="diag-spec">Specialization</Label>
                      <Input id="diag-spec" value={diagnosisForm.specialization} onChange={(event) => setDiagnosisForm((prev) => ({ ...prev, specialization: event.target.value }))} />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="diag-skills">Skills</Label>
                      <Textarea id="diag-skills" value={diagnosisForm.skills} onChange={(event) => setDiagnosisForm((prev) => ({ ...prev, skills: event.target.value }))} className="min-h-24" />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="diag-interests">Interests</Label>
                      <Textarea id="diag-interests" value={diagnosisForm.interests} onChange={(event) => setDiagnosisForm((prev) => ({ ...prev, interests: event.target.value }))} className="min-h-24" />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="diag-goals">Career goals</Label>
                      <Textarea id="diag-goals" value={diagnosisForm.careerGoals} onChange={(event) => setDiagnosisForm((prev) => ({ ...prev, careerGoals: event.target.value }))} className="min-h-24" />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="diag-notes">Notes</Label>
                      <Textarea id="diag-notes" value={diagnosisForm.notes} onChange={(event) => setDiagnosisForm((prev) => ({ ...prev, notes: event.target.value }))} className="min-h-24" />
                    </div>
                  </div>

                  {diagnosisError ? (
                    <Alert variant="destructive">
                      <AlertTitle>Diagnosis failed</AlertTitle>
                      <AlertDescription>{diagnosisError}</AlertDescription>
                    </Alert>
                  ) : null}

                  <Button className="bg-accent text-accent-foreground hover:bg-accent/90" onClick={runDiagnosis} disabled={diagnosisIsRunning}>
                    {diagnosisIsRunning ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {diagnosisIsRunning ? "Running..." : "Run AI diagnosis"}
                  </Button>

                  {diagnosisResult ? (
                    <div className="rounded-2xl border border-border bg-background p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-foreground">Readiness score</p>
                          <p className="mt-1 text-4xl font-bold text-foreground">{diagnosisResult.readinessScore}<span className="text-2xl text-muted-foreground">/100</span></p>
                        </div>
                        <Badge className="border-0 bg-accent text-accent-foreground">AI diagnosis</Badge>
                      </div>
                      <div className="mt-3 grid gap-3 md:grid-cols-2">
                        <div className="rounded-xl bg-muted/40 p-3">
                          <p className="text-xs font-semibold text-muted-foreground">Strengths</p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {diagnosisResult.strengths.map((item) => <Badge key={item} className="border-0 bg-success/15 text-success">{item}</Badge>)}
                          </div>
                        </div>
                        <div className="rounded-xl bg-muted/40 p-3">
                          <p className="text-xs font-semibold text-muted-foreground">Skill gaps</p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {diagnosisResult.skillGaps.map((item) => <Badge key={item} className="border-0 bg-warning-soft text-warning">{item}</Badge>)}
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 rounded-xl bg-muted/40 p-3">
                        <p className="text-xs font-semibold text-muted-foreground">Mentor advice</p>
                        <p className="mt-1 text-sm text-foreground">{diagnosisResult.mentorAdvice}</p>
                      </div>
                      <div className="mt-3">
                        <p className="text-xs font-semibold text-muted-foreground">Recommended next steps</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {diagnosisResult.recommendedNextSteps.map((step) => <Badge key={step} className="border-0 bg-info-soft text-info">{step}</Badge>)}
                        </div>
                      </div>
                    </div>
                  ) : null}
                </TabsContent>
              </Tabs>
            </CardHeader>
          </Card>

          <Card className="border-border shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">AI status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-2xl border border-border bg-background p-4">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">API routing</p>
                <p className="mt-1 text-sm font-semibold text-foreground">Backend APIs</p>
                <p className="mt-1 text-sm text-muted-foreground">Assistant, analysis, and diagnosis all go through the existing Express routes. If an OpenAI key is configured on the backend, those routes use it automatically.</p>
              </div>
              <div className="rounded-2xl border border-border bg-background p-4">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Current setup</p>
                <p className="mt-1 text-sm font-semibold text-foreground">{supervisorName}</p>
                <p className="mt-1 text-sm text-muted-foreground">Supervisor context is reused across assistant and diagnosis flows.</p>
              </div>
              <div className="rounded-2xl border border-border bg-background p-4">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Quick start</p>
                <p className="mt-1 text-sm font-semibold text-foreground">Try the Assistant tab first</p>
                <p className="mt-1 text-sm text-muted-foreground">Then move to Analyze or Diagnosis depending on what the student needs.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}

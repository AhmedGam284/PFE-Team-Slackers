import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Activity,
  Award,
  Building2,
  CheckCircle2,
  Circle,
  ExternalLink,
  Heart,
  Loader2,
  Mail,
  MapPin,
  MessageSquare,
} from "lucide-react";
import { studentJourney } from "@/lib/studentJourney";
import { useEffect, useMemo, useState } from "react";
import type { DiagnosisAnalyzeData, PfeProgressFeedbackData, PfeProjectIdea, PfeProgressRequest } from "@/lib/apiContracts";
import { getPfeProjects, submitPfeProgress } from "@/lib/pfeApi";
import { loadFromStorage, saveToStorage, STORAGE_KEYS } from "@/lib/storage";

const milestones = [
  { title: "Project charter approved", done: true },
  { title: "Literature review complete", done: true },
  { title: "Methodology defined", done: true },
  { title: "Prototype v1 implementation", done: false, current: true },
  { title: "User testing & evaluation", done: false },
  { title: "Final report & defense", done: false },
];

const skillBadges = [
  { label: "Python", level: "Advanced", color: "accent" },
  { label: "Machine Learning", level: "Intermediate", color: "info" },
  { label: "Research Writing", level: "Advanced", color: "accent" },
  { label: "Data Analysis", level: "Advanced", color: "accent" },
  { label: "MLOps", level: "Beginner", color: "muted" },
  { label: "TensorFlow", level: "Intermediate", color: "info" },
];

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

const isPfeProgressFeedbackData = (value: unknown): value is PfeProgressFeedbackData => {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;

  const riskLevel = record.riskLevel;
  const isRiskLevel = riskLevel === "low" || riskLevel === "medium" || riskLevel === "high";

  return (
    typeof record.progressAssessment === "string" &&
    typeof record.mentorFeedback === "string" &&
    isRiskLevel &&
    isStringArray(record.recommendedActions)
  );
};

const parseList = (value: string) =>
  value
    .split(/\n|,/g)
    .map((item) => item.trim())
    .filter(Boolean);

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const computeStableMatch = (seed: string, readinessScore: number) => {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) % 1000;
  }
  const base = clamp(Math.round(readinessScore), 60, 92);
  const jitter = (hash % 13) - 6; // -6..+6
  return clamp(base + jitter, 55, 98);
};

export default function Pfe() {
  const completed = milestones.filter((m) => m.done).length;
  const pct = Math.round((completed / milestones.length) * 100);
  const mentor = studentJourney.assignedMentor;

  const [savedDiagnosis, setSavedDiagnosis] = useState<DiagnosisAnalyzeData | null>(null);
  const [projects, setProjects] = useState<PfeProjectIdea[]>([]);
  const [projectsError, setProjectsError] = useState<string | null>(null);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);

  const [feedback, setFeedback] = useState<PfeProgressFeedbackData | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const topTrackFromDiagnosis = savedDiagnosis?.recommendedPfeTracks?.[0];
  const readinessScore = savedDiagnosis?.readinessScore ?? studentJourney.readinessScore;

  const headerTitle = topTrackFromDiagnosis?.title ?? studentJourney.topicSuggestions[0].title;
  const headerFit = topTrackFromDiagnosis?.matchScore ?? studentJourney.topicSuggestions[0].fit;
  const headerSubtitle = topTrackFromDiagnosis?.reason ?? "Recommended from your full academic run";

  const [projectTitle, setProjectTitle] = useState(studentJourney.topicSuggestions[0].title);
  const [completedTasksText, setCompletedTasksText] = useState("");
  const [blockersText, setBlockersText] = useState("");
  const [nextGoalsText, setNextGoalsText] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    setSavedDiagnosis(
      loadFromStorage<DiagnosisAnalyzeData>(STORAGE_KEYS.diagnosis, {
        validate: isDiagnosisAnalyzeData,
        removeIfInvalid: true,
      }),
    );

    setFeedback(
      loadFromStorage<PfeProgressFeedbackData>(STORAGE_KEYS.pfeProgress, {
        validate: isPfeProgressFeedbackData,
        removeIfInvalid: true,
      }),
    );
  }, []);

  useEffect(() => {
    setProjectTitle((prev) => (prev.trim().length ? prev : headerTitle));
  }, [headerTitle]);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setProjectsError(null);
      setIsLoadingProjects(true);
      try {
        const data = await getPfeProjects();
        if (!cancelled) setProjects(data);
      } catch (err) {
        if (!cancelled) {
          setProjectsError(err instanceof Error ? err.message : "Failed to load project ideas.");
        }
      } finally {
        if (!cancelled) setIsLoadingProjects(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  const projectCards = useMemo(() => {
    if (projects.length) return projects;
    // fallback to demo data if backend isn't available
    const difficulty = readinessScore >= 85 ? "advanced" : readinessScore >= 70 ? "intermediate" : "beginner";

    return studentJourney.topicSuggestions.slice(0, 4).map((topic, index) => ({
      id: `fallback-${index}-${topic.title}`,
      title: topic.title,
      domain: "PFE",
      difficulty,
      description: topic.rationale,
      requiredSkills: topic.tags,
      matchReason: "Fallback suggestions (backend not available)",
    } satisfies PfeProjectIdea));
  }, [projects, readinessScore]);

  const handleSubmitProgress = async () => {
    setSubmitError(null);
    setIsSubmitting(true);

    const payload: PfeProgressRequest = {
      projectTitle: projectTitle.trim() || headerTitle,
      completedTasks: parseList(completedTasksText),
      blockers: parseList(blockersText),
      nextGoals: parseList(nextGoalsText),
      notes: notes.trim(),
    };

    try {
      const result = await submitPfeProgress(payload);
      setFeedback(result);
      saveToStorage(STORAGE_KEYS.pfeProgress, result);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Progress analysis failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-accent">Project · 2025/2026</p>
            <h1 className="mt-1 text-2xl font-bold text-foreground md:text-3xl">{headerTitle}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{headerSubtitle} · Fit {headerFit}%</p>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-success/30 bg-success/10 px-4 py-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-success text-success-foreground">
              <Activity className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Project health</p>
              <p className="text-sm font-bold text-success">On track</p>
            </div>
          </div>
        </div>

        {/* Progress + Supervisor */}
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="border-border shadow-card lg:col-span-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Project milestones</CardTitle>
                <span className="text-sm font-semibold text-muted-foreground">{completed} / {milestones.length} complete</span>
              </div>
              <Progress value={pct} className="mt-2 h-2" />
            </CardHeader>
            <CardContent className="space-y-2">
              {milestones.map((m, i) => (
                <div
                  key={m.title}
                  className={`flex items-center gap-3 rounded-xl border p-3 transition-smooth ${
                    m.current
                      ? "border-accent/40 bg-accent-soft/40"
                      : "border-border bg-background hover:border-accent/30"
                  }`}
                >
                  {m.done ? (
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-success" />
                  ) : m.current ? (
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-accent">
                      <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                    </div>
                  ) : (
                    <Circle className="h-5 w-5 shrink-0 text-muted-foreground/40" />
                  )}
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${m.done ? "text-muted-foreground line-through" : "text-foreground"}`}>
                      Step {i + 1} · {m.title}
                    </p>
                  </div>
                  {m.current && <Badge className="border-0 bg-accent text-accent-foreground">In progress</Badge>}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Supervisor</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Avatar className="h-14 w-14">
                  <AvatarFallback className="bg-gradient-accent text-base text-accent-foreground">{mentor.initials}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="font-semibold text-foreground">{mentor.name}</p>
                  <p className="text-xs text-muted-foreground">Faculty of Engineering</p>
                  <p className="text-xs text-muted-foreground">{mentor.specialty}</p>
                </div>
              </div>
              <div className="mt-4 space-y-2 rounded-xl bg-muted/50 p-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last sync</span>
                  <span className="font-medium text-foreground">2 days ago</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Next meeting</span>
                  <span className="font-medium text-foreground">{mentor.nextSlot}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fit score</span>
                  <span className="font-medium text-success">{mentor.fit}%</span>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" className="border-border"><MessageSquare className="mr-1.5 h-3.5 w-3.5" /> Chat</Button>
                <Button variant="outline" size="sm" className="border-border"><Mail className="mr-1.5 h-3.5 w-3.5" /> Email</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Certified skills */}
        <Card className="border-border shadow-card">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-soft text-accent">
                <Award className="h-4 w-4" />
              </div>
              <CardTitle className="text-base">Certified skills</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2.5">
              {skillBadges.map((b) => (
                <div
                  key={b.label}
                  className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-smooth ${
                    b.color === "accent"
                      ? "border-accent/40 bg-accent-soft text-accent"
                      : b.color === "info"
                      ? "border-info/40 bg-info-soft text-info"
                      : "border-border bg-muted text-muted-foreground"
                  }`}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span className="font-medium">{b.label}</span>
                  <span className="text-xs opacity-70">· {b.level}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Companies */}
        <Card className="border-border shadow-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-info-soft text-info">
                  <Building2 className="h-4 w-4" />
                </div>
                <CardTitle className="text-base">Suggested projects</CardTitle>
              </div>
              <Button variant="ghost" size="sm" className="text-accent hover:text-accent">See all matches</Button>
            </div>
          </CardHeader>
          <CardContent>
            {projectsError ? (
              <Alert variant="destructive">
                <AlertTitle>Could not load projects</AlertTitle>
                <AlertDescription>{projectsError}</AlertDescription>
              </Alert>
            ) : null}

            {isLoadingProjects && projectCards.length === 0 ? (
              <p className="text-sm text-muted-foreground">Loading project ideas…</p>
            ) : null}

            {!isLoadingProjects && projectCards.length === 0 ? (
              <p className="text-sm text-muted-foreground">No project ideas yet. Run a diagnosis first, or start the backend.</p>
            ) : null}

            <div className="grid gap-3 md:grid-cols-2">
              {projectCards.map((p) => {
                const match = computeStableMatch(p.id, readinessScore);

                return (
                  <div key={p.id} className="group rounded-xl border border-border bg-background p-4 transition-smooth hover:border-accent hover:shadow-md">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-primary text-sm font-bold text-primary-foreground">
                          {p.title.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{p.title}</p>
                          <p className="text-xs text-muted-foreground">{p.domain} · {p.difficulty}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Match</p>
                        <p className="text-lg font-bold text-accent">{match}%</p>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" /> {p.matchReason}
                    </div>

                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {p.requiredSkills.slice(0, 6).map((t) => (
                        <span key={t} className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{t}</span>
                      ))}
                    </div>

                    <div className="mt-4 flex items-center gap-2">
                      <Button
                        size="sm"
                        className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90"
                        onClick={() => setProjectTitle(p.title)}
                      >
                        Select <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                      </Button>
                      <Button variant="outline" size="icon" className="h-9 w-9 shrink-0 border-border">
                        <Heart className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Progress update */}
        <Card className="border-border shadow-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-base">Progress update</CardTitle>
              <Button
                className="bg-accent text-accent-foreground hover:bg-accent/90"
                onClick={handleSubmitProgress}
                disabled={isSubmitting}
              >
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isSubmitting ? "Analyzing…" : "Analyze progress"}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {submitError ? (
              <Alert variant="destructive">
                <AlertTitle>Progress analysis failed</AlertTitle>
                <AlertDescription>{submitError}</AlertDescription>
              </Alert>
            ) : null}

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="pfe-projectTitle">Project title</Label>
                <Input
                  id="pfe-projectTitle"
                  value={projectTitle}
                  onChange={(event) => setProjectTitle(event.target.value)}
                  placeholder="e.g., AI-powered study planner"
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pfe-completedTasks">Completed tasks (comma or newline separated)</Label>
                <Textarea
                  id="pfe-completedTasks"
                  value={completedTasksText}
                  onChange={(event) => setCompletedTasksText(event.target.value)}
                  placeholder="e.g., Built wireframes\nImplemented login"
                  className="min-h-24"
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pfe-blockers">Blockers (comma or newline separated)</Label>
                <Textarea
                  id="pfe-blockers"
                  value={blockersText}
                  onChange={(event) => setBlockersText(event.target.value)}
                  placeholder="e.g., Dataset access, Mentor feedback"
                  className="min-h-24"
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="pfe-nextGoals">Next goals (comma or newline separated)</Label>
                <Textarea
                  id="pfe-nextGoals"
                  value={nextGoalsText}
                  onChange={(event) => setNextGoalsText(event.target.value)}
                  placeholder="e.g., Finish prototype v1, Prepare evaluation plan"
                  className="min-h-24"
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="pfe-notes">Notes</Label>
                <Textarea
                  id="pfe-notes"
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Optional context"
                  className="min-h-24"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {feedback ? (
              <div className="rounded-xl border border-border bg-background p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Latest feedback</p>
                    <p className="mt-1 text-sm text-muted-foreground">{feedback.progressAssessment}</p>
                  </div>
                  <Badge
                    className={
                      feedback.riskLevel === "low"
                        ? "border-0 bg-success/15 text-success"
                        : feedback.riskLevel === "medium"
                        ? "border-0 bg-warning-soft text-warning"
                        : "border-0 bg-destructive-soft text-destructive"
                    }
                  >
                    Risk: {feedback.riskLevel}
                  </Badge>
                </div>

                <div className="mt-3 rounded-xl bg-muted/40 p-3">
                  <p className="text-xs font-semibold text-muted-foreground">Mentor feedback</p>
                  <p className="mt-1 text-sm text-foreground">{feedback.mentorFeedback}</p>
                </div>

                <div className="mt-3">
                  <p className="text-xs font-semibold text-muted-foreground">Recommended actions</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {feedback.recommendedActions.slice(0, 8).map((item) => (
                      <Badge key={item} className="border-0 bg-info-soft text-info">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

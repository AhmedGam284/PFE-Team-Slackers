import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
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
  MapPin,
} from "lucide-react";
import { studentJourney } from "@/lib/studentJourney";
import { useEffect, useMemo, useState } from "react";
import type { DiagnosisAnalyzeData, PfeProgressFeedbackData, PfeProjectIdea, PfeProgressRequest } from "@/lib/apiContracts";
import { getPfeProjects, submitPfeProgress } from "@/lib/pfeApi";
import { loadFromStorage, saveToStorage } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";

const DIAGNOSIS_STORAGE_KEY = "pfe-compass-diagnosis";
const PFE_PROGRESS_STORAGE_KEY = "pfe-compass-pfe-progress";
const PFE_SAVED_PROJECTS_KEY = "pfe-compass-saved-projects";

type MilestoneStatus = "not-started" | "in-progress" | "finished";

type Milestone = {
  step: number;
  title: string;
  direction: string;
  status: MilestoneStatus;
};

const initialMilestones: Milestone[] = [
  {
    step: 1,
    title: "Project charter approved",
    direction: "Confirm scope, stakeholders, and success criteria before moving to research work.",
    status: "finished",
  },
  {
    step: 2,
    title: "Literature review complete",
    direction: "Keep the review tight and tie each source back to your problem statement.",
    status: "finished",
  },
  {
    step: 3,
    title: "Methodology defined",
    direction: "Lock the evaluation method now so the prototype stays measurable.",
    status: "finished",
  },
  {
    step: 4,
    title: "Prototype v1 implementation",
    direction: "Ship one usable slice first, then expand features once the core flow is stable.",
    status: "in-progress",
  },
  {
    step: 5,
    title: "User testing & evaluation",
    direction: "Plan feedback sessions early so testing criteria are ready when the prototype lands.",
    status: "not-started",
  },
  {
    step: 6,
    title: "Final report & defense",
    direction: "Reserve time for evidence, results, and a clean demo narrative.",
    status: "not-started",
  },
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

const nextMilestoneStatus: Record<MilestoneStatus, MilestoneStatus> = {
  "not-started": "in-progress",
  "in-progress": "finished",
  finished: "not-started",
};

const milestoneStatusLabel: Record<MilestoneStatus, string> = {
  "not-started": "Not started",
  "in-progress": "In progress",
  finished: "Finished",
};

const milestoneStatusStyles: Record<MilestoneStatus, string> = {
  "not-started": "border-border bg-background text-muted-foreground",
  "in-progress": "border-accent/30 bg-accent-soft/50 text-accent",
  finished: "border-success/30 bg-success/10 text-success",
};

const isMilestoneUnlocked = (milestonesList: Milestone[], index: number) =>
  index === 0 || milestonesList.slice(0, index).every((milestone) => milestone.status === "finished");

const buildLocalProgressFeedback = (input: PfeProgressRequest): PfeProgressFeedbackData => {
  const completedCount = input.completedTasks.length;
  const blockerCount = input.blockers.length;

  const riskLevel: PfeProgressFeedbackData["riskLevel"] =
    blockerCount >= 3 ? "high" : blockerCount >= 1 ? "medium" : "low";

  const progressAssessment =
    completedCount > 0
      ? `You completed ${completedCount} task(s) and you’re moving forward.`
      : "No completed tasks reported yet - try to ship a small increment this week.";

  const mentorFeedback =
    riskLevel === "high"
      ? "You have multiple blockers - prioritize unblocking work, reduce scope, and ask for help early."
      : riskLevel === "medium"
        ? "You’re progressing, but address blockers quickly to avoid slipping the timeline."
        : "Good momentum - keep delivering small, testable milestones.";

  const recommendedActions = [
    ...(blockerCount ? ["Turn each blocker into a concrete question and assign an owner"] : []),
    "Define the next milestone as a demoable feature",
    "Review your plan for the next 7 days",
  ];

  return {
    progressAssessment,
    riskLevel,
    mentorFeedback,
    recommendedActions,
  };
};

export default function Pfe() {
  const { toast } = useToast();
  const [milestones, setMilestones] = useState<Milestone[]>(initialMilestones);

  const [savedDiagnosis, setSavedDiagnosis] = useState<DiagnosisAnalyzeData | null>(null);
  const [projects, setProjects] = useState<PfeProjectIdea[]>([]);
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
  const [selectedMilestoneIndex, setSelectedMilestoneIndex] = useState(
    initialMilestones.findIndex((milestone) => milestone.status === "in-progress"),
  );
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [savedProjectIds, setSavedProjectIds] = useState<string[]>(() => {
    const stored = loadFromStorage<unknown>(PFE_SAVED_PROJECTS_KEY, {
      validate: isStringArray,
      removeIfInvalid: true,
    });

    return stored ?? [];
  });

  useEffect(() => {
    setSavedDiagnosis(
      loadFromStorage<DiagnosisAnalyzeData>(DIAGNOSIS_STORAGE_KEY, {
        validate: isDiagnosisAnalyzeData,
        removeIfInvalid: true,
      }),
    );

    setFeedback(
      loadFromStorage<PfeProgressFeedbackData>(PFE_PROGRESS_STORAGE_KEY, {
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
      setIsLoadingProjects(true);
      try {
        const data = await getPfeProjects();
        if (!cancelled) setProjects(data);
      } catch {
        if (!cancelled) setProjects([]);
      } finally {
        if (!cancelled) setIsLoadingProjects(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  const reloadProjects = async () => {
    setProjectsError(null);
    setIsLoadingProjects(true);
    try {
      const data = await getPfeProjects();
      setProjects(data);
      toast({ title: "Projects refreshed", description: "Suggested projects were reloaded from the backend." });
    } catch {
      toast({ title: "Using demo projects", description: "Backend projects were unavailable, so demo suggestions are shown." });
    } finally {
      setIsLoadingProjects(false);
    }
  };

  const projectCards = useMemo(() => {
    const diagnosisTracks = savedDiagnosis?.recommendedPfeTracks ?? [];
    const diagnosisCards: PfeProjectIdea[] = diagnosisTracks.slice(0, 4).map((track, index) => {
      const difficulty: PfeProjectIdea["difficulty"] =
        track.matchScore >= 85 ? "advanced" : track.matchScore >= 70 ? "intermediate" : "beginner";

      return {
        id: `diag-${track.matchScore}-${index}-${track.title}`,
        title: track.title,
        domain: "Diagnosis",
        difficulty,
        description: track.reason,
        requiredSkills: (savedDiagnosis?.skillGaps ?? []).slice(0, 6),
        matchReason: `From diagnosis (match ${track.matchScore}%)`,
      };
    });

    // If we have diagnosis tracks, show them first to make the page feel reactive.
    if (diagnosisCards.length) {
      return projects.length ? [...diagnosisCards, ...projects.slice(0, 4)] : diagnosisCards;
    }

    if (projects.length) return projects;

    // fallback to demo data if backend isn't available
    const difficulty: PfeProjectIdea["difficulty"] = readinessScore >= 85 ? "advanced" : readinessScore >= 70 ? "intermediate" : "beginner";

    return studentJourney.topicSuggestions.slice(0, 4).map((topic, index) => ({
      id: `fallback-${index}-${topic.title}`,
      title: topic.title,
      domain: "PFE",
      difficulty,
      description: topic.rationale,
      requiredSkills: topic.tags,
      matchReason: "Fallback suggestions (backend not available)",
    } satisfies PfeProjectIdea));
  }, [projects, readinessScore, savedDiagnosis]);

  const selectedMilestone = milestones[Math.max(selectedMilestoneIndex, 0)] ?? milestones[0];
  const completed = milestones.filter((milestone) => milestone.status === "finished").length;
  const pct = Math.round((completed / milestones.length) * 100);
  const selectedProject = projectCards.find((project) => project.id === selectedProjectId) ?? projectCards[0] ?? null;

  useEffect(() => {
    if (!projectCards.length) {
      setSelectedProjectId(null);
      return;
    }

    if (!selectedProjectId || !projectCards.some((project) => project.id === selectedProjectId)) {
      setSelectedProjectId(projectCards[0].id);
    }
  }, [projectCards, selectedProjectId]);

  const selectProject = (project: PfeProjectIdea) => {
    setSelectedProjectId(project.id);
    setProjectTitle(project.title);
  };

  const toggleSaveProject = (project: PfeProjectIdea) => {
    setSavedProjectIds((current) => {
      const next = current.includes(project.id) ? current.filter((id) => id !== project.id) : [...current, project.id];
      saveToStorage(PFE_SAVED_PROJECTS_KEY, next);
      toast({
        title: current.includes(project.id) ? "Project removed" : "Project saved",
        description: project.title,
      });
      return next;
    });
  };

  const handleMilestoneClick = (index: number) => {
    setMilestones((currentMilestones) =>
      currentMilestones.map((milestone, milestoneIndex) => {
        if (milestoneIndex !== index) return milestone;

        if (!isMilestoneUnlocked(currentMilestones, index)) {
          return milestone;
        }

        return {
          ...milestone,
          status: nextMilestoneStatus[milestone.status],
        };
      }),
    );
    setSelectedMilestoneIndex(index);
  };

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
      saveToStorage(PFE_PROGRESS_STORAGE_KEY, result);
    } catch (err) {
      const localResult = buildLocalProgressFeedback(payload);
      setFeedback(localResult);
      saveToStorage(PFE_PROGRESS_STORAGE_KEY, localResult);
      setSubmitError(null);
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

        {/* Progress */}
        <div className="grid gap-6">
          <Card className="border-border shadow-card">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Project milestones</CardTitle>
                <span className="text-sm font-semibold text-muted-foreground">{completed} / {milestones.length} complete</span>
              </div>
              <Progress value={pct} className="mt-2 h-2" />
            </CardHeader>
            <CardContent className="space-y-2">
              {milestones.map((m, i) => (
                (() => {
                  const unlocked = isMilestoneUnlocked(milestones, i);
                  const isLocked = m.status === "not-started" && !unlocked;

                  return (
                <button
                  key={m.title}
                  type="button"
                  onClick={() => handleMilestoneClick(i)}
                  aria-pressed={i === selectedMilestoneIndex}
                  className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 ${
                    i === selectedMilestoneIndex
                      ? "border-accent bg-accent-soft/50 shadow-sm"
                      : m.status === "in-progress"
                      ? "border-accent/40 bg-accent-soft/40 hover:border-accent/50"
                      : "border-border bg-background hover:border-accent/30"
                  } ${isLocked ? "opacity-70" : ""}`}
                >
                  {m.status === "finished" ? (
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-success" />
                  ) : m.status === "in-progress" ? (
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-accent">
                      <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                    </div>
                  ) : (
                    <Circle className="h-5 w-5 shrink-0 text-muted-foreground/40" />
                  )}
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${m.status === "finished" ? "text-muted-foreground line-through" : "text-foreground"}`}>
                      Step {m.step} · {m.title}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">{m.direction}</p>
                  </div>
                  {i === selectedMilestoneIndex ? (
                    <Badge className="border-0 bg-accent text-accent-foreground">Selected</Badge>
                  ) : null}
                  {isLocked ? (
                    <Badge className="border-0 bg-muted text-muted-foreground">Locked</Badge>
                  ) : null}
                  <Badge className={`border-0 ${milestoneStatusStyles[m.status]}`}>
                    {milestoneStatusLabel[m.status]}
                  </Badge>
                </button>
                  );
                })()
              ))}

              <div className="mt-4 rounded-xl border border-accent/20 bg-accent-soft/30 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-accent">Selected milestone</p>
                <p className="mt-1 text-sm font-semibold text-foreground">Step {selectedMilestone.step} · {selectedMilestone.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{selectedMilestone.direction}</p>
                <div className="mt-3">
                  <Badge className={`border-0 ${milestoneStatusStyles[selectedMilestone.status]}`}>
                    {milestoneStatusLabel[selectedMilestone.status]}
                  </Badge>
                </div>
                {!isMilestoneUnlocked(milestones, selectedMilestoneIndex) && selectedMilestone.status === "not-started" ? (
                  <p className="mt-3 text-xs text-muted-foreground">
                    This step is locked until all previous steps are finished.
                  </p>
                ) : null}
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
              <Button variant="ghost" size="sm" className="text-accent hover:text-accent" onClick={reloadProjects} disabled={isLoadingProjects}>
                {isLoadingProjects ? "Refreshing..." : "Refresh suggestions"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {selectedProject ? (
              <div className="mb-4 rounded-xl border border-info/20 bg-info-soft/20 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-info">Selected project</p>
                    <p className="mt-1 text-base font-semibold text-foreground">{selectedProject.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{selectedProject.description}</p>
                  </div>
                  <Badge className="border-0 bg-info text-info-foreground">Ready for progress update</Badge>
                </div>
              </div>
            ) : null}

            {isLoadingProjects && projectCards.length === 0 ? (
              <p className="text-sm text-muted-foreground">Loading project ideas…</p>
            ) : null}

            <div className="grid gap-3 md:grid-cols-2">
              {projectCards.map((p) => {
                const isSelectedProject = selectedProjectId === p.id;
                const diagMatchToken = p.id.startsWith("diag-") ? Number(p.id.split("-")[1]) : NaN;
                const match = Number.isFinite(diagMatchToken) ? diagMatchToken : computeStableMatch(p.id, readinessScore);

                return (
                  <div
                    key={p.id}
                    role="button"
                    tabIndex={0}
                    aria-pressed={isSelectedProject}
                    onClick={() => selectProject(p)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        selectProject(p);
                      }
                    }}
                    className={`group rounded-xl border p-4 transition-smooth hover:border-accent hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 ${
                      isSelectedProject ? "border-accent bg-accent-soft/30 shadow-sm" : "border-border bg-background"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-primary text-sm font-bold text-primary-foreground">
                          {p.title.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{p.title}</p>
                          <p className="text-xs text-muted-foreground">{p.domain} · {p.difficulty}</p>
                          <p className="mt-1 text-sm text-muted-foreground">{p.description}</p>
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

                    {isSelectedProject ? (
                      <div className="mt-3 flex items-center gap-2">
                        <Badge className="border-0 bg-accent text-accent-foreground">Selected</Badge>
                        <span className="text-xs text-muted-foreground">This project will be used in the progress form below.</span>
                      </div>
                    ) : null}

                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {p.requiredSkills.slice(0, 6).map((t) => (
                        <span key={t} className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{t}</span>
                      ))}
                    </div>

                    <div className="mt-4 flex items-center gap-2">
                      <Button
                        size="sm"
                        className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90"
                        onClick={(event) => {
                          event.stopPropagation();
                          selectProject(p);
                        }}
                      >
                        {isSelectedProject ? "Selected" : "Select"} <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-9 w-9 shrink-0 border-border"
                        aria-label={savedProjectIds.includes(p.id) ? "Unsave project" : "Save project"}
                        onClick={(event) => {
                          event.stopPropagation();
                          toggleSaveProject(p);
                        }}
                      >
                        <Heart className={`h-4 w-4 ${savedProjectIds.includes(p.id) ? "fill-current text-destructive" : ""}`} />
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
            ) : !isSubmitting && !submitError ? (
              <p className="text-sm text-muted-foreground">No progress feedback yet — fill the form and click <strong>Analyze progress</strong>.</p>
            ) : null}

            {selectedProject ? (
              <div className="rounded-xl border border-border bg-muted/20 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Using selected project</p>
                <p className="mt-1 text-sm font-semibold text-foreground">{selectedProject.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{selectedProject.description}</p>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

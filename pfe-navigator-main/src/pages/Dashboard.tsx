import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  Circle,
  Lightbulb,
  Mail,
  MessageSquare,
  Sparkles,
  TrendingUp,
  GraduationCap,
  UserCheck,
} from "lucide-react";
import { studentJourney } from "@/lib/studentJourney";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/auth";
import { useEffect, useState } from "react";
import type { DiagnosisAnalyzeData } from "@/lib/apiContracts";
import { loadFromStorage, STORAGE_KEYS } from "@/lib/storage";

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

const readinessLevelFromScore = (score: number) =>
  score >= 85 ? "Advanced" : score >= 70 ? "Strong" : "Developing";

const tasks = [
  { title: "Finalize PFE problem statement", due: "Today", priority: "high", done: false },
  { title: "Mentor alignment meeting", due: studentJourney.assignedMentor.nextSlot, priority: "med", done: false },
  { title: "Upload senior-year transcript", due: "In 2 days", priority: "med", done: false },
  { title: "Year 1-2 baseline review", due: "Done", priority: "low", done: true },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [savedDiagnosis, setSavedDiagnosis] = useState<DiagnosisAnalyzeData | null>(null);

  useEffect(() => {
    setSavedDiagnosis(
      loadFromStorage<DiagnosisAnalyzeData>(STORAGE_KEYS.diagnosis, {
        validate: isDiagnosisAnalyzeData,
        removeIfInvalid: true,
      }),
    );
  }, []);

  if (user?.role === "mentor") {
    return <Navigate to="/mentor-dashboard" replace />;
  }

  const readinessScore = savedDiagnosis?.readinessScore ?? studentJourney.readinessScore;
  const readinessLevel = savedDiagnosis ? readinessLevelFromScore(readinessScore) : studentJourney.readinessLevel;
  const mentorAdvice = savedDiagnosis?.mentorAdvice;
  const firstTrackTitle = savedDiagnosis?.recommendedPfeTracks?.[0]?.title;
  const firstNextStep = savedDiagnosis?.recommendedNextSteps?.[0];

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Welcome */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground md:text-3xl">Welcome back, {user?.name ?? "Student"} 👋</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Tracking from Year 1 to PFE with a unified academic score and mentor guidance.
            </p>
          </div>
          <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
            <Sparkles className="mr-2 h-4 w-4" /> Get AI insight
          </Button>
        </div>

        {/* KPI cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="overflow-hidden border-border shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">Academic journey progress</p>
                <TrendingUp className="h-4 w-4 text-success" />
              </div>
              <p className="mt-3 text-4xl font-bold text-foreground">{studentJourney.overallJourneyProgress}%</p>
              <Progress value={studentJourney.overallJourneyProgress} className="mt-4 h-2" />
              <p className="mt-2 text-xs text-muted-foreground">
                {studentJourney.completedStages} of {studentJourney.stages.length} stages completed
              </p>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-border bg-gradient-primary text-primary-foreground shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium opacity-80">Readiness score</p>
                <Badge className="border-0 bg-accent/20 text-accent">AI</Badge>
              </div>
              <p className="mt-3 text-4xl font-bold">
                {readinessScore}
                <span className="text-2xl opacity-60">/100</span>
              </p>
              <Progress value={readinessScore} className="mt-4 h-2 bg-white/10" />
              <p className="mt-2 text-xs opacity-70">Level: {readinessLevel}</p>

              {savedDiagnosis ? (
                <div className="mt-4 space-y-2 rounded-xl bg-white/10 p-3 text-xs backdrop-blur-sm">
                  <div>
                    <p className="font-semibold opacity-90">Mentor advice</p>
                    <p className="mt-1 opacity-80">{mentorAdvice}</p>
                  </div>

                  {firstTrackTitle ? (
                    <p className="opacity-80">
                      <span className="font-semibold opacity-90">Track:</span> {firstTrackTitle}
                    </p>
                  ) : null}

                  {firstNextStep ? (
                    <p className="opacity-80">
                      <span className="font-semibold opacity-90">Next step:</span> {firstNextStep}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-border shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">Academic score average</p>
                <GraduationCap className="h-4 w-4 text-info" />
              </div>
              <p className="mt-3 text-4xl font-bold text-foreground">{studentJourney.academicAverage20}<span className="text-2xl text-muted-foreground">/20</span></p>
              <div className="mt-4 flex items-center gap-1.5">
                <span className="h-2 flex-1 rounded-full bg-success" />
                <span className="h-2 flex-1 rounded-full bg-success" />
                <span className="h-2 flex-1 rounded-full bg-success" />
                <span className="h-2 flex-1 rounded-full bg-info" />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">Trend since Year 1: +{studentJourney.scoreTrend} pts</p>
            </CardContent>
          </Card>
        </div>

        {/* Academic timeline */}
        <Card className="border-border shadow-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Academic progression timeline</CardTitle>
              <Badge className="border-0 bg-info-soft text-info">Year 1 → PFE</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-4">
              {studentJourney.stages.map((stage) => (
                <div
                  key={stage.id}
                  className={`rounded-xl border p-4 ${
                    stage.status === "current"
                      ? "border-accent/40 bg-accent-soft/40"
                      : stage.status === "completed"
                      ? "border-border bg-background"
                      : "border-border bg-muted/40"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-foreground">{stage.label}</p>
                    {stage.status === "completed" ? (
                      <CheckCircle2 className="h-4 w-4 text-success" />
                    ) : stage.status === "current" ? (
                      <Calendar className="h-4 w-4 text-accent" />
                    ) : (
                      <Circle className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{stage.year}</p>
                  <p className="mt-2 text-2xl font-bold text-foreground">{stage.gpa20}<span className="text-sm text-muted-foreground">/20</span></p>
                  <Progress value={Math.round((stage.gpa20 / 20) * 100)} className="mt-2 h-1.5" />
                  <p className="mt-2 text-xs text-muted-foreground">{stage.highlights[0]}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Main grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Tasks */}
          <Card className="border-border shadow-card lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-base">Upcoming tasks & deadlines</CardTitle>
              <Button variant="ghost" size="sm" className="text-accent hover:text-accent">View all <ArrowUpRight className="ml-1 h-3.5 w-3.5" /></Button>
            </CardHeader>
            <CardContent className="space-y-2">
              {tasks.map((t) => (
                <div key={t.title} className="flex items-center gap-3 rounded-xl border border-border bg-background p-3 transition-smooth hover:border-accent/40 hover:bg-muted/30">
                  {t.done ? <CheckCircle2 className="h-5 w-5 shrink-0 text-success" /> : <Circle className="h-5 w-5 shrink-0 text-muted-foreground" />}
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-medium ${t.done ? "text-muted-foreground line-through" : "text-foreground"}`}>{t.title}</p>
                    <p className="text-xs text-muted-foreground">{t.due}</p>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      t.priority === "high"
                        ? "border-destructive/30 bg-destructive-soft text-destructive"
                        : t.priority === "med"
                        ? "border-warning/30 bg-warning-soft text-warning"
                        : "border-border bg-muted text-muted-foreground"
                    }
                  >
                    {t.priority === "high" ? "High" : t.priority === "med" ? "Medium" : "Done"}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Mentor */}
          <Card className="border-border shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Recommended mentor</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Avatar className="h-14 w-14">
                  <AvatarFallback className="bg-gradient-accent text-base text-accent-foreground">{studentJourney.assignedMentor.initials}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-foreground">{studentJourney.assignedMentor.name}</p>
                  <p className="text-xs text-muted-foreground">{studentJourney.assignedMentor.specialty}</p>
                  <Badge className="mt-1 border-0 bg-success/15 text-success hover:bg-success/15">● {studentJourney.assignedMentor.availability} availability</Badge>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" className="border-border">
                  <MessageSquare className="mr-1.5 h-3.5 w-3.5" /> Chat
                </Button>
                <Button variant="outline" size="sm" className="border-border">
                  <Mail className="mr-1.5 h-3.5 w-3.5" /> Email
                </Button>
              </div>
              <div className="mt-4 rounded-xl bg-muted/50 p-3">
                <p className="text-xs font-semibold text-muted-foreground">Next sync</p>
                <p className="mt-0.5 text-sm font-medium text-foreground">{studentJourney.assignedMentor.nextSlot}</p>
                <p className="mt-1 text-xs text-muted-foreground">Fit score: {studentJourney.assignedMentor.fit}%</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Suggested topics */}
          <Card className="border-border shadow-card lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-soft text-accent">
                  <Lightbulb className="h-4 w-4" />
                </div>
                <CardTitle className="text-base">PFE topic suggestions from full academic run</CardTitle>
              </div>
              <Button variant="ghost" size="sm" className="text-accent hover:text-accent">Refresh suggestions</Button>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-3">
                {studentJourney.topicSuggestions.map((topic) => (
                  <div key={topic.title} className="group cursor-pointer rounded-xl border border-border bg-background p-4 transition-smooth hover:border-accent hover:shadow-md">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-foreground">{topic.title}</p>
                      <Badge className="ml-2 shrink-0 border-0 bg-accent text-accent-foreground">{topic.fit}%</Badge>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">{topic.rationale}</p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {topic.tags.map((tag) => (
                        <span key={tag} className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{tag}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Mentor ranking */}
          <Card className="border-border shadow-card">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-info-soft text-info">
                  <UserCheck className="h-4 w-4" />
                </div>
                <CardTitle className="text-base">Mentor fit ranking</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {studentJourney.mentorRanking.map((mentor) => (
                <div key={mentor.name} className="rounded-xl border border-border bg-background p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{mentor.name}</p>
                      <p className="text-xs text-muted-foreground">{mentor.specialty}</p>
                    </div>
                    <Badge className="border-0 bg-info-soft text-info">{mentor.fit}%</Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{mentor.reason}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}

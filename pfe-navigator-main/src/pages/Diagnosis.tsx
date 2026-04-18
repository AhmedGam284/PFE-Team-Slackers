import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Brain, Lightbulb, Sparkles, TrendingUp, BookOpen, Code2, MessagesSquare, ClipboardList } from "lucide-react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";
import { studentJourney } from "@/lib/studentJourney";

const skills = [
  {
    name: "Technical level",
    value: studentJourney.domainScores.software,
    icon: Code2,
    desc: "Built from Year 1 foundations through senior-year engineering modules.",
  },
  {
    name: "Research skills",
    value: studentJourney.domainScores.research,
    icon: BookOpen,
    desc: "Estimated from cumulative reports, literature work, and evaluation quality.",
  },
  {
    name: "Communication",
    value: studentJourney.domainScores.communication,
    icon: MessagesSquare,
    desc: "Reflects presentation quality and mentor feedback across all years.",
  },
  {
    name: "Project planning",
    value: studentJourney.domainScores.project,
    icon: ClipboardList,
    desc: "Combines planning reliability, milestone consistency, and leadership signals.",
  },
];

const radarData = [
  { skill: "Technical", value: studentJourney.domainScores.software, full: 82 },
  { skill: "Research", value: studentJourney.domainScores.research, full: 78 },
  { skill: "Comms", value: studentJourney.domainScores.communication, full: 80 },
  { skill: "Planning", value: studentJourney.domainScores.project, full: 79 },
  { skill: "AI", value: studentJourney.domainScores.ai, full: 81 },
  { skill: "Consistency", value: studentJourney.consistencyIndex, full: 84 },
];

const recommendations = [
  {
    title: "Reinforce weakest domain this month",
    desc: "Prioritize research methodology to boost your readiness score trend before defense.",
    tag: "Priority",
    tagColor: "destructive",
  },
  {
    title: `Top PFE direction: ${studentJourney.topicSuggestions[0].title}`,
    desc: `Fit score ${studentJourney.topicSuggestions[0].fit}% based on your Year 1-to-PFE trajectory.`,
    tag: "Career boost",
    tagColor: "accent",
  },
  {
    title: `Recommended mentor: ${studentJourney.assignedMentor.name}`,
    desc: `Mentor fit ${studentJourney.assignedMentor.fit}% from expertise alignment and availability.`,
    tag: "Quick win",
    tagColor: "info",
  },
];

export default function Diagnosis() {
  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-accent" />
              <span className="text-sm font-semibold uppercase tracking-wider text-accent">AI Diagnosis</span>
            </div>
            <h1 className="mt-1 text-2xl font-bold text-foreground md:text-3xl">Your skill profile</h1>
            <p className="mt-1 text-sm text-muted-foreground">Evaluated from cumulative performance across Year 1, Year 2, Senior Year, and PFE</p>
          </div>
          <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
            <Sparkles className="mr-2 h-4 w-4" /> Re-run diagnosis
          </Button>
        </div>

        {/* Overall + Radar */}
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="overflow-hidden border-border bg-gradient-primary text-primary-foreground shadow-card">
            <CardContent className="p-6">
              <p className="text-sm opacity-80">Overall AI score</p>
              <div className="mt-2 flex items-baseline gap-2">
                <p className="text-5xl font-bold">{studentJourney.readinessScore}</p>
                <span className="text-lg opacity-60">/ 100</span>
              </div>
              <Badge className="mt-3 border-0 bg-accent text-accent-foreground">{studentJourney.readinessLevel} level</Badge>
              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp className="h-4 w-4 text-accent" />
                  <span className="opacity-90">+{studentJourney.scoreTrend} points since Year 1 baseline</span>
                </div>
                <div className="rounded-xl bg-white/10 p-3 text-sm backdrop-blur-sm">
                  Your academic average is <strong>{studentJourney.academicAverage20}/20</strong> with consistency index <strong>{studentJourney.consistencyIndex}%</strong>.
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border shadow-card lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Competency radar</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <RadarChart data={radarData} outerRadius="75%">
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="skill" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar name="You" dataKey="value" stroke="hsl(var(--accent))" fill="hsl(var(--accent))" fillOpacity={0.35} strokeWidth={2} />
                  <Radar name="Cohort" dataKey="full" stroke="hsl(var(--info))" fill="hsl(var(--info))" fillOpacity={0.05} strokeDasharray="4 4" />
                </RadarChart>
              </ResponsiveContainer>
              <div className="mt-2 flex justify-center gap-6 text-xs">
                <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-accent" /> You</div>
                <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-info" /> Cohort target</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Skill breakdown */}
        <Card className="border-border shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Skill breakdown</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            {skills.map((s) => (
              <div key={s.name} className="rounded-xl border border-border bg-background p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-soft text-accent">
                      <s.icon className="h-4 w-4" />
                    </div>
                    <p className="font-semibold text-foreground">{s.name}</p>
                  </div>
                  <span className="text-2xl font-bold text-foreground">{s.value}<span className="text-sm text-muted-foreground">%</span></span>
                </div>
                <Progress value={s.value} className="mt-3 h-2" />
                <p className="mt-2 text-xs text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Card className="border-border shadow-card">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-soft text-accent">
                <Lightbulb className="h-4 w-4" />
              </div>
              <CardTitle className="text-base">Personalized recommendations</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {recommendations.map((r) => (
              <div key={r.title} className="flex items-start gap-4 rounded-xl border border-border bg-background p-4 transition-smooth hover:border-accent/40">
                <div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-gradient-accent shadow-glow" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-foreground">{r.title}</p>
                    <Badge
                      className={
                        r.tagColor === "destructive"
                          ? "border-0 bg-destructive-soft text-destructive"
                          : r.tagColor === "accent"
                          ? "border-0 bg-accent-soft text-accent"
                          : "border-0 bg-info-soft text-info"
                      }
                    >
                      {r.tag}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{r.desc}</p>
                </div>
                <Button variant="outline" size="sm" className="border-border">View</Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

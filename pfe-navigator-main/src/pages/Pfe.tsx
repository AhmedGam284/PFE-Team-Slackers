import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Award, Building2, CheckCircle2, Circle, ExternalLink, Heart, MapPin, Mail, MessageSquare, Activity } from "lucide-react";

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

const companies = [
  { name: "Nexora AI", role: "ML Engineer Intern", location: "Casablanca · Hybrid", match: 94, tags: ["AI", "Python", "MLOps"] },
  { name: "Datalume", role: "Data Scientist Trainee", location: "Rabat · On-site", match: 89, tags: ["Data", "Research"] },
  { name: "OrbitTech", role: "AI Research Intern", location: "Remote · EU", match: 86, tags: ["NLP", "Research"] },
  { name: "Veridia Labs", role: "Junior ML Engineer", location: "Tangier · Hybrid", match: 81, tags: ["ML", "Cloud"] },
];

export default function Pfe() {
  const completed = milestones.filter((m) => m.done).length;
  const pct = Math.round((completed / milestones.length) * 100);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-accent">Project · 2025/2026</p>
            <h1 className="mt-1 text-2xl font-bold text-foreground md:text-3xl">Adaptive Learning Paths with AI</h1>
            <p className="mt-1 text-sm text-muted-foreground">Tracking your final-year project in real time.</p>
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
                  <AvatarFallback className="bg-gradient-accent text-base text-accent-foreground">DK</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="font-semibold text-foreground">Dr. Karim Belhaj</p>
                  <p className="text-xs text-muted-foreground">Faculty of Engineering</p>
                  <p className="text-xs text-muted-foreground">AI · NLP · Education</p>
                </div>
              </div>
              <div className="mt-4 space-y-2 rounded-xl bg-muted/50 p-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last sync</span>
                  <span className="font-medium text-foreground">2 days ago</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Next meeting</span>
                  <span className="font-medium text-foreground">Tomorrow · 14:00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Feedback rating</span>
                  <span className="font-medium text-success">★ 4.9</span>
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
                <CardTitle className="text-base">Suggested companies</CardTitle>
              </div>
              <Button variant="ghost" size="sm" className="text-accent hover:text-accent">See all matches</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2">
              {companies.map((c) => (
                <div key={c.name} className="group rounded-xl border border-border bg-background p-4 transition-smooth hover:border-accent hover:shadow-md">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-primary text-sm font-bold text-primary-foreground">
                        {c.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{c.name}</p>
                        <p className="text-xs text-muted-foreground">{c.role}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Match</p>
                      <p className="text-lg font-bold text-accent">{c.match}%</p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" /> {c.location}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {c.tags.map((t) => (
                      <span key={t} className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{t}</span>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <Button size="sm" className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90">
                      Apply <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                    </Button>
                    <Button variant="outline" size="icon" className="h-9 w-9 shrink-0 border-border">
                      <Heart className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

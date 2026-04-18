import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowUpRight, Calendar, CheckCircle2, Circle, Lightbulb, Mail, MessageSquare, Sparkles, TrendingUp } from "lucide-react";

const tasks = [
  { title: "Submit project charter", due: "Today", priority: "high", done: false },
  { title: "Meet supervisor (weekly sync)", due: "Tomorrow · 14:00", priority: "med", done: false },
  { title: "Complete literature review draft", due: "In 3 days", priority: "med", done: false },
  { title: "Pass research-methods assessment", due: "Done", priority: "low", done: true },
];

const topics = [
  { title: "AI-driven adaptive learning paths", match: 96, tags: ["ML", "EdTech"] },
  { title: "NLP for academic plagiarism detection", match: 89, tags: ["NLP", "Research"] },
  { title: "Computer vision for lab safety", match: 84, tags: ["CV", "IoT"] },
];

export default function Dashboard() {
  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Welcome */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground md:text-3xl">Welcome back, Sara 👋</h1>
            <p className="mt-1 text-sm text-muted-foreground">You're 68% through your PFE journey. Keep going!</p>
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
                <p className="text-sm font-medium text-muted-foreground">Overall progress</p>
                <TrendingUp className="h-4 w-4 text-success" />
              </div>
              <p className="mt-3 text-4xl font-bold text-foreground">68%</p>
              <Progress value={68} className="mt-4 h-2" />
              <p className="mt-2 text-xs text-muted-foreground">+12% from last month</p>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-border bg-gradient-primary text-primary-foreground shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium opacity-80">Readiness score</p>
                <Badge className="border-0 bg-accent/20 text-accent">AI</Badge>
              </div>
              <p className="mt-3 text-4xl font-bold">82<span className="text-2xl opacity-60">/100</span></p>
              <Progress value={82} className="mt-4 h-2 bg-white/10" />
              <p className="mt-2 text-xs opacity-70">Strong technical foundation</p>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-border shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">Days to defense</p>
                <Calendar className="h-4 w-4 text-info" />
              </div>
              <p className="mt-3 text-4xl font-bold text-foreground">47</p>
              <div className="mt-4 flex items-center gap-1.5">
                <span className="h-2 flex-1 rounded-full bg-success" />
                <span className="h-2 flex-1 rounded-full bg-success" />
                <span className="h-2 flex-1 rounded-full bg-warning" />
                <span className="h-2 flex-1 rounded-full bg-muted" />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">Phase 3 of 4 · Implementation</p>
            </CardContent>
          </Card>
        </div>

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
              <CardTitle className="text-base">Your mentor</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Avatar className="h-14 w-14">
                  <AvatarFallback className="bg-gradient-accent text-base text-accent-foreground">DK</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-foreground">Dr. Karim Belhaj</p>
                  <p className="text-xs text-muted-foreground">AI & Machine Learning</p>
                  <Badge className="mt-1 border-0 bg-success/15 text-success hover:bg-success/15">● Available</Badge>
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
                <p className="mt-0.5 text-sm font-medium text-foreground">Tomorrow · 14:00</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Suggested topics */}
        <Card className="border-border shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-soft text-accent">
                <Lightbulb className="h-4 w-4" />
              </div>
              <CardTitle className="text-base">AI-suggested PFE topics</CardTitle>
            </div>
            <Button variant="ghost" size="sm" className="text-accent hover:text-accent">Refresh suggestions</Button>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-3">
              {topics.map((t) => (
                <div key={t.title} className="group cursor-pointer rounded-xl border border-border bg-background p-4 transition-smooth hover:border-accent hover:shadow-md">
                  <div className="flex items-start justify-between">
                    <p className="text-sm font-semibold text-foreground">{t.title}</p>
                    <Badge className="ml-2 shrink-0 border-0 bg-accent text-accent-foreground">{t.match}%</Badge>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {t.tags.map((tag) => (
                      <span key={tag} className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{tag}</span>
                    ))}
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

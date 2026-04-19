import { Navigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users, CalendarCheck, MessageSquare, Sparkles, TrendingUp, GraduationCap } from "lucide-react";
import { useAuth } from "@/context/auth";

const mentees = [
  { name: "Sara Amrani", topic: "Adaptive Learning Analytics", status: "In progress", readiness: 82 },
  { name: "Youssef El Amrani", topic: "NLP for research support", status: "Needs review", readiness: 68 },
  { name: "Nadia Bensaid", topic: "MLOps deployment pipeline", status: "Ready for feedback", readiness: 88 },
];

export default function MentorDashboard() {
  const { user } = useAuth();

  if (user?.role !== "mentor") {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-accent">Mentor dashboard</p>
            <h1 className="mt-1 text-2xl font-bold text-foreground md:text-3xl">Welcome, {user?.name ?? "mentor"}</h1>
            <p className="mt-1 text-sm text-muted-foreground">Review mentees, track readiness, and keep PFE guidance aligned.</p>
          </div>
          <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
            <Link to="/mentor-hub?tab=mail">
              <Sparkles className="mr-2 h-4 w-4" /> Review all mentees
            </Link>
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-border shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">Assigned students</p>
                <Users className="h-4 w-4 text-accent" />
              </div>
              <p className="mt-3 text-4xl font-bold text-foreground">12</p>
              <p className="mt-2 text-xs text-muted-foreground">3 in critical review, 9 on track</p>
            </CardContent>
          </Card>

          <Card className="border-border shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">Sessions this week</p>
                <CalendarCheck className="h-4 w-4 text-info" />
              </div>
              <p className="mt-3 text-4xl font-bold text-foreground">8</p>
              <Progress value={80} className="mt-4 h-2" />
              <p className="mt-2 text-xs text-muted-foreground">2 sessions left until Friday</p>
            </CardContent>
          </Card>

          <Card className="border-border shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">Avg mentee readiness</p>
                <TrendingUp className="h-4 w-4 text-success" />
              </div>
              <p className="mt-3 text-4xl font-bold text-foreground">79<span className="text-2xl text-muted-foreground">/100</span></p>
              <p className="mt-2 text-xs text-muted-foreground">Across your active student cohort</p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-border shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Your mentees</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-3">
            {mentees.map((mentee) => (
              <div key={mentee.name} className="rounded-xl border border-border bg-background p-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-11 w-11">
                    <AvatarFallback className="bg-gradient-primary text-sm text-primary-foreground">
                      {mentee.name
                        .split(" ")
                        .map((part) => part[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-foreground">{mentee.name}</p>
                    <p className="text-xs text-muted-foreground">{mentee.topic}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <Badge className="border-0 bg-info-soft text-info">{mentee.status}</Badge>
                  <span className="text-sm font-semibold text-foreground">{mentee.readiness}%</span>
                </div>
                <Progress value={mentee.readiness} className="mt-3 h-2" />
                <div className="mt-4 flex gap-2">
                  <Button asChild variant="outline" size="sm" className="flex-1 border-border">
                    <Link to="/mentor-hub?tab=chat">
                      <MessageSquare className="mr-1.5 h-3.5 w-3.5" /> Message
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="sm" className="flex-1 border-border">
                    <Link to="/mentor-hub?tab=supervisor">
                      <GraduationCap className="mr-1.5 h-3.5 w-3.5" /> Review
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

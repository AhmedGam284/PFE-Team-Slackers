import { AppLayout } from "@/components/AppLayout";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Award, BookOpen, Calendar, Edit3, GraduationCap, Mail, MapPin, Save, Trophy, UserCheck } from "lucide-react";
import { useAuth } from "@/context/auth";
import { studentJourney } from "@/lib/studentJourney";
import { useMemo, useState } from "react";

const activity = [
  { title: "Completed Year 2 evaluation", detail: "Academic consistency improved to 92%.", icon: GraduationCap },
  { title: "Matched with mentor", detail: `${studentJourney.assignedMentor.name} selected with ${studentJourney.assignedMentor.fit}% fit.`, icon: UserCheck },
  { title: "PFE topic refined", detail: studentJourney.topicSuggestions[0].title, icon: BookOpen },
];

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name ?? "Sara Amrani");
  const [email, setEmail] = useState(user?.email ?? "student@example.com");
  const [campus, setCampus] = useState("Engineering faculty · Year 5");
  const [bio, setBio] = useState(
    "Focused on AI-driven final year projects with strong interest in research, deployment, and student success.",
  );

  const initials = useMemo(
    () =>
      name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase() || "SA",
    [name],
  );

  const handleSave = () => {
    updateProfile({ name: name.trim(), email: email.trim().toLowerCase(), role: user?.role ?? "student" }, user?.email);
    setIsEditing(false);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-accent">Profile</p>
            <h1 className="mt-1 text-2xl font-bold text-foreground md:text-3xl">Student profile overview</h1>
            <p className="mt-1 text-sm text-muted-foreground">Your academic run, progress level, and PFE direction in one place.</p>
          </div>
          <Dialog open={isEditing} onOpenChange={setIsEditing}>
            <DialogTrigger asChild>
              <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
                <Edit3 className="mr-2 h-4 w-4" /> Edit profile
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Edit profile</DialogTitle>
                <DialogDescription>
                  Update your profile details locally. These changes will update the header and your saved session.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-2 md:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="profile-name" className="text-sm font-medium text-foreground">Full name</label>
                  <Input id="profile-name" value={name} onChange={(event) => setName(event.target.value)} />
                </div>
                <div className="space-y-2">
                  <label htmlFor="profile-email" className="text-sm font-medium text-foreground">Email</label>
                  <Input id="profile-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label htmlFor="profile-campus" className="text-sm font-medium text-foreground">Campus</label>
                  <Input id="profile-campus" value={campus} onChange={(event) => setCampus(event.target.value)} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label htmlFor="profile-bio" className="text-sm font-medium text-foreground">Bio</label>
                  <Textarea id="profile-bio" value={bio} onChange={(event) => setBio(event.target.value)} className="min-h-28" />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave} className="bg-accent text-accent-foreground hover:bg-accent/90">
                  <Save className="mr-2 h-4 w-4" /> Save changes
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <Card className="border-border shadow-card">
            <CardContent className="space-y-6 p-6">
              <div className="flex items-start gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="bg-gradient-primary text-xl text-primary-foreground">{initials}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <h2 className="text-xl font-bold text-foreground">{user?.name ?? "Sara Amrani"}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{user?.email ?? "student@example.com"}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge className="border-0 bg-muted text-muted-foreground uppercase tracking-wider">{user?.role ?? "student"}</Badge>
                    <Badge className="border-0 bg-accent-soft text-accent">{studentJourney.readinessLevel} level</Badge>
                    <Badge className="border-0 bg-info-soft text-info">{studentJourney.academicAverage20}/20 average</Badge>
                    <Badge className="border-0 bg-success/15 text-success">Mentor matched</Badge>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-border bg-background p-4">
                  <p className="text-xs text-muted-foreground">Current stage</p>
                  <p className="mt-1 text-sm font-semibold text-foreground">PFE phase</p>
                </div>
                <div className="rounded-xl border border-border bg-background p-4">
                  <p className="text-xs text-muted-foreground">Mentor</p>
                  <p className="mt-1 text-sm font-semibold text-foreground">{studentJourney.assignedMentor.name}</p>
                </div>
                <div className="rounded-xl border border-border bg-background p-4">
                  <p className="text-xs text-muted-foreground">Preferred direction</p>
                  <p className="mt-1 text-sm font-semibold text-foreground">{studentJourney.topicSuggestions[0].title}</p>
                </div>
                <div className="rounded-xl border border-border bg-background p-4">
                  <p className="text-xs text-muted-foreground">Readiness score</p>
                  <p className="mt-1 text-sm font-semibold text-foreground">{studentJourney.readinessScore}/100</p>
                </div>
              </div>

              <div className="rounded-2xl bg-muted/40 p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-foreground">Progress across academic run</span>
                  <span className="text-muted-foreground">{studentJourney.overallJourneyProgress}%</span>
                </div>
                <Progress value={studentJourney.overallJourneyProgress} className="mt-3 h-2" />
                <p className="mt-2 text-xs text-muted-foreground">
                  Based on Year 1, Year 2, Senior Year, and current PFE execution.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border-border shadow-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Academic highlights</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2">
                {[
                  { label: "Academic average", value: `${studentJourney.academicAverage20}/20`, icon: Award },
                  { label: "Trend since Year 1", value: `+${studentJourney.scoreTrend} pts`, icon: Trophy },
                  { label: "Consistency index", value: `${studentJourney.consistencyIndex}%`, icon: Calendar },
                  { label: "Best domain", value: "Software Engineering", icon: GraduationCap },
                ].map((item) => (
                  <div key={item.label} className="rounded-xl border border-border bg-background p-4">
                    <item.icon className="h-4 w-4 text-accent" />
                    <p className="mt-2 text-xs text-muted-foreground">{item.label}</p>
                    <p className="mt-1 text-sm font-semibold text-foreground">{item.value}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-border shadow-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Contact and identity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center gap-3 rounded-xl border border-border bg-background p-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-foreground">Email</p>
                    <p className="text-muted-foreground">{user?.email ?? "student@example.com"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl border border-border bg-background p-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-foreground">Campus</p>
                    <p className="text-muted-foreground">{campus}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border shadow-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">About me</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-6 text-muted-foreground">{bio}</p>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card className="border-border shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Recent activity</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-3">
            {activity.map((item) => (
              <div key={item.title} className="rounded-xl border border-border bg-background p-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-soft text-accent">
                  <item.icon className="h-4 w-4" />
                </div>
                <p className="mt-3 text-sm font-semibold text-foreground">{item.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{item.detail}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

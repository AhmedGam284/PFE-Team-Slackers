import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Settings2, Bell, GraduationCap, Save, ShieldCheck } from "lucide-react";
import { useAuth } from "@/context/auth";

export default function SettingsPage() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [mentorAlerts, setMentorAlerts] = useState(true);
  const [reminderAlerts, setReminderAlerts] = useState(true);
  const [preferredTrack, setPreferredTrack] = useState("ai");
  const [language, setLanguage] = useState("en");

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Settings2 className="h-5 w-5 text-accent" />
              <span className="text-sm font-semibold uppercase tracking-wider text-accent">Settings</span>
            </div>
            <h1 className="mt-1 text-2xl font-bold text-foreground md:text-3xl">Account and Preferences</h1>
            <p className="mt-1 text-sm text-muted-foreground">Control profile info, notifications, and recommendation preferences.</p>
          </div>
          <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
            <Save className="mr-2 h-4 w-4" /> Save changes
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="border-border shadow-card lg:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Profile</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="full-name">Full name</Label>
                <Input id="full-name" value={name} onChange={(event) => setName(event.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lang">Interface language</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger id="lang">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="ar">Arabic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Account status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-xl border border-success/30 bg-success/10 p-3">
                <p className="text-sm font-medium text-success">Signed in</p>
                <p className="mt-1 text-xs text-muted-foreground">Your account is active and synchronized locally.</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-foreground">
                <ShieldCheck className="h-4 w-4 text-success" />
                Secure session enabled
              </div>
              <Badge className="w-fit border-0 bg-info-soft text-info">Student plan</Badge>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-border shadow-card">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-accent" />
                <CardTitle className="text-base">Notifications</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-xl border border-border bg-background p-3">
                <div>
                  <p className="text-sm font-medium text-foreground">Weekly digest</p>
                  <p className="text-xs text-muted-foreground">Receive weekly progress and readiness summaries.</p>
                </div>
                <Switch checked={weeklyDigest} onCheckedChange={setWeeklyDigest} />
              </div>
              <div className="flex items-center justify-between rounded-xl border border-border bg-background p-3">
                <div>
                  <p className="text-sm font-medium text-foreground">Mentor alerts</p>
                  <p className="text-xs text-muted-foreground">Get alerts about mentor responses and meeting updates.</p>
                </div>
                <Switch checked={mentorAlerts} onCheckedChange={setMentorAlerts} />
              </div>
              <div className="flex items-center justify-between rounded-xl border border-border bg-background p-3">
                <div>
                  <p className="text-sm font-medium text-foreground">Deadline reminders</p>
                  <p className="text-xs text-muted-foreground">Receive reminder notifications for PFE milestones.</p>
                </div>
                <Switch checked={reminderAlerts} onCheckedChange={setReminderAlerts} />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border shadow-card">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-accent" />
                <CardTitle className="text-base">Academic preferences</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="track">Preferred PFE track</Label>
                <Select value={preferredTrack} onValueChange={setPreferredTrack}>
                  <SelectTrigger id="track">
                    <SelectValue placeholder="Choose a track" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ai">AI and Data</SelectItem>
                    <SelectItem value="software">Software Engineering</SelectItem>
                    <SelectItem value="research">Research and Innovation</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-xl border border-border bg-muted/30 p-3">
                <p className="text-sm font-medium text-foreground">Recommendation engine</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Your preferences influence PFE topic suggestions and mentor assignment ranking.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}

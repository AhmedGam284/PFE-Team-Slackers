import { Link } from "react-router-dom";
import { ArrowRight, Building2, CheckCircle2, GraduationCap, LineChart, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const pillars = [
  {
    icon: LineChart,
    title: "Longitudinal Student Tracking",
    description: "Monitor each student from Year 1 to PFE with a single progression timeline and score trend.",
  },
  {
    icon: GraduationCap,
    title: "Readiness Evaluation",
    description: "Compute readiness from academic records, consistency, and project execution for better interventions.",
  },
  {
    icon: Users,
    title: "Mentor Matching",
    description: "Assign mentors by expertise fit and availability so students get the right support at the right time.",
  },
];

const outcomes = [
  "Earlier detection of at-risk students",
  "Higher-quality PFE topic assignments",
  "Fair and data-driven mentor allocation",
  "Improved defense readiness across cohorts",
];

export default function Universities() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-accent shadow-glow">
              <Building2 className="h-5 w-5 text-accent-foreground" />
            </div>
            <span className="text-lg font-bold text-foreground">PFE Compass for Universities</span>
          </Link>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" className="border-border bg-background/70">
              <Link to="/">Back to home</Link>
            </Button>
            <Button asChild className="bg-primary text-primary-foreground hover:bg-primary-glow">
              <Link to="/signup">Request pilot <ArrowRight className="ml-1.5 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden bg-gradient-hero text-primary-foreground">
        <div className="container relative z-10 py-20 md:py-24">
          <p className="mb-4 inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs backdrop-blur-md">
            Institutional view
          </p>
          <h1 className="max-w-4xl text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
            Give your faculty a data-driven way to guide students from Year 1 to PFE success.
          </h1>
          <p className="mt-6 max-w-3xl text-base text-primary-foreground/80 md:text-lg">
            PFE Compass connects academic trajectory, readiness scoring, and mentor assignment in one platform built for universities.
          </p>
        </div>
        <div className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-info/20 blur-3xl" />
        <div className="absolute -right-20 bottom-0 h-96 w-96 rounded-full bg-accent/20 blur-3xl" />
      </section>

      <section className="container py-16 md:py-20">
        <div className="grid gap-6 md:grid-cols-3">
          {pillars.map((pillar) => (
            <Card key={pillar.title} className="border-border shadow-card">
              <CardHeader>
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft text-accent">
                  <pillar.icon className="h-5 w-5" />
                </div>
                <CardTitle className="text-lg">{pillar.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{pillar.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-muted/30 py-16 md:py-20">
        <div className="container grid gap-10 md:grid-cols-[1.2fr_0.8fr] md:items-start">
          <div>
            <h2 className="text-3xl font-bold text-foreground md:text-4xl">Expected outcomes for your institution</h2>
            <p className="mt-4 text-muted-foreground">
              Use one dashboard for deans, coordinators, and supervisors to align student support with measurable academic progress.
            </p>
          </div>
          <Card className="border-border shadow-card">
            <CardContent className="space-y-3 p-6">
              {outcomes.map((outcome) => (
                <div key={outcome} className="flex items-start gap-2.5 text-sm text-foreground">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                  <span>{outcome}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}

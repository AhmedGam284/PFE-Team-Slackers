import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Brain, Target, Building2, ArrowRight, Sparkles, GraduationCap, ClipboardCheck, Users, Award, Briefcase, UserCheck, CheckCircle2, LogIn, UserPlus } from "lucide-react";
import heroImage from "@/assets/hero-pfe.jpg";

const features = [
  {
    icon: Brain,
    title: "AI Skill Diagnosis",
    desc: "Smart assessment of your technical, research, and soft skills with personalized growth paths.",
    color: "info",
  },
  {
    icon: Target,
    title: "Smart PFE Tracking",
    desc: "Live milestones, mentor sync, and project health signals so nothing slips through.",
    color: "accent",
  },
  {
    icon: Building2,
    title: "Company Matching",
    desc: "Get matched with companies based on your certified competencies and interests.",
    color: "info",
  },
];

const journey = [
  { icon: UserCheck, label: "Registration" },
  { icon: Brain, label: "Diagnosis" },
  { icon: ClipboardCheck, label: "Roadmap" },
  { icon: Users, label: "Supervision" },
  { icon: Award, label: "Certification" },
  { icon: Briefcase, label: "Employment" },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-accent shadow-glow">
              <GraduationCap className="h-5 w-5 text-accent-foreground" />
            </div>
            <span className="text-lg font-bold text-foreground">PFE Compass</span>
          </div>
          <nav className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm text-muted-foreground transition-smooth hover:text-foreground">Features</a>
            <a href="#journey" className="text-sm text-muted-foreground transition-smooth hover:text-foreground">Journey</a>
            <a href="#" className="text-sm text-muted-foreground transition-smooth hover:text-foreground">For universities</a>
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" className="hidden border-border bg-background/70 md:inline-flex">
              <Link to="/signin"><LogIn className="mr-1.5 h-4 w-4" />Sign in</Link>
            </Button>
            <Button asChild className="bg-primary text-primary-foreground hover:bg-primary-glow">
              <Link to="/signup"><UserPlus className="mr-1.5 h-4 w-4" />Sign up</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-hero text-primary-foreground">
        <div className="container relative z-10 grid gap-12 py-20 md:grid-cols-2 md:py-28 lg:py-32">
          <div className="flex flex-col justify-center">
            <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              <span>Powered by adaptive AI · v2.0</span>
            </div>
            <h1 className="text-4xl font-bold leading-tight tracking-tight md:text-5xl lg:text-6xl">
              Your AI companion for the
              <span className="bg-gradient-to-r from-accent to-info bg-clip-text text-transparent"> Final Year Project </span>
              journey
            </h1>
            <p className="mt-6 max-w-xl text-base text-primary-foreground/80 md:text-lg">
              From skill diagnosis to certified employment matching — guided by a smart mentor that understands your goals, supervisors, and the job market.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-accent text-accent-foreground shadow-glow hover:bg-accent/90">
                <Link to="/signup">Start your journey <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/30 bg-white/5 text-primary-foreground hover:bg-white/10">
                <Link to="/signin">See AI diagnosis</Link>
              </Button>
            </div>
            <div className="mt-10 flex flex-wrap gap-6 text-sm">
              {[
                ["12k+", "Active students"],
                ["340+", "Partner companies"],
                ["94%", "Placement rate"],
              ].map(([n, l]) => (
                <div key={l}>
                  <p className="text-2xl font-bold text-accent">{n}</p>
                  <p className="text-xs text-primary-foreground/60">{l}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 -z-10 rounded-3xl bg-accent/20 blur-3xl" />
            <img
              src={heroImage}
              alt="AI education platform interface preview"
              width={1600}
              height={1024}
              className="rounded-3xl border border-white/10 shadow-elegant animate-float"
            />
          </div>
        </div>
        <div className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-info/20 blur-3xl" />
        <div className="absolute -right-20 bottom-0 h-96 w-96 rounded-full bg-accent/20 blur-3xl" />
      </section>

      {/* Features */}
      <section id="features" className="container py-20 md:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-accent">What it does</p>
          <h2 className="mt-3 text-3xl font-bold text-foreground md:text-4xl">Built for the modern student</h2>
          <p className="mt-4 text-muted-foreground">Three intelligent pillars that turn your PFE into a launchpad.</p>
        </div>
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="group rounded-2xl border border-border bg-card p-7 shadow-card transition-smooth hover:-translate-y-1 hover:shadow-elegant">
              <div className={`mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl ${f.color === "accent" ? "bg-accent-soft text-accent" : "bg-info-soft text-info"}`}>
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
              <div className="mt-5 flex items-center gap-1.5 text-sm font-medium text-accent opacity-0 transition-smooth group-hover:opacity-100">
                Learn more <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Journey */}
      <section id="journey" className="bg-muted/30 py-20 md:py-28">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-accent">How it works</p>
            <h2 className="mt-3 text-3xl font-bold text-foreground md:text-4xl">Your journey, visualized</h2>
            <p className="mt-4 text-muted-foreground">Six guided steps from enrollment to your first job offer.</p>
          </div>

          <div className="mt-16 hidden md:block">
            <div className="relative">
              <div className="absolute left-0 right-0 top-7 h-0.5 bg-gradient-to-r from-accent via-info to-accent" />
              <div className="relative grid grid-cols-6 gap-4">
                {journey.map((s, i) => (
                  <div key={s.label} className="flex flex-col items-center text-center">
                    <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full border-2 border-accent bg-card shadow-md">
                      <s.icon className="h-6 w-6 text-accent" />
                    </div>
                    <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Step {i + 1}</p>
                    <p className="text-sm font-semibold text-foreground">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* mobile */}
          <div className="mt-12 space-y-4 md:hidden">
            {journey.map((s, i) => (
              <div key={s.label} className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-soft text-accent">
                  <s.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Step {i + 1}</p>
                  <p className="font-semibold text-foreground">{s.label}</p>
                </div>
                <CheckCircle2 className="ml-auto h-5 w-5 text-accent/30" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container py-20 md:py-24">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-primary p-10 text-center text-primary-foreground md:p-16">
          <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-accent/30 blur-3xl" />
          <div className="absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-info/30 blur-3xl" />
          <div className="relative">
            <h2 className="text-3xl font-bold md:text-4xl">Ready to start your PFE the smart way?</h2>
            <p className="mx-auto mt-4 max-w-xl text-primary-foreground/80">Join thousands of students using AI to build standout projects and land great jobs.</p>
            <Button asChild size="lg" className="mt-8 bg-accent text-accent-foreground shadow-glow hover:bg-accent/90">
              <Link to="/signup">Open my dashboard <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-8">
        <div className="container flex flex-col items-center justify-between gap-4 text-sm text-muted-foreground md:flex-row">
          <p>© 2026 PFE Compass · Smart guidance for tomorrow's graduates.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-foreground">Privacy</a>
            <a href="#" className="hover:text-foreground">Terms</a>
            <a href="#" className="hover:text-foreground">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, GraduationCap, LogIn, Mail, Lock, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/context/auth";

type LocationState = {
  from?: {
    pathname?: string;
  };
};

export default function SignIn() {
  const { user, signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;
  const from = state?.from?.pathname ?? "/dashboard";
  const [email, setEmail] = useState("student@example.com");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  if (user) {
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signIn(email, password);

      if (!rememberMe) {
        window.localStorage.removeItem("pfe-compass-session");
      }

      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-soft px-4 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl flex-col overflow-hidden rounded-3xl border border-border bg-background shadow-elegant lg:grid lg:grid-cols-[1.1fr_0.9fr]">
        <div className="relative overflow-hidden bg-gradient-hero p-8 text-primary-foreground md:p-12 lg:p-14">
          <div className="absolute -right-16 top-10 h-56 w-56 rounded-full bg-accent/25 blur-3xl" />
          <div className="absolute -left-12 bottom-0 h-72 w-72 rounded-full bg-info/20 blur-3xl" />
          <div className="relative flex h-full flex-col justify-between gap-12">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md">
                <GraduationCap className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-lg font-bold">PFE Compass</p>
                <p className="text-sm text-primary-foreground/70">AI Student Companion</p>
              </div>
            </div>

            <div className="max-w-xl">
              <p className="mb-4 inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs backdrop-blur-md">
                Welcome back to your project journey
              </p>
              <h1 className="text-4xl font-bold leading-tight md:text-5xl">Sign in to continue your PFE workflow.</h1>
              <p className="mt-5 max-w-lg text-base text-primary-foreground/80 md:text-lg">
                Track milestones, get AI guidance, and keep your supervisor, roadmap, and career plans in one place.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                ["AI diagnosis", "Personalized growth signals"],
                ["Project tracking", "Stay aligned with deadlines"],
                ["Company matching", "Find relevant opportunities"],
              ].map(([title, desc]) => (
                <div key={title} className="rounded-2xl border border-white/10 bg-white/8 p-4 backdrop-blur-sm">
                  <p className="font-semibold">{title}</p>
                  <p className="mt-1 text-sm text-primary-foreground/70">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center p-6 md:p-10 lg:p-12">
          <Card className="w-full max-w-md border-border shadow-card">
            <CardContent className="space-y-6 p-6 md:p-8">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-soft text-accent">
                  <LogIn className="h-5 w-5" />
                </div>
                <h2 className="mt-4 text-2xl font-bold text-foreground">Sign in</h2>
                <p className="mt-1 text-sm text-muted-foreground">Use your registered credentials to access the dashboard.</p>
              </div>

              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="email" type="email" className="pl-9" value={email} onChange={(event) => setEmail(event.target.value)} required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      className="px-9"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((current) => !current)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <label htmlFor="remember-me" className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
                    <Checkbox
                      id="remember-me"
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked === true)}
                    />
                    Remember me
                  </label>
                  <button type="button" className="text-sm font-medium text-accent transition hover:underline">
                    Forgot password?
                  </button>
                </div>

                {error ? <p className="rounded-lg bg-destructive-soft px-3 py-2 text-sm text-destructive">{error}</p> : null}

                <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary-glow" disabled={loading}>
                  {loading ? "Signing in..." : "Sign in"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>

              <p className="text-center text-sm text-muted-foreground">
                New here? <Link to="/signup" className="font-medium text-accent hover:underline">Create an account</Link>
              </p>

              <p className="text-center text-xs text-muted-foreground">
                Demo credentials are created through sign up and stored locally in this browser.
              </p>

              <div className="rounded-xl border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
                <p className="flex items-center gap-1.5 font-medium text-foreground">
                  <ShieldCheck className="h-3.5 w-3.5 text-success" />
                  Quick access for review
                </p>
                <p className="mt-1">Use <span className="font-semibold">student@example.com</span> and <span className="font-semibold">password123</span>.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
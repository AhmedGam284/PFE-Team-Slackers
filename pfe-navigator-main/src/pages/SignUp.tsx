import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { ArrowRight, GraduationCap, UserPlus, Mail, Lock, User, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/context/auth";

export default function SignUp() {
  const { user, signUp } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(true);

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    if (!acceptTerms) {
      setError("Please accept the terms to continue.");
      setLoading(false);
      return;
    }

    try {
      await signUp(name, email, password);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-soft px-4 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl flex-col overflow-hidden rounded-3xl border border-border bg-background shadow-elegant lg:grid lg:grid-cols-[0.9fr_1.1fr]">
        <div className="order-2 flex items-center justify-center p-6 md:p-10 lg:order-1 lg:p-12">
          <Card className="w-full max-w-md border-border shadow-card">
            <CardContent className="space-y-6 p-6 md:p-8">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-soft text-accent">
                  <UserPlus className="h-5 w-5" />
                </div>
                <h2 className="mt-4 text-2xl font-bold text-foreground">Create your account</h2>
                <p className="mt-1 text-sm text-muted-foreground">Set up your PFE Compass profile in a minute.</p>
              </div>

              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="name">Full name</Label>
                  <div className="relative">
                    <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="name" className="pl-9" value={name} onChange={(event) => setName(event.target.value)} required />
                  </div>
                </div>

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
                      minLength={6}
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
                  <p className="text-xs text-muted-foreground">Use at least 6 characters to create a strong password.</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm password</Label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      className="px-9"
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((current) => !current)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <label htmlFor="terms" className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
                  <Checkbox id="terms" checked={acceptTerms} onCheckedChange={(checked) => setAcceptTerms(checked === true)} />
                  I agree to the Terms and Privacy policy.
                </label>

                {error ? <p className="rounded-lg bg-destructive-soft px-3 py-2 text-sm text-destructive">{error}</p> : null}

                <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary-glow" disabled={loading}>
                  {loading ? "Creating account..." : "Sign up"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>

              <p className="text-center text-sm text-muted-foreground">
                Already have an account? <Link to="/signin" className="font-medium text-accent hover:underline">Sign in</Link>
              </p>

              <div className="rounded-xl border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
                <p className="flex items-center gap-1.5 font-medium text-foreground">
                  <ShieldCheck className="h-3.5 w-3.5 text-success" />
                  UX-first demo mode
                </p>
                <p className="mt-1">Account data stays in your local browser for prototype testing.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="order-1 relative overflow-hidden bg-gradient-hero p-8 text-primary-foreground md:p-12 lg:order-2 lg:p-14">
          <div className="absolute -left-16 top-10 h-56 w-56 rounded-full bg-accent/25 blur-3xl" />
          <div className="absolute -right-12 bottom-0 h-72 w-72 rounded-full bg-info/20 blur-3xl" />
          <div className="relative flex h-full flex-col justify-between gap-12">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md">
                <GraduationCap className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-lg font-bold">PFE Compass</p>
                <p className="text-sm text-primary-foreground/70">Start with a clean workspace</p>
              </div>
            </div>

            <div className="max-w-xl">
              <p className="mb-4 inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs backdrop-blur-md">
                Join the platform for final-year project guidance
              </p>
              <h1 className="text-4xl font-bold leading-tight md:text-5xl">Create your student account and begin tracking progress.</h1>
              <p className="mt-5 max-w-lg text-base text-primary-foreground/80 md:text-lg">
                Save your profile, unlock AI diagnosis, and keep your project roadmap synced from sign-up onward.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                ["Fast setup", "Create your profile locally"],
                ["Secure by design", "Sign in with your own email"],
                ["Instant access", "Jump to the dashboard right away"],
              ].map(([title, desc]) => (
                <div key={title} className="rounded-2xl border border-white/10 bg-white/8 p-4 backdrop-blur-sm">
                  <p className="font-semibold">{title}</p>
                  <p className="mt-1 text-sm text-primary-foreground/70">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
import { Button } from "@/components/ui/button";
import { BarChart3, CheckSquare, Shield, Users } from "lucide-react";
import { useAuth } from "../hooks/use-auth";

const features = [
  {
    icon: CheckSquare,
    title: "Task Management",
    desc: "Create, assign, and track tasks across projects",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    desc: "Role-based access for admins and members",
  },
  {
    icon: BarChart3,
    title: "Dashboard Analytics",
    desc: "Real-time overview of project progress",
  },
  {
    icon: Shield,
    title: "Secure Access",
    desc: "Internet Identity for passwordless auth",
  },
];

export default function LoginPage() {
  const { login, isInitializing, isLoggingIn } = useAuth();

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">
      {/* Left — branding panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-[oklch(var(--sidebar))] flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[oklch(var(--sidebar-primary))]">
            <CheckSquare className="h-5 w-5 text-[oklch(var(--sidebar-primary-foreground))]" />
          </div>
          <span className="font-display text-xl font-bold text-[oklch(var(--sidebar-foreground))] tracking-tight">
            Team Task Manager
          </span>
        </div>

        <div className="space-y-6">
          <h2 className="font-display text-4xl font-bold text-[oklch(var(--sidebar-foreground))] leading-tight">
            Collaborate smarter,
            <br />
            ship faster.
          </h2>
          <p className="text-[oklch(var(--sidebar-foreground)/0.65)] text-lg leading-relaxed max-w-sm">
            A unified workspace for your team to manage projects, assign tasks,
            and track progress — all in one place.
          </p>

          <div className="grid grid-cols-1 gap-4 pt-4">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="flex items-start gap-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[oklch(var(--sidebar-accent))]">
                    <Icon className="h-4 w-4 text-[oklch(var(--sidebar-accent-foreground))]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[oklch(var(--sidebar-foreground))]">
                      {f.title}
                    </p>
                    <p className="text-xs text-[oklch(var(--sidebar-foreground)/0.55)]">
                      {f.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <p className="text-xs text-[oklch(var(--sidebar-foreground)/0.35)]">
          © {new Date().getFullYear()} TaskFlow — Built with caffeine.ai
        </p>
      </div>

      {/* Right — login form */}
      <div
        className="flex flex-1 flex-col items-center justify-center p-8"
        data-ocid="login.page"
      >
        {/* Mobile logo */}
        <div className="flex items-center gap-2 mb-8 lg:hidden">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
            <CheckSquare className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-bold text-foreground">
            Team Task Manager
          </span>
        </div>

        <div className="w-full max-w-sm space-y-8">
          <div className="space-y-2 text-center">
            <h1 className="font-display text-3xl font-bold text-foreground">
              Welcome back
            </h1>
            <p className="text-muted-foreground text-sm">
              Sign in with Internet Identity to access your workspace.
            </p>
          </div>

          <div className="card-elevated rounded-xl p-6 space-y-5">
            <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
              <Shield className="h-5 w-5 text-primary flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  Passwordless & Secure
                </p>
                <p className="text-xs text-muted-foreground">
                  Powered by Internet Identity — no passwords needed
                </p>
              </div>
            </div>

            <Button
              className="w-full h-11 font-semibold text-base"
              onClick={login}
              disabled={isInitializing || isLoggingIn}
              data-ocid="login.submit_button"
            >
              {isInitializing ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Initializing...
                </span>
              ) : isLoggingIn ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Opening login...
                </span>
              ) : (
                "Sign in with Internet Identity"
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              First time here? You'll be set up as the admin automatically.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

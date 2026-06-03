import { Link, useNavigate } from "@tanstack/react-router";
import { GraduationCap, LogOut } from "lucide-react";
import { useSession } from "@/lib/auth-hook";
import { supabase } from "@/integrations/supabase/client";

export function SiteHeader() {
  const { user } = useSession();
  const navigate = useNavigate();

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-2 px-3 sm:h-16 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2 group min-w-0">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-hero shadow-glow transition-transform group-hover:scale-110 sm:h-9 sm:w-9">
            <GraduationCap className="h-4 w-4 text-primary-foreground sm:h-5 sm:w-5" />
          </div>
          <span className="font-display text-base font-bold tracking-tight sm:text-xl truncate">
            Study<span className="text-gradient">Forge</span>
          </span>
        </Link>
        <nav className="flex items-center gap-0.5 sm:gap-2">
          <Link to="/generate" className="rounded-md px-2 py-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground sm:px-3 sm:text-sm" activeProps={{ className: "text-foreground" }}>
            Generator
          </Link>
          {user ? (
            <>
              <Link to="/dashboard" className="rounded-md px-2 py-2 text-xs font-medium text-muted-foreground hover:text-foreground sm:px-3 sm:text-sm" activeProps={{ className: "text-foreground" }}>
                Dashboard
              </Link>
              <button onClick={signOut} title="Sign out"
                className="inline-flex items-center gap-1 rounded-md px-2 py-2 text-xs font-medium text-muted-foreground hover:text-foreground sm:px-3 sm:text-sm">
                <LogOut className="h-3.5 w-3.5"/>
              </button>
            </>
          ) : (
            <Link to="/auth" className="ml-1 inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-lg bg-gradient-hero px-3 py-2 text-xs font-semibold text-primary-foreground shadow-soft transition-all hover:shadow-glow hover:scale-105 sm:ml-2 sm:px-4 sm:text-sm">
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border/50 bg-background/50">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} StudyForge — AI revision for Kenyan classrooms.
          </p>
          <p className="text-xs text-muted-foreground">Aligned with CBC · CBE · KNEC · KCSE</p>
        </div>
      </div>
    </footer>
  );
}

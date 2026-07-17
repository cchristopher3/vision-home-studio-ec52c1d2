import { Link } from "@tanstack/react-router";
import { Home } from "lucide-react";

export function SiteHeader() {
  const navLinks = (
    <>
      <Link to="/setup" className="whitespace-nowrap hover:text-foreground transition-colors" activeProps={{ className: "text-foreground" }}>Start</Link>
      <Link to="/studio" className="whitespace-nowrap hover:text-foreground transition-colors" activeProps={{ className: "text-foreground" }}>Studio</Link>
      <Link to="/compare" className="whitespace-nowrap hover:text-foreground transition-colors" activeProps={{ className: "text-foreground" }}>Compare</Link>
      <Link to="/summary" className="whitespace-nowrap hover:text-foreground transition-colors" activeProps={{ className: "text-foreground" }}>Summary</Link>
      <Link to="/dashboard" className="whitespace-nowrap hover:text-foreground transition-colors" activeProps={{ className: "text-foreground" }}>Builders</Link>
    </>
  );
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-5 sm:px-8">
        <Link to="/" className="flex min-w-0 items-center gap-2.5">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground">
            <Home className="h-4 w-4" strokeWidth={1.6} />
          </div>
          <div className="min-w-0 leading-tight">
            <div className="font-display text-lg truncate">HomeVision</div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground -mt-0.5">Studio</div>
          </div>
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          {navLinks}
        </nav>
        <Link
          to="/setup"
          className="inline-flex shrink-0 items-center rounded-full bg-primary px-4 py-2 text-xs font-medium tracking-wide text-primary-foreground hover:bg-primary/90 transition"
        >
          Start Designing
        </Link>
      </div>
      <nav className="md:hidden flex items-center gap-5 overflow-x-auto border-t border-border/60 px-5 py-2 text-xs text-muted-foreground">
        {navLinks}
      </nav>
    </header>
  );
}

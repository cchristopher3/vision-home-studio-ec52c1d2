import { createFileRoute, Link } from "@tanstack/react-router";
import heroHome from "@/assets/hero-home.jpg";
import kitchenClassic from "@/assets/kitchen-scene-A.jpg";
import bathClassic from "@/assets/bath-classic.jpg";
import { ArrowRight, Compass, Layers, Share2 } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  return (
    <div>
      {/* HERO */}
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img src={heroHome} alt="" className="h-full w-full object-cover" width={1920} height={1200} />
          <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/60 to-background" />
        </div>
        <div className="mx-auto max-w-6xl px-5 sm:px-8 pt-24 pb-32 sm:pt-32 sm:pb-40">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/70 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-muted-foreground backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" /> For new-construction homebuyers
            </div>
            <h1 className="font-display text-5xl leading-[1.02] tracking-tight text-foreground sm:text-7xl">
              See your home <em className="italic text-accent">before</em> it's built.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground">
              HomeVision Studio lets you preview builder-approved cabinets, countertops, flooring,
              and fixtures inside complete kitchen and bath scenes — not tiny swatches.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link
                to="/setup"
                className="group inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary/90"
              >
                Start Designing
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-6 py-3 text-sm font-medium text-foreground backdrop-blur transition hover:bg-background"
              >
                Builder Demo
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section className="mx-auto max-w-6xl px-5 sm:px-8 py-24">
        <div className="grid gap-12 md:grid-cols-[1fr_1.4fr] md:gap-16">
          <div>
            <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">The Process</div>
            <h2 className="mt-3 font-display text-4xl leading-tight sm:text-5xl">
              Three unhurried<br />steps to a home<br />that feels like yours.
            </h2>
          </div>
          <ol className="space-y-8">
            {[
              { icon: Compass, title: "Select your home", body: "Choose your builder, community, and floor plan. Pick either kitchen or primary bath to design first." },
              { icon: Layers, title: "Customize your finishes", body: "Swap cabinets, counters, backsplashes, flooring, hardware, and paint. Watch the whole room shift with each choice." },
              { icon: Share2, title: "Save and share your design", body: "Save multiple versions, compare them side by side, and send a polished summary to your design consultant." },
            ].map((s, i) => (
              <li key={s.title} className="grid grid-cols-[auto_1fr] gap-5 border-t border-border/70 pt-8 first:border-t-0 first:pt-0">
                <div className="flex flex-col items-center">
                  <div className="grid h-11 w-11 place-items-center rounded-full border border-border bg-card text-accent">
                    <s.icon className="h-4 w-4" strokeWidth={1.6} />
                  </div>
                  <div className="mt-2 font-display italic text-sm text-muted-foreground">0{i + 1}</div>
                </div>
                <div>
                  <h3 className="font-display text-2xl">{s.title}</h3>
                  <p className="mt-2 text-muted-foreground max-w-md">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* GALLERY */}
      <section className="mx-auto max-w-7xl px-5 sm:px-8 pb-24">
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            { img: kitchenClassic, tag: "Kitchen", title: "Classic Coastal", sub: "White Shaker · Luna Pearl · Natural Oak" },
            { img: bathClassic, tag: "Primary Bath", title: "Soft Modern", sub: "Carrara Quartz · Marble Hex · Chrome" },
          ].map((c) => (
            <figure key={c.title} className="group relative overflow-hidden rounded-2xl border border-border">
              <img src={c.img} alt={c.title} className="aspect-[4/3] w-full object-cover transition duration-700 group-hover:scale-[1.02]" loading="lazy" width={1600} height={1200} />
              <figcaption className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-4 rounded-xl bg-background/85 p-4 backdrop-blur">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{c.tag}</div>
                  <div className="font-display text-xl leading-tight">{c.title}</div>
                  <div className="text-xs text-muted-foreground mt-1">{c.sub}</div>
                </div>
                <Link to="/studio" className="text-xs underline underline-offset-4 hover:text-accent">Open in Studio</Link>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* FOR BUILDERS */}
      <section className="bg-secondary/60 border-y border-border">
        <div className="mx-auto max-w-6xl px-5 sm:px-8 py-24 grid gap-12 md:grid-cols-2 md:items-center">
          <div>
            <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">For Builders</div>
            <h2 className="mt-3 font-display text-4xl leading-tight sm:text-5xl">
              Confident buyers.<br />Smoother selections.
            </h2>
            <p className="mt-5 text-muted-foreground max-w-md">
              Give buyers a calm, guided way to explore their options. Reduce back-and-forth in
              the design center and open more upgrade conversations — without pressure.
            </p>
            <div className="mt-6">
              <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm font-medium text-foreground hover:text-accent">
                See builder preview <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
          <dl className="grid grid-cols-2 gap-3">
            {[
              { k: "+38%", v: "Buyer confidence in finish choices" },
              { k: "2.4×", v: "Faster average selection appointments" },
              { k: "+22%", v: "Upgrade attach rate" },
              { k: "94%", v: "Would recommend the experience" },
            ].map((s) => (
              <div key={s.v} className="rounded-2xl border border-border bg-card p-6">
                <div className="font-display text-3xl text-foreground">{s.k}</div>
                <div className="mt-2 text-xs text-muted-foreground leading-snug">{s.v}</div>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <footer className="mx-auto max-w-7xl px-5 sm:px-8 py-10 text-xs text-muted-foreground flex flex-wrap items-center justify-between gap-3">
        <div>© HomeVision Studio · Demonstration prototype</div>
        <div>Illustrative visualizations. Actual colors and materials may vary from installed products.</div>
      </footer>
    </div>
  );
}

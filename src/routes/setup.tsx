import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { BUILDERS, COMMUNITIES, FLOOR_PLANS, type Room } from "@/lib/catalog";
import { useStudio } from "@/lib/store";
import { ArrowRight, Bath, ChefHat, Check } from "lucide-react";

export const Route = createFileRoute("/setup")({
  head: () => ({
    meta: [
      { title: "Set up your home — HomeVision Studio" },
      { name: "description", content: "Choose your builder, community, floor plan, and room to start designing." },
    ],
  }),
  component: SetupPage,
});

function SetupPage() {
  const navigate = useNavigate();
  const current = useStudio();
  const setSetup = useStudio((s) => s.setSetup);
  const [builderId] = useState(current.builderId);
  const [communityId, setCommunityId] = useState(current.communityId);
  const [floorPlanId, setFloorPlanId] = useState(current.floorPlanId);
  const [room, setRoom] = useState<Room>(current.room);

  const submit = () => {
    setSetup({ builderId, communityId, floorPlanId, room });
    navigate({ to: "/studio" });
  };

  return (
    <div className="mx-auto max-w-5xl px-5 sm:px-8 py-16">
      <div className="mb-10">
        <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Project setup</div>
        <h1 className="mt-2 font-display text-4xl sm:text-5xl leading-tight">Let's begin with your home.</h1>
        <p className="mt-3 text-muted-foreground max-w-xl">
          A few quick selections and we'll open your personalized design studio.
        </p>
        <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          Demonstration data
        </div>
      </div>

      <div className="space-y-10">
        <Section index="01" title="Builder">
          <div className="grid gap-3 sm:grid-cols-2">
            {BUILDERS.map((b) => (
              <Card key={b.id} selected={b.id === builderId} onClick={() => {}}>
                <div className="font-display text-xl">{b.name}</div>
                <div className="text-xs text-muted-foreground mt-1">{b.tagline}</div>
              </Card>
            ))}
          </div>
        </Section>

        <Section index="02" title="Community">
          <div className="grid gap-3 sm:grid-cols-3">
            {COMMUNITIES.map((c) => (
              <Card key={c.id} selected={c.id === communityId} onClick={() => setCommunityId(c.id)}>
                <div className="font-display text-xl">{c.name}</div>
                <div className="text-xs text-muted-foreground mt-1">{c.location}</div>
              </Card>
            ))}
          </div>
        </Section>

        <Section index="03" title="Floor plan">
          <div className="grid gap-3 sm:grid-cols-3">
            {FLOOR_PLANS.map((p) => (
              <Card key={p.id} selected={p.id === floorPlanId} onClick={() => setFloorPlanId(p.id)}>
                <div className="font-display text-xl">{p.name}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {p.beds} bed · {p.baths} bath · {p.sqft.toLocaleString()} sq ft
                </div>
              </Card>
            ))}
          </div>
        </Section>

        <Section index="04" title="Room">
          <div className="grid gap-3 sm:grid-cols-2">
            <Card selected={room === "kitchen"} onClick={() => setRoom("kitchen")}>
              <div className="flex items-center gap-3">
                <ChefHat className="h-5 w-5 text-accent" strokeWidth={1.6} />
                <div className="font-display text-xl">Kitchen</div>
              </div>
              <div className="text-xs text-muted-foreground mt-2">Cabinets, counters, backsplash, flooring, hardware, paint.</div>
            </Card>
            <Card selected={room === "bathroom"} onClick={() => setRoom("bathroom")}>
              <div className="flex items-center gap-3">
                <Bath className="h-5 w-5 text-accent" strokeWidth={1.6} />
                <div className="font-display text-xl">Primary Bathroom</div>
              </div>
              <div className="text-xs text-muted-foreground mt-2">Vanity, countertop, tile, floor, faucets, paint.</div>
            </Card>
          </div>
        </Section>
      </div>

      <div className="mt-12 flex items-center justify-end gap-3">
        <button
          onClick={submit}
          className="group inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
        >
          Open Design Studio <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    </div>
  );
}

function Section({ index, title, children }: { index: string; title: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-4 border-t border-border/70 pt-8 md:grid-cols-[140px_1fr]">
      <div>
        <div className="font-display italic text-sm text-muted-foreground">{index}</div>
        <h2 className="font-display text-2xl mt-1">{title}</h2>
      </div>
      <div>{children}</div>
    </section>
  );
}

function Card({ selected, onClick, children }: { selected?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`relative text-left rounded-2xl border p-5 transition ${
        selected
          ? "border-foreground bg-card shadow-sm"
          : "border-border bg-card/60 hover:border-foreground/40 hover:bg-card"
      }`}
    >
      {children}
      {selected && (
        <span className="absolute right-3 top-3 grid h-6 w-6 place-items-center rounded-full bg-primary text-primary-foreground">
          <Check className="h-3.5 w-3.5" strokeWidth={2} />
        </span>
      )}
    </button>
  );
}

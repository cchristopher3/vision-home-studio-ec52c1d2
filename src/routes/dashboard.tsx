import { createFileRoute } from "@tanstack/react-router";
import { COMMUNITIES, FLOOR_PLANS, PRODUCTS, formatMoney } from "@/lib/catalog";
import { Activity, ArrowUpRight, Home, TrendingUp, Users } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Builder Dashboard preview — HomeVision Studio" },
      { name: "description", content: "A preview of the builder analytics and catalog dashboard." },
    ],
  }),
  component: DashboardPage,
});

const activeProjects = [
  { buyer: "The Alvarez family", plan: "The Hudson", community: "Caleb's Creek", room: "Kitchen", pct: 78, upgrade: 8420 },
  { buyer: "The Chen family", plan: "The Riley", community: "Northborough", room: "Primary Bath", pct: 45, upgrade: 3140 },
  { buyer: "The Okafor family", plan: "The Kipling", community: "Haven at Rocky River", room: "Kitchen", pct: 92, upgrade: 12980 },
  { buyer: "The Bennett family", plan: "The Hudson", community: "Caleb's Creek", room: "Kitchen", pct: 34, upgrade: 2600 },
  { buyer: "The Ramirez family", plan: "The Riley", community: "Northborough", room: "Primary Bath", pct: 66, upgrade: 5220 },
];

export default function DashboardPage() {
  const cabinetTop = PRODUCTS.find((p) => p.id === "cab-harbor")!;
  const counterTop = PRODUCTS.find((p) => p.id === "ct-calacatta")!;
  return (
    <div className="mx-auto max-w-[1400px] px-5 sm:px-8 py-10">
      <div className="mb-8 grid grid-cols-[minmax(0,1fr)_auto] gap-4 items-end sm:flex sm:flex-wrap sm:justify-between">
        <div className="min-w-0">
          <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Builder preview</div>
          <h1 className="mt-1 font-display text-4xl sm:text-5xl leading-tight">True Homes · Design Center</h1>
        </div>
        <div className="text-xs text-muted-foreground shrink-0">Read-only demonstration</div>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 mb-6">
        <Kpi icon={Users} label="Active buyer projects" value="24" trend="+3 this week" />
        <Kpi icon={TrendingUp} label="Avg upgrade total" value={formatMoney(6480)} trend="+8% vs last month" />
        <Kpi icon={Activity} label="Design completion" value="72%" trend="+5 pts" />
        <Kpi icon={Home} label="Homes in selection" value="41" trend="Across 3 communities" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        {/* PROJECTS TABLE */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="p-5 border-b border-border flex items-center justify-between">
            <div>
              <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Active projects</div>
              <div className="font-display text-2xl mt-0.5">Buyer selections in progress</div>
            </div>
          </div>
          <div className="divide-y divide-border">
            {activeProjects.map((p) => (
              <div key={p.buyer} className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 sm:grid-cols-[1.4fr_1fr_auto_auto] items-center px-5 py-4">
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{p.buyer}</div>
                  <div className="text-[11px] text-muted-foreground truncate">{p.plan} · {p.community}</div>
                </div>
                <div className="hidden sm:block text-xs text-muted-foreground">{p.room}</div>
                <div className="hidden sm:flex items-center gap-2 w-40">
                  <div className="h-1.5 flex-1 rounded-full bg-secondary overflow-hidden">
                    <div className="h-full bg-foreground" style={{ width: `${p.pct}%` }} />
                  </div>
                  <div className="text-[11px] text-muted-foreground w-8 text-right">{p.pct}%</div>
                </div>
                <div className="text-sm text-right shrink-0">+{formatMoney(p.upgrade)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* SIDE PANELS */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground mb-3">Top selected</div>
            <TopPick label="Most selected cabinet" product={cabinetTop} share={42} />
            <div className="my-4 border-t border-border" />
            <TopPick label="Most selected countertop" product={counterTop} share={31} />
          </div>

          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Product catalog</div>
              <button className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1">Manage <ArrowUpRight className="h-3 w-3" /></button>
            </div>
            <div className="grid grid-cols-6 gap-1.5">
              {PRODUCTS.slice(0, 18).map((p) => (
                <div key={p.id} className="aspect-square rounded-md border border-border" style={{ background: p.swatch }} title={p.name} />
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground mb-3">Communities & floor plans</div>
            <ul className="space-y-2 text-sm">
              {COMMUNITIES.map((c) => (
                <li key={c.id} className="flex items-center justify-between">
                  <div>
                    <div>{c.name}</div>
                    <div className="text-[11px] text-muted-foreground">{c.location}</div>
                  </div>
                  <div className="text-xs text-muted-foreground">{FLOOR_PLANS.length} plans</div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function Kpi({ icon: Icon, label, value, trend }: { icon: React.ComponentType<{ className?: string; strokeWidth?: number }>; label: string; value: string; trend: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">{label}</div>
        <Icon className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
      </div>
      <div className="mt-3 font-display text-3xl leading-none">{value}</div>
      <div className="mt-2 text-[11px] text-muted-foreground">{trend}</div>
    </div>
  );
}

function TopPick({ label, product, share }: { label: string; product: typeof PRODUCTS[number]; share: number }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-2 flex items-center gap-3">
        <div className="h-12 w-12 rounded-md border border-border" style={{ background: product.swatch }} />
        <div className="min-w-0">
          <div className="text-sm truncate">{product.name}</div>
          <div className="text-[11px] text-muted-foreground truncate">{product.manufacturer}</div>
        </div>
        <div className="ml-auto font-display text-lg">{share}%</div>
      </div>
    </div>
  );
}

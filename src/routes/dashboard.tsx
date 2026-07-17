import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  CATALOG_META,
  COMMUNITIES,
  FLOOR_PLANS,
  KITCHEN_CATEGORIES,
  KITCHEN_LAYOUTS,
  PRODUCTS,
  formatMoney,
  type ProductStatus,
} from "@/lib/catalog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Activity,
  ArrowUpRight,
  Home,
  ImageIcon,
  Search,
  TrendingUp,
  Upload,
  Users,
} from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Builder Dashboard — HomeVision Studio" },
      {
        name: "description",
        content:
          "Preview of the builder-facing product catalog management for the True Homes-Inspired Demo Catalog.",
      },
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

function DashboardPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | ProductStatus>("all");
  const [layout, setLayout] = useState<"all" | "standard" | "alt1">("all");

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PRODUCTS.filter((p) => {
      if (status !== "all" && p.status !== status) return false;
      if (layout !== "all" && p.room === "kitchen") {
        if (p.layouts && !p.layouts.includes(layout)) return false;
      }
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.code?.toLowerCase().includes(q) ||
        p.manufacturer.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    });
  }, [query, status, layout]);

  const categoryLabel = (id: string) =>
    KITCHEN_CATEGORIES.find((c) => c.id === id)?.label ?? id;

  return (
    <div className="mx-auto max-w-[1500px] px-5 sm:px-8 py-10">
      <div className="mb-6 grid grid-cols-[minmax(0,1fr)_auto] gap-4 items-end sm:flex sm:flex-wrap sm:justify-between">
        <div className="min-w-0">
          <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            Builder preview · {CATALOG_META.name}
          </div>
          <h1 className="mt-1 font-display text-4xl sm:text-5xl leading-tight">
            Product catalog management
          </h1>
          <p className="mt-2 text-xs text-muted-foreground max-w-xl">
            {CATALOG_META.disclaimer}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => toast.message("CSV import is a visual placeholder in this prototype.")}
          >
            <Upload className="h-3.5 w-3.5" /> Import CSV
          </Button>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 mb-6">
        <Kpi icon={Users} label="Active buyer projects" value="24" trend="+3 this week" />
        <Kpi icon={TrendingUp} label="Avg upgrade total" value={formatMoney(6480)} trend="+8% vs last month" />
        <Kpi icon={Activity} label="Design completion" value="72%" trend="+5 pts" />
        <Kpi icon={Home} label="Products in catalog" value={`${PRODUCTS.length}`} trend={`Effective ${CATALOG_META.effectiveDate}`} />
      </div>

      {/* CATALOG TABLE */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden mb-8">
        <div className="p-4 sm:p-5 border-b border-border grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
          <div>
            <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              Catalog
            </div>
            <div className="font-display text-2xl mt-0.5">
              Products, pricing, and availability
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search name, code, category…"
                className="h-9 w-[240px] pl-8"
              />
            </div>
            <FilterPill value={status} onChange={setStatus} options={["all", "included", "upgrade", "optional"] as const} />
            <FilterPill
              value={layout}
              onChange={setLayout}
              options={["all", "standard", "alt1"] as const}
              labelFor={(v) =>
                v === "all"
                  ? "All layouts"
                  : v === "standard"
                  ? "Std Kitchen"
                  : "Alt Kitchen 1"
              }
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-secondary/50 text-muted-foreground">
              <tr className="text-left">
                <Th>Code</Th>
                <Th>Name</Th>
                <Th>Category</Th>
                <Th>Config</Th>
                <Th className="text-right">Price</Th>
                <Th>Status</Th>
                <Th>Layout</Th>
                <Th>Effective</Th>
                <Th>Asset</Th>
                <Th>Active</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.slice(0, 200).map((p) => (
                <tr key={p.id} className="hover:bg-secondary/30">
                  <Td mono>{p.code ?? "—"}</Td>
                  <Td>
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="h-5 w-5 shrink-0 rounded border border-border"
                        style={{ background: p.swatch }}
                      />
                      <span className="truncate">{p.name}</span>
                    </div>
                    <div className="text-[10px] text-muted-foreground">{p.manufacturer}</div>
                  </Td>
                  <Td>{p.room === "kitchen" ? categoryLabel(p.category) : p.category}</Td>
                  <Td>{p.configuration ?? "—"}</Td>
                  <Td className="text-right tabular-nums">
                    {p.included ? "Included" : formatMoney(p.price)}
                  </Td>
                  <Td>
                    <StatusChip status={p.status} />
                  </Td>
                  <Td>
                    {p.room === "kitchen"
                      ? p.layouts
                        ? p.layouts.map((l) => (l === "alt1" ? "Alt 1" : "Std")).join(", ")
                        : "All"
                      : "—"}
                  </Td>
                  <Td className="text-muted-foreground">{p.effectiveDate ?? CATALOG_META.effectiveDate}</Td>
                  <Td>
                    <span className="inline-flex items-center gap-1 text-muted-foreground">
                      <ImageIcon className="h-3 w-3" />
                      <span className="truncate max-w-[120px]">
                        {p.imagePlaceholder ?? "placeholder"}
                      </span>
                    </span>
                  </Td>
                  <Td>
                    <span
                      className={`inline-flex items-center gap-1 ${
                        p.active === false ? "text-muted-foreground" : "text-foreground"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          p.active === false ? "bg-muted-foreground" : "bg-emerald-500"
                        }`}
                      />
                      {p.active === false ? "Inactive" : "Active"}
                    </span>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="border-t border-border px-4 py-2 text-[11px] text-muted-foreground">
          Showing {Math.min(rows.length, 200)} of {rows.length} products · Availability must be confirmed by builder.
        </div>
      </div>

      {/* ACTIVE PROJECTS + COMMUNITIES */}
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="p-5 border-b border-border">
            <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              Active projects
            </div>
            <div className="font-display text-2xl mt-0.5">Buyer selections in progress</div>
          </div>
          <div className="divide-y divide-border">
            {activeProjects.map((p) => (
              <div
                key={p.buyer}
                className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 sm:grid-cols-[1.4fr_1fr_auto_auto] items-center px-5 py-4"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{p.buyer}</div>
                  <div className="text-[11px] text-muted-foreground truncate">
                    {p.plan} · {p.community}
                  </div>
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

        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                Kitchen layouts
              </div>
              <button className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
                Manage <ArrowUpRight className="h-3 w-3" />
              </button>
            </div>
            <ul className="space-y-2 text-sm">
              {KITCHEN_LAYOUTS.map((l) => (
                <li key={l.id} className="flex items-start justify-between gap-3">
                  <div>
                    <div>{l.label}</div>
                    <div className="text-[11px] text-muted-foreground">{l.description}</div>
                  </div>
                  <div className="text-[11px] text-muted-foreground shrink-0">
                    {PRODUCTS.filter(
                      (p) => p.room === "kitchen" && (!p.layouts || p.layouts.includes(l.id)),
                    ).length}{" "}
                    products
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground mb-3">
              Communities & floor plans
            </div>
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

function Kpi({
  icon: Icon,
  label,
  value,
  trend,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  value: string;
  trend: string;
}) {
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

function Th({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <th className={`px-3 py-2 text-[10px] uppercase tracking-widest font-medium ${className}`}>
      {children}
    </th>
  );
}
function Td({
  children,
  mono,
  className = "",
}: {
  children: React.ReactNode;
  mono?: boolean;
  className?: string;
}) {
  return (
    <td
      className={`px-3 py-2 align-top ${mono ? "font-mono text-[11px]" : ""} ${className}`}
    >
      {children}
    </td>
  );
}

function StatusChip({ status }: { status: ProductStatus }) {
  const map: Record<ProductStatus, string> = {
    included: "bg-secondary text-muted-foreground",
    upgrade: "bg-foreground text-background",
    optional: "bg-accent/15 text-accent",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-widest ${map[status]}`}>
      {status}
    </span>
  );
}

function FilterPill<T extends string>({
  value,
  onChange,
  options,
  labelFor,
}: {
  value: T;
  onChange: (v: T) => void;
  options: readonly T[];
  labelFor?: (v: T) => string;
}) {
  return (
    <div className="flex items-center rounded-full border border-border bg-card p-1 text-xs">
      {options.map((o) => (
        <button
          key={o}
          onClick={() => onChange(o)}
          className={`rounded-full px-2.5 py-1 capitalize ${
            value === o
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {labelFor ? labelFor(o) : o}
        </button>
      ))}
    </div>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  BATHROOM_CATEGORIES,
  CATALOG_META,
  COMMUNITIES,
  FLOOR_PLANS,
  KITCHEN_CATEGORIES,
  KITCHEN_LAYOUTS,
  formatMoney,
  isProductCompatible,
  priceFor,
  productById,
  productsFor,
  selectionIssues,
  totalFor,
  type CategoryDef,
} from "@/lib/catalog";
import { useStudio } from "@/lib/store";
import { RoomPreview } from "@/components/RoomPreview";
import { ProductSwatch } from "@/components/ProductSwatch";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  GitCompareArrows,
  Save,
  ClipboardList,
  ChefHat,
  Bath,
  RotateCcw,
  Search,
  AlertTriangle,
  ChevronDown,
} from "lucide-react";

export const Route = createFileRoute("/studio")({
  head: () => ({
    meta: [
      { title: "Design Studio — HomeVision" },
      {
        name: "description",
        content:
          "Explore the True Homes-Inspired Demo Catalog. Customize kitchen or bath finishes and see the whole room update.",
      },
    ],
  }),
  component: StudioPage,
});

const GROUP_LABEL: Record<string, string> = {
  cabinetry: "Cabinetry",
  surfaces: "Surfaces & tile",
  fixtures: "Fixtures",
  island: "Island options",
  appliances: "Appliances",
};

function StudioPage() {
  const {
    room,
    selections,
    communityId,
    floorPlanId,
    kitchenLayout,
    activeCategory,
    searchQuery,
    statusFilter,
  } = useStudio();
  const setRoom = useStudio((s) => s.setRoom);
  const setKitchenLayout = useStudio((s) => s.setKitchenLayout);
  const selectProduct = useStudio((s) => s.selectProduct);
  const saveDesign = useStudio((s) => s.saveDesign);
  const resetSelections = useStudio((s) => s.resetSelections);
  const setActiveCategory = useStudio((s) => s.setActiveCategory);
  const setSearchQuery = useStudio((s) => s.setSearchQuery);
  const setStatusFilter = useStudio((s) => s.setStatusFilter);

  const categories: CategoryDef[] =
    room === "kitchen" ? KITCHEN_CATEGORIES : BATHROOM_CATEGORIES;
  const currentCat: CategoryDef =
    categories.find((c) => c.id === activeCategory) ?? categories[0];

  const community = COMMUNITIES.find((c) => c.id === communityId)!;
  const plan = FLOOR_PLANS.find((p) => p.id === floorPlanId)!;
  const layoutForTotal = room === "kitchen" ? kitchenLayout : "standard";
  const total = useMemo(
    () => totalFor(selections, layoutForTotal),
    [selections, layoutForTotal],
  );
  const issues = useMemo(
    () => selectionIssues(selections, layoutForTotal),
    [selections, layoutForTotal],
  );

  const [saveOpen, setSaveOpen] = useState(false);
  const [designName, setDesignName] = useState("");

  const grouped = useMemo(() => {
    const map = new Map<string, CategoryDef[]>();
    for (const c of categories) {
      const arr = map.get(c.group) ?? [];
      arr.push(c);
      map.set(c.group, arr);
    }
    return Array.from(map.entries());
  }, [categories]);

  // per-category upgrade summary for the summary panel
  const categoryTotals = useMemo(() => {
    return categories.map((c) => {
      const p = productById(selections[c.id]);
      return {
        cat: c,
        product: p,
        cost: p ? priceFor(p, layoutForTotal) : 0,
      };
    });
  }, [categories, selections, layoutForTotal]);

  const handleSave = () => {
    const d = saveDesign(
      designName ||
        `${plan.name} · ${room === "kitchen" ? "Kitchen" : "Bath"}`,
    );
    setSaveOpen(false);
    setDesignName("");
    toast.success(`Saved "${d.name}"`);
  };

  // options for currently active category, filtered by search + status
  const rawOptions = productsFor(room, currentCat.id, layoutForTotal);
  const q = searchQuery.trim().toLowerCase();
  const filteredOptions = rawOptions.filter((p) => {
    if (statusFilter !== "all" && p.status !== statusFilter) return false;
    if (!q) return true;
    return (
      p.name.toLowerCase().includes(q) ||
      p.code?.toLowerCase().includes(q) ||
      p.manufacturer.toLowerCase().includes(q)
    );
  });

  const selectedProduct = productById(selections[currentCat.id]);

  return (
    <div className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
      {/* HEADER ROW */}
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:flex-wrap sm:justify-between mb-4">
        <div className="min-w-0">
          <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            {community.name} · {plan.name} · {CATALOG_META.name}
          </div>
          <h1 className="mt-1 font-display text-3xl sm:text-4xl leading-tight truncate">
            {room === "kitchen" ? "Kitchen" : "Primary Bathroom"} design
          </h1>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <div className="flex items-center rounded-full border border-border bg-card p-1">
            <RoomToggle active={room === "kitchen"} onClick={() => setRoom("kitchen")}>
              <ChefHat className="h-3.5 w-3.5" /> Kitchen
            </RoomToggle>
            <RoomToggle active={room === "bathroom"} onClick={() => setRoom("bathroom")}>
              <Bath className="h-3.5 w-3.5" /> Bath
            </RoomToggle>
          </div>
        </div>
      </div>

      <div className="mb-6 rounded-lg border border-dashed border-border bg-secondary/40 px-4 py-2 text-[11px] text-muted-foreground">
        {CATALOG_META.disclaimer}
      </div>

      {/* KITCHEN LAYOUT PICKER */}
      {room === "kitchen" && (
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <span className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground mr-1">
            Kitchen layout
          </span>
          {KITCHEN_LAYOUTS.map((l) => (
            <button
              key={l.id}
              onClick={() => setKitchenLayout(l.id)}
              className={`rounded-full border px-3 py-1.5 text-xs transition ${
                kitchenLayout === l.id
                  ? "border-foreground bg-foreground text-background"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
              title={l.description}
            >
              {l.label}
            </button>
          ))}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[220px_1fr_360px]">
        {/* CATEGORY NAV */}
        <aside className="lg:sticky lg:top-4 lg:self-start rounded-2xl border border-border bg-card p-3">
          <div className="px-2 py-1 text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            Categories
          </div>
          <nav className="mt-2 space-y-3">
            {grouped.map(([group, cats]) => (
              <CategoryGroup
                key={group}
                label={GROUP_LABEL[group] ?? group}
                cats={cats}
                activeId={currentCat.id}
                selections={selections}
                onPick={(id) => setActiveCategory(id)}
                issueCats={new Set(issues.map((i) => i.category))}
                layoutForTotal={layoutForTotal}
              />
            ))}
          </nav>
        </aside>

        {/* MAIN COLUMN */}
        <div className="space-y-4 min-w-0">
          <RoomPreview
            room={room}
            selections={selections}
            className="aspect-[4/3] lg:aspect-[16/10]"
          />

          {issues.length > 0 && (
            <div className="rounded-2xl border border-destructive/40 bg-destructive/5 p-4">
              <div className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-4 w-4" />
                <div className="text-sm font-medium">
                  Selection issue{issues.length > 1 ? "s" : ""} detected
                </div>
              </div>
              <ul className="mt-2 space-y-1 text-xs text-destructive/90">
                {issues.map((i, idx) => (
                  <li key={idx}>• {i.message}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="rounded-2xl border border-border bg-card">
            <div className="border-b border-border p-4 sm:p-5 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
              <div className="min-w-0">
                <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                  {GROUP_LABEL[currentCat.group]}
                </div>
                <div className="font-display text-2xl mt-1 truncate">{currentCat.label}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Selected: {selectedProduct?.name ?? "—"}
                  {selectedProduct?.code && (
                    <span className="ml-1">· {selectedProduct.code}</span>
                  )}
                  <span className="ml-2">
                    {selectedProduct?.included
                      ? "Included"
                      : `+${formatMoney(priceFor(selectedProduct!, layoutForTotal) ?? 0)}`}
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search name or code…"
                    className="h-9 w-[200px] pl-8"
                  />
                </div>
                <div className="flex items-center rounded-full border border-border bg-card p-1 text-xs">
                  {(["all", "included", "upgrade", "optional"] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setStatusFilter(f)}
                      className={`rounded-full px-2.5 py-1 capitalize ${
                        statusFilter === f
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-5">
              {filteredOptions.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                  No products match the current filters.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {filteredOptions.map((p) => {
                    const compat = isProductCompatible(p, selections, layoutForTotal);
                    return (
                      <ProductSwatch
                        key={p.id}
                        product={p}
                        selected={selections[currentCat.id] === p.id}
                        disabled={!compat.ok}
                        disabledReason={compat.ok ? undefined : compat.reason}
                        onSelect={() => {
                          if (compat.ok) selectProduct(currentCat.id, p.id);
                        }}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <p className="text-[11px] text-muted-foreground px-1">
            Room previews are illustrative. Actual installed colors, textures, and materials may
            vary. Availability must be confirmed by builder.
          </p>
        </div>

        {/* SUMMARY COLUMN */}
        <aside className="space-y-4 lg:sticky lg:top-4 lg:self-start">
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              Running upgrade total
            </div>
            <div className="mt-1 font-display text-3xl leading-none">
              {formatMoney(total)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {Object.keys(selections).length} selections ·{" "}
              {countUpgrades(selections)} upgrades
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Button variant="ghost" size="sm" onClick={resetSelections} className="gap-1.5">
                <RotateCcw className="h-3.5 w-3.5" /> Reset
              </Button>
              <Dialog open={saveOpen} onOpenChange={setSaveOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-1.5">
                    <Save className="h-3.5 w-3.5" /> Save
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Save this design</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-2 py-2">
                    <Label htmlFor="dname">Design name</Label>
                    <Input
                      id="dname"
                      placeholder={`${plan.name} · ${room === "kitchen" ? "Kitchen" : "Bath"}`}
                      value={designName}
                      onChange={(e) => setDesignName(e.target.value)}
                    />
                  </div>
                  <DialogFooter>
                    <Button variant="ghost" onClick={() => setSaveOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSave}>Save</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Link to="/compare">
                <Button variant="outline" size="sm" className="gap-1.5">
                  <GitCompareArrows className="h-3.5 w-3.5" /> Compare
                </Button>
              </Link>
              <Link to="/summary">
                <Button variant="outline" size="sm" className="gap-1.5">
                  <ClipboardList className="h-3.5 w-3.5" /> Review
                </Button>
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground mb-3">
              Summary by category
            </div>
            <ul className="space-y-2">
              {categoryTotals.map(({ cat, product, cost }) => (
                <li
                  key={cat.id}
                  className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 text-xs"
                >
                  <div
                    className="h-5 w-5 rounded border border-border"
                    style={{ background: product?.swatch }}
                  />
                  <button
                    className="min-w-0 text-left hover:text-foreground text-muted-foreground truncate"
                    onClick={() => setActiveCategory(cat.id)}
                  >
                    <span className="text-foreground">{cat.label}</span>
                    <span className="text-muted-foreground"> · {product?.name ?? "—"}</span>
                  </button>
                  <span className="shrink-0 text-right tabular-nums">
                    {product?.included ? (
                      <span className="text-muted-foreground">—</span>
                    ) : (
                      <span>+{formatMoney(cost)}</span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}

function CategoryGroup({
  label,
  cats,
  activeId,
  selections,
  onPick,
  issueCats,
  layoutForTotal,
}: {
  label: string;
  cats: CategoryDef[];
  activeId: string;
  selections: Record<string, string>;
  onPick: (id: string) => void;
  issueCats: Set<string>;
  layoutForTotal: "standard" | "alt1";
}) {
  const [open, setOpen] = useState(true);
  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between rounded-md px-2 py-1 text-[10px] uppercase tracking-[0.22em] text-muted-foreground hover:text-foreground"
      >
        {label}
        <ChevronDown
          className={`h-3 w-3 transition-transform ${open ? "" : "-rotate-90"}`}
        />
      </button>
      {open && (
        <ul className="mt-1 space-y-0.5">
          {cats.map((c) => {
            const p = productById(selections[c.id]);
            const isActive = c.id === activeId;
            const hasIssue = issueCats.has(c.id);
            return (
              <li key={c.id}>
                <button
                  onClick={() => onPick(c.id)}
                  className={`grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs ${
                    isActive
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                  }`}
                >
                  <span
                    className="h-3 w-3 rounded-sm border border-border"
                    style={{ background: p?.swatch }}
                  />
                  <span className="truncate">
                    {c.label}
                    {hasIssue && (
                      <AlertTriangle className="ml-1 inline h-3 w-3 text-destructive" />
                    )}
                  </span>
                  <span className="text-[10px] tabular-nums text-muted-foreground">
                    {p?.included
                      ? "inc"
                      : p
                      ? `+${Math.round(priceFor(p, layoutForTotal) / 100) / 10}k`
                      : "—"}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function countUpgrades(sel: Record<string, string>) {
  return Object.values(sel).filter((id) => {
    const p = productById(id);
    return p && !p.included;
  }).length;
}

function RoomToggle({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs transition ${
        active
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

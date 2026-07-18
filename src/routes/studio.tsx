import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
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
import {
  COLOR_FAMILIES,
  RECOMMENDED_FINISH_IDS,
  STONE_TEXTURES,
  StoneSwatchThumb,
} from "@/lib/stoneTextures";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  GitCompareArrows,
  Save,
  ClipboardList,
  ChefHat,
  Bath,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  Layers,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export const Route = createFileRoute("/studio")({
  head: () => ({
    meta: [
      { title: "Design Studio — HomeVision" },
      {
        name: "description",
        content:
          "Customize kitchen or bath finishes with a live room preview beside compact category selectors.",
      },
    ],
  }),
  component: StudioPage,
});

// ---------- macro-group definitions ----------

type MacroGroup = {
  id: string;
  label: string;
  /** Category ids belonging to this group, in display order. */
  categoryIds: string[];
};

const KITCHEN_GROUPS: MacroGroup[] = [
  { id: "cabinets", label: "Cabinets", categoryIds: ["cabinets", "perimeterFinish"] },
  { id: "countertops", label: "Countertops", categoryIds: ["countertops", "islandCounter"] },
  { id: "backsplash", label: "Backsplash", categoryIds: ["backsplash", "cooktopBacksplash"] },
  { id: "flooring", label: "Flooring", categoryIds: ["flooring"] },
  { id: "fixtures", label: "Fixtures", categoryIds: ["sink", "faucet", "soapDispenser"] },
  {
    id: "island",
    label: "Island",
    categoryIds: ["islandFinish", "islandTrim", "islandWaterfall", "extendedIslandCountertop"],
  },
  {
    id: "appliances",
    label: "Appliances",
    categoryIds: [
      "dishwasher",
      "cooktop",
      "range",
      "hood",
      "microwave",
      "wallOven",
      "refrigerator",
    ],
  },
];

const BATHROOM_GROUPS: MacroGroup[] = [
  { id: "vanity", label: "Vanity", categoryIds: ["vanity"] },
  { id: "countertop", label: "Countertop", categoryIds: ["countertop"] },
  { id: "shower", label: "Shower Tile", categoryIds: ["showerTile"] },
  { id: "floor", label: "Floor Tile", categoryIds: ["floorTile"] },
  { id: "fixtures", label: "Fixtures", categoryIds: ["faucets"] },
  { id: "paint", label: "Wall Paint", categoryIds: ["wallPaint"] },
];

function StudioPage() {
  const {
    room,
    selections,
    communityId,
    floorPlanId,
    kitchenLayout,
  } = useStudio();
  const setRoom = useStudio((s) => s.setRoom);
  const setKitchenLayout = useStudio((s) => s.setKitchenLayout);
  const selectProduct = useStudio((s) => s.selectProduct);
  const resetSelections = useStudio((s) => s.resetSelections);
  const saveDesign = useStudio((s) => s.saveDesign);

  const categories = room === "kitchen" ? KITCHEN_CATEGORIES : BATHROOM_CATEGORIES;
  const groups = room === "kitchen" ? KITCHEN_GROUPS : BATHROOM_GROUPS;
  const layoutForTotal = room === "kitchen" ? kitchenLayout : "standard";

  const community = COMMUNITIES.find((c) => c.id === communityId)!;
  const plan = FLOOR_PLANS.find((p) => p.id === floorPlanId)!;
  const total = totalFor(selections, layoutForTotal);
  const issues = selectionIssues(selections, layoutForTotal);
  const selectedCount = Object.keys(selections).length;

  // debug via ?debug=1
  const [debugEnabled, setDebugEnabled] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    setDebugEnabled(new URLSearchParams(window.location.search).has("debug"));
  }, []);

  // Track the most recently changed category → drives the "current change" pill on the preview.
  const [recentCategory, setRecentCategory] = useState<string | null>(null);
  const changeLabel = useMemo(() => {
    if (!recentCategory) return undefined;
    const cat = categories.find((c) => c.id === recentCategory);
    const prod = productById(selections[recentCategory]);
    if (!cat || !prod) return undefined;
    return `${cat.label} · ${prod.name}`;
  }, [recentCategory, categories, selections]);

  const handleSelect = (categoryId: string, productId: string) => {
    selectProduct(categoryId, productId);
    setRecentCategory(categoryId);
  };

  // Accordion expanded group (single-open on desktop).
  const [openGroup, setOpenGroup] = useState<string>(groups[0].id);
  // Reset the accordion when room changes.
  useEffect(() => {
    setOpenGroup(groups[0].id);
    setRecentCategory(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room]);

  // Mobile bottom-sheet picker.
  const [mobileGroup, setMobileGroup] = useState<string | null>(null);
  const activeMobileGroup = groups.find((g) => g.id === mobileGroup) ?? null;

  // Save dialog
  const [saveOpen, setSaveOpen] = useState(false);
  const [designName, setDesignName] = useState("");
  const handleSave = () => {
    const d = saveDesign(designName.trim());
    toast.success(`Saved "${d.name}"`);
    setSaveOpen(false);
    setDesignName("");
  };

  const groupIndex = groups.findIndex((g) => g.id === openGroup);
  const goPrev = () => {
    if (groupIndex > 0) setOpenGroup(groups[groupIndex - 1].id);
  };
  const goNext = () => {
    if (groupIndex < groups.length - 1) setOpenGroup(groups[groupIndex + 1].id);
  };

  return (
    <div className="mx-auto max-w-[1400px] px-3 py-4 sm:px-6 sm:py-6">
      {/* Compact header */}
      <div className="mb-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Design Studio</h1>
        <div className="text-xs text-muted-foreground">
          {plan.name} · {community.name}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <RoomToggle room={room} onChange={setRoom} />
        </div>
      </div>

      {/* Single, top-of-page demo disclaimer */}
      <p className="mb-3 rounded-md border border-border bg-secondary/40 px-3 py-1.5 text-[11px] text-muted-foreground">
        {CATALOG_META.disclaimer}
      </p>

      {/* Kitchen layout selector (kitchen only) */}
      {room === "kitchen" && (
        <div className="mb-3 inline-flex rounded-full border border-border bg-card p-0.5">
          {KITCHEN_LAYOUTS.map((l) => (
            <button
              key={l.id}
              onClick={() => setKitchenLayout(l.id)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                kitchenLayout === l.id
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              aria-pressed={kitchenLayout === l.id}
            >
              {l.label}
            </button>
          ))}
        </div>
      )}

      {/* Sticky action bar: total + Save/Compare/Review/Selections */}
      <ActionBar
        total={total}
        selectedCount={selectedCount}
        onSave={() => setSaveOpen(true)}
        onReset={resetSelections}
        selections={selections}
        categories={categories}
        layoutForTotal={layoutForTotal}
      />

      {/* Two-column workspace */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_400px] xl:grid-cols-[minmax(0,1fr)_440px]">
        {/* Preview column */}
        <div className="lg:sticky lg:top-4 lg:self-start">
          <RoomPreview
            room={room}
            selections={selections}
            className="w-full"
            hideChips
            enableMaskQA={debugEnabled}
            changeLabel={changeLabel}
          />

          {issues.length > 0 && (
            <div className="mt-3 rounded-lg border border-amber-300/60 bg-amber-50/60 p-3 text-amber-900 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-100">
              <div className="mb-1 flex items-center gap-2 text-xs font-semibold">
                <AlertTriangle className="h-3.5 w-3.5" /> Selection issue
              </div>
              <ul className="list-disc pl-5 text-[12px] leading-relaxed">
                {issues.slice(0, 3).map((i) => (
                  <li key={`${i.category}-${i.productId}`}>{i.message}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Selector column — desktop accordion */}
        <div className="hidden lg:block">
          <div className="rounded-2xl border border-border bg-card">
            <Accordion
              type="single"
              collapsible
              value={openGroup}
              onValueChange={(v) => setOpenGroup(v || groups[0].id)}
              className="divide-y divide-border"
            >
              {groups.map((g) => (
                <GroupAccordionItem
                  key={g.id}
                  group={g}
                  categories={categories}
                  selections={selections}
                  layoutForTotal={layoutForTotal}
                  onSelect={handleSelect}
                />
              ))}
            </Accordion>
            <div className="flex items-center justify-between gap-2 border-t border-border p-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={goPrev}
                disabled={groupIndex <= 0}
              >
                <ChevronLeft className="mr-1 h-4 w-4" /> Previous
              </Button>
              <div className="text-[11px] text-muted-foreground">
                {groupIndex + 1} of {groups.length}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={goNext}
                disabled={groupIndex >= groups.length - 1}
              >
                Next <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile category chip row */}
        <div className="lg:hidden">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {groups.map((g) => {
              const complete = g.categoryIds.every((cid) => !!selections[cid]);
              return (
                <button
                  key={g.id}
                  onClick={() => setMobileGroup(g.id)}
                  className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm"
                >
                  {complete && <CheckCircle2 className="h-3.5 w-3.5 text-foreground/60" />}
                  {g.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile picker sheet */}
      <Sheet open={!!mobileGroup} onOpenChange={(o) => !o && setMobileGroup(null)}>
        <SheetContent side="bottom" className="max-h-[60dvh] overflow-y-auto rounded-t-2xl">
          {activeMobileGroup && (
            <>
              <SheetHeader className="mb-2 text-left">
                <SheetTitle>{activeMobileGroup.label}</SheetTitle>
                <SheetDescription className="text-[11px]">
                  Tap a finish to update the preview. Your other selections stay put.
                </SheetDescription>
              </SheetHeader>
              <GroupPicker
                group={activeMobileGroup}
                categories={categories}
                selections={selections}
                layoutForTotal={layoutForTotal}
                onSelect={handleSelect}
                compact
              />
              <div className="mt-3 flex justify-end">
                <Button size="sm" onClick={() => setMobileGroup(null)}>
                  Done
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Save dialog */}
      <Dialog open={saveOpen} onOpenChange={setSaveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save this design</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="design-name">Design name</Label>
            <Input
              id="design-name"
              placeholder="Kitchen v1"
              value={designName}
              onChange={(e) => setDesignName(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ---------- Room + Action bar ----------

function RoomToggle({ room, onChange }: { room: "kitchen" | "bathroom"; onChange: (r: "kitchen" | "bathroom") => void }) {
  return (
    <div className="inline-flex rounded-full border border-border bg-card p-0.5">
      <button
        onClick={() => onChange("kitchen")}
        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition ${
          room === "kitchen" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
        }`}
        aria-pressed={room === "kitchen"}
      >
        <ChefHat className="h-3.5 w-3.5" /> Kitchen
      </button>
      <button
        onClick={() => onChange("bathroom")}
        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition ${
          room === "bathroom" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
        }`}
        aria-pressed={room === "bathroom"}
      >
        <Bath className="h-3.5 w-3.5" /> Bath
      </button>
    </div>
  );
}

function ActionBar({
  total,
  selectedCount,
  onSave,
  onReset,
  selections,
  categories,
  layoutForTotal,
}: {
  total: number;
  selectedCount: number;
  onSave: () => void;
  onReset: () => void;
  selections: Record<string, string>;
  categories: CategoryDef[];
  layoutForTotal: "standard" | "alt1";
}) {
  return (
    <div className="sticky top-2 z-30 mb-3 flex flex-wrap items-center gap-2 rounded-xl border border-border bg-background/95 p-2 shadow-sm backdrop-blur">
      <div className="flex min-w-0 items-baseline gap-2">
        <span className="text-[11px] uppercase tracking-widest text-muted-foreground">Total</span>
        <span className="text-lg font-semibold tabular-nums">{formatMoney(total)}</span>
      </div>
      <div className="ml-auto flex flex-wrap items-center gap-1.5">
        <SelectionsSheet
          selections={selections}
          categories={categories}
          layoutForTotal={layoutForTotal}
          selectedCount={selectedCount}
        />
        <Button variant="ghost" size="sm" onClick={onReset}>
          <RotateCcw className="h-3.5 w-3.5" /> Reset
        </Button>
        <Button variant="outline" size="sm" onClick={onSave}>
          <Save className="h-3.5 w-3.5" /> Save
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link to="/compare">
            <GitCompareArrows className="h-3.5 w-3.5" /> Compare
          </Link>
        </Button>
        <Button asChild size="sm">
          <Link to="/summary">
            <ClipboardList className="h-3.5 w-3.5" /> Review
          </Link>
        </Button>
      </div>
    </div>
  );
}

function SelectionsSheet({
  selections,
  categories,
  layoutForTotal,
  selectedCount,
}: {
  selections: Record<string, string>;
  categories: CategoryDef[];
  layoutForTotal: "standard" | "alt1";
  selectedCount: number;
}) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm">
          <Layers className="h-3.5 w-3.5" /> Selections ({selectedCount})
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Your selections</SheetTitle>
          <SheetDescription className="text-[11px]">
            Includes every category, with running upgrade totals per line.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-3 space-y-1.5 overflow-y-auto pr-1" style={{ maxHeight: "70dvh" }}>
          {categories.map((c) => {
            const p = productById(selections[c.id]);
            if (!p) return null;
            const price = priceFor(p, layoutForTotal);
            return (
              <div
                key={c.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card px-2.5 py-2"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    className="inline-block h-6 w-6 shrink-0 rounded-full border border-border"
                    style={{ background: p.swatch }}
                  />
                  <div className="min-w-0">
                    <div className="truncate text-xs text-muted-foreground">{c.label}</div>
                    <div className="truncate text-sm font-medium">{p.name}</div>
                  </div>
                </div>
                <div className="shrink-0 text-right text-xs tabular-nums">
                  {p.included ? (
                    <span className="text-muted-foreground">Included</span>
                  ) : (
                    <span>+{formatMoney(price)}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ---------- Accordion group item (desktop) ----------

function GroupAccordionItem({
  group,
  categories,
  selections,
  layoutForTotal,
  onSelect,
}: {
  group: MacroGroup;
  categories: CategoryDef[];
  selections: Record<string, string>;
  layoutForTotal: "standard" | "alt1";
  onSelect: (categoryId: string, productId: string) => void;
}) {
  const cats = group.categoryIds
    .map((id) => categories.find((c) => c.id === id))
    .filter((c): c is CategoryDef => !!c);
  const complete = cats.every((c) => !!selections[c.id]);
  // Summarise primary category (first) for the row.
  const primary = cats[0];
  const primaryProduct = primary ? productById(selections[primary.id]) : undefined;
  const primaryPrice = primaryProduct ? priceFor(primaryProduct, layoutForTotal) : 0;

  return (
    <AccordionItem value={group.id} className="border-0">
      <AccordionTrigger className="px-4 py-3 hover:no-underline">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {complete && (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-foreground/60" aria-hidden />
          )}
          {primaryProduct && (
            <span
              className="inline-block h-8 w-8 shrink-0 rounded-md border border-border"
              style={{ background: primaryProduct.swatch }}
            />
          )}
          <div className="min-w-0 flex-1 text-left">
            <div className="truncate text-sm font-medium">{group.label}</div>
            {primaryProduct && (
              <div className="truncate text-[11px] text-muted-foreground">
                {primaryProduct.name}
              </div>
            )}
          </div>
          <div className="shrink-0 pr-2 text-[11px] tabular-nums text-muted-foreground">
            {primaryProduct?.included
              ? "Included"
              : primaryProduct
              ? `+${formatMoney(primaryPrice)}`
              : ""}
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-3 pb-4">
        <GroupPicker
          group={group}
          categories={categories}
          selections={selections}
          layoutForTotal={layoutForTotal}
          onSelect={onSelect}
        />
      </AccordionContent>
    </AccordionItem>
  );
}

// ---------- Group picker (shared: desktop accordion body & mobile sheet body) ----------

function GroupPicker({
  group,
  categories,
  selections,
  layoutForTotal,
  onSelect,
  compact,
}: {
  group: MacroGroup;
  categories: CategoryDef[];
  selections: Record<string, string>;
  layoutForTotal: "standard" | "alt1";
  onSelect: (categoryId: string, productId: string) => void;
  compact?: boolean;
}) {
  const cats = group.categoryIds
    .map((id) => categories.find((c) => c.id === id))
    .filter((c): c is CategoryDef => !!c);
  // Segmented sub-category tabs when >1 category in the group.
  const [activeCat, setActiveCat] = useState<string>(cats[0]?.id ?? "");
  useEffect(() => {
    // reset if group changes
    setActiveCat(cats[0]?.id ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [group.id]);

  const cat = cats.find((c) => c.id === activeCat) ?? cats[0];
  if (!cat) return null;

  const products = productsFor("kitchen", cat.id, layoutForTotal).length
    ? productsFor("kitchen", cat.id, layoutForTotal)
    : productsFor("bathroom", cat.id, layoutForTotal);

  const selectedId = selections[cat.id];

  return (
    <div className="space-y-3">
      {cats.length > 1 && (
        <div className="inline-flex flex-wrap gap-1 rounded-full border border-border bg-secondary/40 p-0.5">
          {cats.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCat(c.id)}
              className={`rounded-full px-3 py-1.5 text-[12px] font-medium transition ${
                activeCat === c.id
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              aria-pressed={activeCat === c.id}
            >
              {c.label.replace(/^Kitchen |^Island /, "")}
            </button>
          ))}
        </div>
      )}

      <div
        className={`grid gap-2 ${
          compact ? "grid-cols-2" : "grid-cols-2 md:grid-cols-3"
        }`}
      >
        {products.map((p) => {
          const compat = isProductCompatible(p, selections);
          return (
            <ProductSwatch
              key={p.id}
              product={p}
              selected={selectedId === p.id}
              disabled={!compat.ok}
              disabledReason={compat.ok ? undefined : compat.reason}
              onSelect={() => onSelect(cat.id, p.id)}
            />
          );
        })}
      </div>

      {group.id === "countertops" && (
        <VisualFinishPicker
          which={activeCat === "islandCounter" ? "island" : "perimeter"}
          compact={compact}
        />
      )}
    </div>
  );
}

// ---------- Visual finish picker ----------

function VisualFinishPicker({
  which,
  compact,
}: {
  which: "perimeter" | "island";
  compact?: boolean;
}) {
  const perimeter = useStudio((s) => s.perimeterVisualFinishId);
  const island = useStudio((s) => s.islandVisualFinishId);
  const setVisualFinish = useStudio((s) => s.setVisualFinish);
  const currentId = which === "perimeter" ? perimeter : island;
  const [family, setFamily] = useState<string>("all");
  const [showAll, setShowAll] = useState(false);
  const filtered = STONE_TEXTURES.filter(
    (s) => family === "all" || s.colorFamily === family,
  );
  const shown = showAll
    ? filtered
    : filtered.filter((s) => RECOMMENDED_FINISH_IDS.includes(s.id)).slice(0, 6);

  return (
    <div className="mt-2 rounded-xl border border-dashed border-border bg-secondary/30 p-3">
      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
        <div className="text-[11px] font-medium">
          Visual finish · {which === "perimeter" ? "Perimeter countertop" : "Island countertop"}
        </div>
        <div className="text-[10px] text-muted-foreground">
          Illustrative texture only — does not change price.
        </div>
      </div>
      <div className="mb-2 flex flex-wrap gap-1">
        {COLOR_FAMILIES.map((f) => (
          <button
            key={f.id}
            onClick={() => setFamily(f.id)}
            className={`rounded-full border px-2 py-0.5 text-[10px] transition ${
              family === f.id
                ? "border-foreground bg-foreground text-background"
                : "border-border bg-background text-muted-foreground hover:text-foreground"
            }`}
            aria-pressed={family === f.id}
          >
            {f.label}
          </button>
        ))}
      </div>
      <div className={`grid gap-2 ${compact ? "grid-cols-3" : "grid-cols-3 md:grid-cols-4"}`}>
        {shown.map((s) => {
          const selected = currentId === s.id;
          return (
            <button
              key={s.id}
              onClick={() => setVisualFinish(which, s.id)}
              className={`group relative overflow-hidden rounded-lg border text-left transition ${
                selected ? "border-foreground ring-2 ring-foreground/20" : "border-border hover:border-foreground/40"
              }`}
              aria-pressed={selected}
              title={s.name}
            >
              <StoneSwatchThumb def={s} size={72} className="block h-14 w-full object-cover" />
              <div className="px-1.5 py-1">
                <div className="truncate text-[10px] font-medium leading-tight">{s.name}</div>
                <div className="text-[9px] uppercase tracking-widest text-muted-foreground">
                  {s.family}
                </div>
              </div>
            </button>
          );
        })}
      </div>
      {filtered.length > shown.length && !showAll && (
        <button
          onClick={() => setShowAll(true)}
          className="mt-2 text-[11px] font-medium text-foreground/80 underline underline-offset-2 hover:text-foreground"
        >
          View all {filtered.length} finishes
        </button>
      )}
    </div>
  );
}


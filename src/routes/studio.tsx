import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  BATHROOM_CATEGORIES,
  COMMUNITIES,
  FLOOR_PLANS,
  KITCHEN_CATEGORIES,
  formatMoney,
  productById,
  productsFor,
  totalFor,
} from "@/lib/catalog";
import { useStudio } from "@/lib/store";
import { RoomPreview } from "@/components/RoomPreview";
import { ProductSwatch } from "@/components/ProductSwatch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GitCompareArrows, Save, ClipboardList, ChefHat, Bath, RotateCcw } from "lucide-react";

export const Route = createFileRoute("/studio")({
  head: () => ({
    meta: [
      { title: "Design Studio — HomeVision" },
      { name: "description", content: "Customize your kitchen or bath finishes and see the whole room update." },
    ],
  }),
  component: StudioPage,
});

function StudioPage() {
  const { room, selections, communityId, floorPlanId } = useStudio();
  const setRoom = useStudio((s) => s.setRoom);
  const selectProduct = useStudio((s) => s.selectProduct);
  const saveDesign = useStudio((s) => s.saveDesign);
  const resetSelections = useStudio((s) => s.resetSelections);

  const categories = room === "kitchen" ? KITCHEN_CATEGORIES : BATHROOM_CATEGORIES;
  const [activeCat, setActiveCat] = useState<string>(categories[0].id);
  const community = COMMUNITIES.find((c) => c.id === communityId)!;
  const plan = FLOOR_PLANS.find((p) => p.id === floorPlanId)!;
  const total = useMemo(() => totalFor(selections), [selections]);

  const [saveOpen, setSaveOpen] = useState(false);
  const [designName, setDesignName] = useState("");

  const handleSave = () => {
    const d = saveDesign(designName || `${plan.name} · ${room === "kitchen" ? "Kitchen" : "Bath"}`);
    setSaveOpen(false);
    setDesignName("");
    toast.success(`Saved "${d.name}"`);
  };

  return (
    <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
      {/* HEADER ROW */}
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:flex-wrap sm:justify-between mb-6">
        <div className="min-w-0">
          <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            {community.name} · {plan.name}
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

      <div className="grid gap-6 lg:grid-cols-[1.55fr_1fr]">
        {/* PREVIEW COLUMN */}
        <div className="space-y-4">
          <RoomPreview room={room} selections={selections} className="aspect-[4/3] lg:aspect-[16/10]" />

          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex flex-col gap-4 sm:grid sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
              <div className="min-w-0">
                <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Running upgrade total</div>
                <div className="mt-1 font-display text-3xl sm:text-4xl leading-none">
                  {formatMoney(total)}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {Object.keys(selections).length} selections · {countUpgrades(selections)} upgrades
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 justify-end">
                <Button variant="ghost" size="sm" onClick={resetSelections} className="gap-1.5">
                  <RotateCcw className="h-3.5 w-3.5" /> Reset
                </Button>
                <Dialog open={saveOpen} onOpenChange={setSaveOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="gap-1.5"><Save className="h-3.5 w-3.5" /> Save design</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Save this design</DialogTitle></DialogHeader>
                    <div className="space-y-2 py-2">
                      <Label htmlFor="dname">Design name</Label>
                      <Input id="dname" placeholder={`${plan.name} · ${room === "kitchen" ? "Kitchen" : "Bath"}`} value={designName} onChange={(e) => setDesignName(e.target.value)} />
                    </div>
                    <DialogFooter>
                      <Button variant="ghost" onClick={() => setSaveOpen(false)}>Cancel</Button>
                      <Button onClick={handleSave}>Save</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <Link to="/compare"><Button variant="outline" size="sm" className="gap-1.5"><GitCompareArrows className="h-3.5 w-3.5" /> Compare</Button></Link>
                <Link to="/summary"><Button variant="outline" size="sm" className="gap-1.5"><ClipboardList className="h-3.5 w-3.5" /> Review</Button></Link>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-muted-foreground px-1">
            Room previews are illustrative. Actual installed colors, textures, and materials may vary.
          </p>
        </div>

        {/* SELECTION PANEL */}
        <div className="rounded-2xl border border-border bg-card">
          <div className="border-b border-border p-4 sm:p-5">
            <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Finish selections</div>
            <div className="font-display text-2xl mt-1">
              {room === "kitchen" ? "Kitchen" : "Bathroom"} finishes
            </div>
          </div>
          <Tabs value={activeCat} onValueChange={setActiveCat} className="w-full">
            <div className="px-2 pt-3 sm:px-3">
              <TabsList className="h-auto flex w-full flex-wrap justify-start gap-1 bg-transparent p-0">
                {categories.map((c) => (
                  <TabsTrigger
                    key={c.id}
                    value={c.id}
                    className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs px-3 py-1.5"
                  >
                    {c.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {categories.map((c) => {
              const options = productsFor(room, c.id);
              const selectedProduct = productById(selections[c.id]);
              return (
                <TabsContent key={c.id} value={c.id} className="p-4 sm:p-5">
                  <div className="mb-3 grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-3">
                    <div className="min-w-0">
                      <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Selected</div>
                      <div className="font-display text-xl truncate">{selectedProduct?.name ?? "—"}</div>
                    </div>
                    <div className="text-right text-sm shrink-0">
                      {selectedProduct?.included ? (
                        <span className="text-muted-foreground">Included</span>
                      ) : (
                        <span className="text-foreground">+{formatMoney(selectedProduct?.price ?? 0)}</span>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {options.map((p) => (
                      <ProductSwatch
                        key={p.id}
                        product={p}
                        selected={selections[c.id] === p.id}
                        onSelect={() => selectProduct(c.id, p.id)}
                      />
                    ))}
                  </div>
                </TabsContent>
              );
            })}
          </Tabs>
        </div>
      </div>
    </div>
  );
}

function countUpgrades(sel: Record<string, string>) {
  return Object.values(sel).filter((id) => {
    const p = productById(id);
    return p && !p.included;
  }).length;
}

function RoomToggle({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs transition ${
        active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import { toast } from "sonner";
import { useStudio, type SavedDesign } from "@/lib/store";
import {
  BATHROOM_CATEGORIES,
  COMMUNITIES,
  FLOOR_PLANS,
  KITCHEN_CATEGORIES,
  formatMoney,
  productById,
  totalFor,
} from "@/lib/catalog";
import { RoomPreview } from "@/components/RoomPreview";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Check, Trash2 } from "lucide-react";

export const Route = createFileRoute("/compare")({
  head: () => ({
    meta: [
      { title: "Compare designs — HomeVision Studio" },
      { name: "description", content: "Compare two saved designs side by side and pick your favorite." },
    ],
  }),
  component: ComparePage,
});

function ComparePage() {
  const { savedDesigns, compareIds } = useStudio();
  const setCompare = useStudio((s) => s.setCompare);
  const deleteDesign = useStudio((s) => s.deleteDesign);

  useEffect(() => {
    if (savedDesigns.length && !compareIds[0]) {
      setCompare(savedDesigns[0].id, savedDesigns[1]?.id ?? null);
    }
  }, [savedDesigns, compareIds, setCompare]);

  const a = savedDesigns.find((d) => d.id === compareIds[0]);
  const b = savedDesigns.find((d) => d.id === compareIds[1]);

  return (
    <div className="mx-auto max-w-[1400px] px-5 sm:px-8 py-10">
      <div className="mb-8 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4 sm:flex sm:flex-wrap sm:justify-between">
        <div className="min-w-0">
          <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Compare</div>
          <h1 className="mt-1 font-display text-4xl sm:text-5xl leading-tight">Two designs, side by side.</h1>
        </div>
        <Link to="/studio"><Button variant="outline" size="sm">Back to Studio</Button></Link>
      </div>

      {savedDesigns.length < 2 ? (
        <EmptyState count={savedDesigns.length} />
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <DesignColumn
            label="Design A"
            design={a}
            other={b}
            options={savedDesigns}
            onSelect={(id) => setCompare(id, compareIds[1])}
            onDelete={(id) => { deleteDesign(id); toast.message("Design deleted"); }}
          />
          <DesignColumn
            label="Design B"
            design={b}
            other={a}
            options={savedDesigns}
            onSelect={(id) => setCompare(compareIds[0], id)}
            onDelete={(id) => { deleteDesign(id); toast.message("Design deleted"); }}
          />
        </div>
      )}
    </div>
  );
}

function EmptyState({ count }: { count: number }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card p-16 text-center">
      <div className="font-display text-2xl">Save at least two designs to compare</div>
      <p className="mt-2 text-sm text-muted-foreground">
        You currently have {count} saved {count === 1 ? "design" : "designs"}. Open the Studio, then save a design to add it here.
      </p>
      <div className="mt-6">
        <Link to="/studio"><Button>Open Studio</Button></Link>
      </div>
    </div>
  );
}

function DesignColumn({
  label,
  design,
  other,
  options,
  onSelect,
  onDelete,
}: {
  label: string;
  design?: SavedDesign;
  other?: SavedDesign;
  options: SavedDesign[];
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const cats = useMemo(
    () => (design?.room === "bathroom" ? BATHROOM_CATEGORIES : KITCHEN_CATEGORIES),
    [design?.room]
  );
  const total = design ? totalFor(design.selections) : 0;
  const community = design ? COMMUNITIES.find((c) => c.id === design.communityId) : undefined;
  const plan = design ? FLOOR_PLANS.find((p) => p.id === design.floorPlanId) : undefined;

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="p-4 border-b border-border grid grid-cols-[minmax(0,1fr)_auto] gap-3 items-center">
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">{label}</div>
          <Select value={design?.id ?? ""} onValueChange={onSelect}>
            <SelectTrigger className="border-0 px-0 h-auto text-lg font-display shadow-none focus:ring-0 truncate">
              <SelectValue placeholder="Select a design" />
            </SelectTrigger>
            <SelectContent>
              {options.map((d) => (
                <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {design && (
          <button onClick={() => onDelete(design.id)} className="text-muted-foreground hover:text-destructive" aria-label="Delete design">
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      {design ? (
        <>
          <RoomPreview room={design.room} selections={design.selections} className="aspect-[16/10] rounded-none border-0 border-b border-border" />
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Stat label="Community" value={community?.name ?? "—"} />
              <Stat label="Floor plan" value={plan?.name ?? "—"} />
              <Stat label="Room" value={design.room === "kitchen" ? "Kitchen" : "Primary Bath"} />
              <Stat label="Upgrade total" value={formatMoney(total)} accent />
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground mb-2">Selections</div>
              <ul className="divide-y divide-border">
                {cats.map((c) => {
                  const p = productById(design.selections[c.id]);
                  const otherP = other ? productById(other.selections[c.id]) : undefined;
                  const isDifferent = otherP && p && otherP.id !== p.id;
                  return (
                    <li key={c.id} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 py-2.5">
                      <div className="h-7 w-7 rounded-md border border-border" style={{ background: p?.swatch }} />
                      <div className="min-w-0">
                        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{c.label}</div>
                        <div className="truncate text-sm">
                          {p?.name}
                          {isDifferent && <span className="ml-2 rounded-full bg-accent/15 px-1.5 py-0.5 text-[10px] uppercase tracking-widest text-accent">Different</span>}
                        </div>
                      </div>
                      <div className="text-sm text-right shrink-0">
                        {p?.included ? <span className="text-muted-foreground">—</span> : <span>+{formatMoney(p?.price ?? 0)}</span>}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
            <Button className="w-full gap-2" onClick={() => toast.success(`${design.name} chosen as your preferred design`)}>
              <Check className="h-4 w-4" /> Choose this design
            </Button>
          </div>
        </>
      ) : (
        <div className="p-12 text-center text-sm text-muted-foreground">Select a saved design.</div>
      )}
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-lg bg-secondary/60 p-3">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className={`mt-1 font-display text-lg leading-tight truncate ${accent ? "text-accent" : ""}`}>{value}</div>
    </div>
  );
}

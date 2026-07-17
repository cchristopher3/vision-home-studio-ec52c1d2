import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { useStudio } from "@/lib/store";
import {
  BATHROOM_CATEGORIES,
  BUILDERS,
  CATALOG_META,
  COMMUNITIES,
  FLOOR_PLANS,
  KITCHEN_CATEGORIES,
  formatMoney,
  priceFor,
  productById,
  totalFor,
} from "@/lib/catalog";
import { RoomPreview } from "@/components/RoomPreview";
import { Button } from "@/components/ui/button";
import { Download, Send, Share2 } from "lucide-react";

export const Route = createFileRoute("/summary")({
  head: () => ({
    meta: [
      { title: "Selection summary — HomeVision Studio" },
      { name: "description", content: "Your complete finish selections, upgrade totals, and estimated payment impact." },
    ],
  }),
  component: SummaryPage,
});

function SummaryPage() {
  const { room, selections, builderId, communityId, floorPlanId, kitchenLayout } = useStudio();
  const cats = room === "kitchen" ? KITCHEN_CATEGORIES : BATHROOM_CATEGORIES;
  const layoutForTotal = room === "kitchen" ? kitchenLayout : "standard";
  const total = totalFor(selections, layoutForTotal);
  const builder = BUILDERS.find((b) => b.id === builderId)!;
  const community = COMMUNITIES.find((c) => c.id === communityId)!;
  const plan = FLOOR_PLANS.find((p) => p.id === floorPlanId)!;
  // 30-yr @ ~7% illustrative
  const monthly = Math.round((total * 0.0066) || 0);

  return (
    <div className="mx-auto max-w-5xl px-5 sm:px-8 py-12">
      <div className="mb-8 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3 sm:flex sm:flex-wrap sm:justify-between">
        <div className="min-w-0">
          <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Selection summary</div>
          <h1 className="mt-1 font-display text-4xl sm:text-5xl leading-tight">Your design, at a glance.</h1>
        </div>
        <Link to="/studio"><Button variant="outline" size="sm">Back to Studio</Button></Link>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <RoomPreview room={room} selections={selections} className="aspect-[16/9] rounded-none border-0 border-b border-border" />

        <div className="grid gap-6 p-6 sm:p-8 md:grid-cols-[1.4fr_1fr]">
          <div>
            <dl className="grid grid-cols-2 gap-4">
              <Field label="Builder" value={builder.name} />
              <Field label="Community" value={community.name} />
              <Field label="Floor plan" value={plan.name} />
              <Field label="Room" value={room === "kitchen" ? "Kitchen" : "Primary Bath"} />
            </dl>

            <div className="mt-8">
              <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground mb-3">Selected products</div>
              <ul className="divide-y divide-border">
                {cats.map((c) => {
                  const p = productById(selections[c.id]);
                  if (!p) return null;
                  return (
                    <li key={c.id} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 py-3">
                      <div className="h-9 w-9 rounded-md border border-border" style={{ background: p.swatch }} />
                      <div className="min-w-0">
                        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                          {c.label}{p.code ? ` · ${p.code}` : ""}
                        </div>
                        <div className="truncate text-sm">{p.name} <span className="text-muted-foreground">· {p.manufacturer}</span></div>
                      </div>
                      <div className="text-sm shrink-0 text-right">
                        {p.included ? <span className="text-muted-foreground">Included</span> : <span>+{formatMoney(priceFor(p, layoutForTotal))}</span>}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-2xl bg-secondary/60 p-6">
              <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Total upgrade cost</div>
              <div className="mt-2 font-display text-5xl leading-none">{formatMoney(total)}</div>
              <div className="mt-4 border-t border-border pt-4">
                <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Est. payment impact</div>
                <div className="mt-1 font-display text-2xl">+{formatMoney(monthly)}<span className="text-sm text-muted-foreground font-sans"> / month</span></div>
                <p className="mt-2 text-[11px] text-muted-foreground leading-relaxed">
                  Illustrative estimate at ~7% APR over 30 years. Not a loan offer. Confirm with your lender.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Button className="w-full gap-2" onClick={() => toast.success("Shareable link copied")}>
                <Share2 className="h-4 w-4" /> Share Design
              </Button>
              <Button variant="outline" className="w-full gap-2" onClick={() => toast.success("Summary PDF prepared")}>
                <Download className="h-4 w-4" /> Download Summary
              </Button>
              <Button variant="outline" className="w-full gap-2" onClick={() => toast.success("Sent to your design consultant")}>
                <Send className="h-4 w-4" /> Send to Design Consultant
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground px-1">
              {CATALOG_META.disclaimer}
            </p>
          </aside>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-1 font-display text-xl truncate">{value}</div>
    </div>
  );
}

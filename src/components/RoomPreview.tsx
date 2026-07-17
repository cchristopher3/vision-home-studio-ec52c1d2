import kitchenClassic from "@/assets/kitchen-classic.jpg";
import kitchenMoody from "@/assets/kitchen-moody.jpg";
import bathClassic from "@/assets/bath-classic.jpg";
import bathMoody from "@/assets/bath-moody.jpg";
import {
  BATHROOM_CATEGORIES,
  KITCHEN_CATEGORIES,
  dominantTone,
  productById,
  type Room,
} from "@/lib/catalog";

export function roomImage(room: Room, selections: Record<string, string>) {
  const tone = dominantTone(room, selections);
  if (room === "kitchen") return tone === "dark" ? kitchenMoody : kitchenClassic;
  return tone === "dark" ? bathMoody : bathClassic;
}

// Category IDs that meaningfully contribute a color/finish tone to the room.
const KITCHEN_WASHES: { key: string; blend: string; opacity: number }[] = [
  { key: "cabinets", blend: "multiply", opacity: 0.18 },
  { key: "islandFinish", blend: "multiply", opacity: 0.12 },
  { key: "perimeterFinish", blend: "multiply", opacity: 0.08 },
  { key: "countertops", blend: "overlay", opacity: 0.1 },
  { key: "backsplash", blend: "soft-light", opacity: 0.18 },
  { key: "faucet", blend: "overlay", opacity: 0.08 },
];

const BATH_WASHES: { key: string; blend: string; opacity: number }[] = [
  { key: "wallPaint", blend: "multiply", opacity: 0.15 },
  { key: "vanity", blend: "multiply", opacity: 0.15 },
  { key: "countertop", blend: "overlay", opacity: 0.1 },
  { key: "showerTile", blend: "soft-light", opacity: 0.18 },
  { key: "faucets", blend: "overlay", opacity: 0.08 },
];

export function RoomPreview({
  room,
  selections,
  className = "",
}: {
  room: Room;
  selections: Record<string, string>;
  className?: string;
}) {
  const img = roomImage(room, selections);
  const washes = room === "kitchen" ? KITCHEN_WASHES : BATH_WASHES;
  const categories = room === "kitchen" ? KITCHEN_CATEGORIES : BATHROOM_CATEGORIES;

  // Every selected product becomes a live chip in the palette bar.
  const chips = categories
    .map((c) => {
      const p = productById(selections[c.id]);
      if (!p) return null;
      return { catLabel: c.label, product: p };
    })
    .filter((x): x is { catLabel: string; product: NonNullable<ReturnType<typeof productById>> } => !!x);

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-border bg-muted ${className}`}>
      <div className="relative aspect-[16/10] w-full">
        <img
          src={img}
          alt={`${room} preview`}
          className="absolute inset-0 h-full w-full object-cover transition-all duration-700"
          width={1600}
          height={1000}
        />
        {washes.map((w) => {
          const p = productById(selections[w.key]);
          if (!p?.swatch) return null;
          return (
            <div
              key={w.key}
              className="pointer-events-none absolute inset-0 transition-opacity duration-500"
              style={{ background: p.swatch, mixBlendMode: w.blend as React.CSSProperties["mixBlendMode"], opacity: w.opacity }}
            />
          );
        })}

        {/* Countertop band — horizontal stripe to hint at surface */}
        {(() => {
          const ctKey = room === "kitchen" ? "countertops" : "countertop";
          const ct = productById(selections[ctKey]);
          if (!ct?.swatch) return null;
          return (
            <div
              className="pointer-events-none absolute left-0 right-0 top-[52%] h-[6%] opacity-70 mix-blend-multiply transition-all duration-500"
              style={{ background: ct.swatch }}
            />
          );
        })()}

        {/* Backsplash band */}
        {(() => {
          const bsp = productById(selections[room === "kitchen" ? "backsplash" : "showerTile"]);
          if (!bsp?.swatch) return null;
          return (
            <div
              className="pointer-events-none absolute left-0 right-0 top-[36%] h-[16%] opacity-40 mix-blend-soft-light transition-all duration-500"
              style={{ background: bsp.swatch }}
            />
          );
        })()}

        <div className="pointer-events-none absolute bottom-3 right-3 rounded-full bg-background/85 px-3 py-1 text-[10px] uppercase tracking-widest text-muted-foreground backdrop-blur">
          Live preview · updates with every selection
        </div>
      </div>

      {/* Live selection palette — every category chip updates on selection */}
      {chips.length > 0 && (
        <div className="border-t border-border bg-card/60 p-3">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
            Your selections
          </div>
          <div className="flex flex-wrap gap-1.5">
            {chips.map(({ catLabel, product }) => (
              <div
                key={product.category}
                className="flex items-center gap-1.5 rounded-full border border-border bg-background/80 pl-1 pr-2 py-1 text-[10px]"
                title={`${catLabel}: ${product.name}`}
              >
                <span
                  className="inline-block h-4 w-4 rounded-full border border-border shrink-0"
                  style={{ background: product.swatch }}
                />
                <span className="text-muted-foreground">{catLabel}:</span>
                <span className="font-medium text-foreground truncate max-w-[10rem]">{product.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

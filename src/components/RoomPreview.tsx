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

/**
 * Each layer is an independent visual surface driven by ONE category.
 * When that category's selection changes, only that layer re-keys and
 * fades in — every other layer stays mounted and untouched.
 */
type LayerKind = "wash" | "band";
type Layer = {
  id: string;              // stable layer id (Cabinets, Countertop, …)
  categoryKey: string;     // selection key it listens to
  kind: LayerKind;
  blend: React.CSSProperties["mixBlendMode"];
  opacity: number;
  // band-only:
  top?: string;
  height?: string;
};

const KITCHEN_LAYERS: Layer[] = [
  { id: "wallPaint",   categoryKey: "wallPaint",       kind: "band", blend: "multiply",   opacity: 0.22, top: "0%",   height: "34%" },
  { id: "backsplash",  categoryKey: "backsplash",      kind: "band", blend: "soft-light", opacity: 0.55, top: "34%",  height: "18%" },
  { id: "countertops", categoryKey: "countertops",     kind: "band", blend: "multiply",   opacity: 0.65, top: "52%",  height: "6%"  },
  { id: "cabinets",    categoryKey: "cabinets",        kind: "wash", blend: "multiply",   opacity: 0.22 },
  { id: "perimeter",   categoryKey: "perimeterFinish", kind: "wash", blend: "multiply",   opacity: 0.10 },
  { id: "islandFinish",categoryKey: "islandFinish",    kind: "band", blend: "multiply",   opacity: 0.55, top: "62%",  height: "22%" },
  { id: "islandTrim",  categoryKey: "islandTrim",      kind: "band", blend: "overlay",    opacity: 0.6,  top: "84%",  height: "3%"  },
  { id: "flooring",    categoryKey: "flooring",        kind: "band", blend: "multiply",   opacity: 0.5,  top: "87%",  height: "13%" },
  { id: "sink",        categoryKey: "sink",            kind: "band", blend: "overlay",    opacity: 0.45, top: "56%",  height: "4%"  },
  { id: "faucet",      categoryKey: "faucet",          kind: "wash", blend: "overlay",    opacity: 0.06 },
  { id: "appliances",  categoryKey: "refrigerator",    kind: "band", blend: "overlay",    opacity: 0.35, top: "30%",  height: "28%" },
];

const BATH_LAYERS: Layer[] = [
  { id: "wallPaint",  categoryKey: "wallPaint",  kind: "wash", blend: "multiply",   opacity: 0.18 },
  { id: "vanity",     categoryKey: "vanity",     kind: "band", blend: "multiply",   opacity: 0.55, top: "58%", height: "26%" },
  { id: "countertop", categoryKey: "countertop", kind: "band", blend: "multiply",   opacity: 0.65, top: "54%", height: "5%"  },
  { id: "showerTile", categoryKey: "showerTile", kind: "band", blend: "soft-light", opacity: 0.5,  top: "10%", height: "40%" },
  { id: "floorTile",  categoryKey: "floorTile",  kind: "band", blend: "multiply",   opacity: 0.5,  top: "84%", height: "16%" },
  { id: "faucets",    categoryKey: "faucets",    kind: "wash", blend: "overlay",    opacity: 0.08 },
];

function LayerNode({ layer, productId, swatch }: { layer: Layer; productId: string; swatch: string }) {
  // key={productId} → only this layer remounts (and fades in) when its
  // own selection changes; sibling layers keep their existing DOM.
  const style: React.CSSProperties =
    layer.kind === "wash"
      ? { position: "absolute", inset: 0, background: swatch, mixBlendMode: layer.blend, opacity: layer.opacity }
      : {
          position: "absolute",
          left: 0,
          right: 0,
          top: layer.top,
          height: layer.height,
          background: swatch,
          mixBlendMode: layer.blend,
          opacity: layer.opacity,
        };
  return (
    <div
      key={productId}
      className="pointer-events-none animate-fade-in"
      style={{ ...style, animationDuration: "400ms" }}
      data-layer={layer.id}
      data-product={productId}
    />
  );
}

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
  const layers = room === "kitchen" ? KITCHEN_LAYERS : BATH_LAYERS;
  const categories = room === "kitchen" ? KITCHEN_CATEGORIES : BATHROOM_CATEGORIES;

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
        {/* Cross-fade the base image when dominant tone flips. */}
        <img
          key={img}
          src={img}
          alt={`${room} preview`}
          className="absolute inset-0 h-full w-full object-cover animate-fade-in"
          style={{ animationDuration: "500ms" }}
          width={1600}
          height={1000}
        />

        {layers.map((layer) => {
          const productId = selections[layer.categoryKey];
          const product = productById(productId);
          if (!product?.swatch) return null;
          return (
            // Outer wrapper stays mounted; inner LayerNode re-keys on productId
            // so only the affected layer fades on change.
            <div key={layer.id} className="pointer-events-none absolute inset-0">
              <LayerNode layer={layer} productId={productId} swatch={product.swatch} />
            </div>
          );
        })}

        <div className="pointer-events-none absolute bottom-3 right-3 rounded-full bg-background/85 px-3 py-1 text-[10px] uppercase tracking-widest text-muted-foreground backdrop-blur">
          Live preview · updates with every selection
        </div>
      </div>

      {chips.length > 0 && (
        <div className="border-t border-border bg-card/60 p-3">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
            Your selections
          </div>
          <div className="flex flex-wrap gap-1.5">
            {chips.map(({ catLabel, product }) => (
              <div
                key={product.category}
                className="flex items-center gap-1.5 rounded-full border border-border bg-background/80 pl-1 pr-2 py-1 text-[10px] animate-fade-in"
                title={`${catLabel}: ${product.name}`}
              >
                <span
                  key={product.id}
                  className="inline-block h-4 w-4 rounded-full border border-border shrink-0 animate-fade-in"
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

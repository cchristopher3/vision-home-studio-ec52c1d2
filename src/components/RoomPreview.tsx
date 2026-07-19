import { useState } from "react";
import { Eye } from "lucide-react";
import bathClassic from "@/assets/bath-classic.jpg";
import bathMoody from "@/assets/bath-moody.jpg";
import kitchenBase from "@/assets/kitchen-scene-A.jpg";
import {
  BATHROOM_CATEGORIES,
  KITCHEN_CATEGORIES,
  dominantTone,
  productById,
  type Product,
  type Room,
} from "@/lib/catalog";
import { KitchenPhotoScene } from "@/components/KitchenPhotoScene";
import { useStudio } from "@/lib/store";

export function roomImage(room: Room, selections: Record<string, string>) {
  if (room === "kitchen") return kitchenBase;
  const tone = dominantTone(room, selections);
  return tone === "dark" ? bathMoody : bathClassic;
}

function KitchenPreview({
  selections,
  className,
  hideChips,
  changeLabel,
}: {
  selections: Record<string, string>;
  className: string;
  hideChips?: boolean;
  changeLabel?: string;
}) {
  const [showBase, setShowBase] = useState(false);
  const perimeterVisualFinishId = useStudio((s) => s.perimeterVisualFinishId);
  const islandVisualFinishId = useStudio((s) => s.islandVisualFinishId);

  const chips = KITCHEN_CATEGORIES.map((c) => {
    const p = productById(selections[c.id]);
    if (!p) return null;
    return { catLabel: c.label, product: p };
  }).filter((x): x is { catLabel: string; product: Product } => !!x);

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-border bg-muted ${className}`}>
      <div className="relative w-full">
        <KitchenPhotoScene
          selections={selections}
          perimeterVisualFinishId={perimeterVisualFinishId}
          islandVisualFinishId={islandVisualFinishId}
          before={showBase}
        />

        <div className="absolute left-3 top-3 max-w-[70%] rounded-full bg-background/90 px-3 py-1.5 text-[11px] font-medium text-foreground shadow-sm backdrop-blur">
          <span className="truncate">
            {showBase ? "Before · curated base scene" : changeLabel ?? "Illustrative curated preview"}
          </span>
        </div>

        <div className="absolute right-3 top-3 flex gap-1.5">
          <button
            onClick={() => setShowBase(false)}
            aria-pressed={!showBase}
            className={`inline-flex min-h-8 items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium shadow-sm backdrop-blur transition ${
              !showBase ? "bg-foreground text-background" : "bg-background/90 text-foreground hover:bg-background"
            }`}
          >
            <Eye className="h-3 w-3" /> Selections
          </button>
          <button
            onClick={() => setShowBase(true)}
            aria-pressed={showBase}
            className={`inline-flex min-h-8 items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium shadow-sm backdrop-blur transition ${
              showBase ? "bg-foreground text-background" : "bg-background/90 text-foreground hover:bg-background"
            }`}
          >
            Before
          </button>
        </div>
      </div>

      {!hideChips && chips.length > 0 && (
        <div className="border-t border-border bg-card/80 p-3">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
            Your selections
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible">
            {chips.map(({ catLabel, product }) => (
              <div
                key={product.category}
                className="flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-background/80 pl-1 pr-2 py-1 text-[10px]"
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




// -------- bathroom preview (unchanged) --------

type BandLayer = {
  id: string;
  categoryKey: string;
  blend: React.CSSProperties["mixBlendMode"];
  opacity: number;
  top: string;
  height: string;
  kind: "band" | "wash";
};

const BATH_LAYERS: BandLayer[] = [
  { id: "wallPaint",  categoryKey: "wallPaint",  kind: "wash", blend: "multiply",   opacity: 0.18, top: "0",   height: "0" },
  { id: "vanity",     categoryKey: "vanity",     kind: "band", blend: "multiply",   opacity: 0.55, top: "58%", height: "26%" },
  { id: "countertop", categoryKey: "countertop", kind: "band", blend: "multiply",   opacity: 0.65, top: "54%", height: "5%"  },
  { id: "showerTile", categoryKey: "showerTile", kind: "band", blend: "soft-light", opacity: 0.5,  top: "10%", height: "40%" },
  { id: "floorTile",  categoryKey: "floorTile",  kind: "band", blend: "multiply",   opacity: 0.5,  top: "84%", height: "16%" },
  { id: "faucets",    categoryKey: "faucets",    kind: "wash", blend: "overlay",    opacity: 0.08, top: "0",   height: "0" },
];

function BathBandNode({ layer, productId, swatch }: { layer: BandLayer; productId: string; swatch: string }) {
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
    />
  );
}

function BathroomPreview({
  selections,
  className,
  hideChips,
}: {
  selections: Record<string, string>;
  className: string;
  hideChips?: boolean;
}) {
  const tone = dominantTone("bathroom", selections);
  const img = tone === "dark" ? bathMoody : bathClassic;

  const chips = BATHROOM_CATEGORIES.map((c) => {
    const p = productById(selections[c.id]);
    if (!p) return null;
    return { catLabel: c.label, product: p };
  }).filter((x): x is { catLabel: string; product: Product } => !!x);

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-border bg-muted ${className}`}>
      <div className="relative aspect-[16/10] w-full">
        <img
          key={img}
          src={img}
          alt="bathroom preview"
          className="absolute inset-0 h-full w-full object-cover animate-fade-in"
          style={{ animationDuration: "500ms" }}
          width={1600}
          height={1000}
        />
        {BATH_LAYERS.map((layer) => {
          const productId = selections[layer.categoryKey];
          const product = productById(productId);
          if (!product?.swatch) return null;
          return (
            <div key={layer.id} className="pointer-events-none absolute inset-0">
              <BathBandNode layer={layer} productId={productId} swatch={product.swatch} />
            </div>
          );
        })}
        <div className="pointer-events-none absolute bottom-3 right-3 rounded-full bg-background/85 px-3 py-1 text-[10px] uppercase tracking-widest text-muted-foreground backdrop-blur">
          Live preview · updates with every selection
        </div>
      </div>

      {!hideChips && chips.length > 0 && (
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

export function RoomPreview({
  room,
  selections,
  className = "",
  hideChips,
  changeLabel,
}: {
  room: Room;
  selections: Record<string, string>;
  className?: string;
  hideChips?: boolean;
  /** Deprecated: mask QA is no longer surfaced. Ignored. */
  enableMaskQA?: boolean;
  changeLabel?: string;
}) {
  return room === "kitchen" ? (
    <KitchenPreview
      selections={selections}
      className={className}
      hideChips={hideChips}
      changeLabel={changeLabel}
    />
  ) : (
    <BathroomPreview selections={selections} className={className} hideChips={hideChips} />
  );
}

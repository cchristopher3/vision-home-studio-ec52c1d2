import { useMemo, useState } from "react";
import { Eye, EyeOff, Layers3 } from "lucide-react";
import bathClassic from "@/assets/bath-classic.jpg";
import bathMoody from "@/assets/bath-moody.jpg";
import kitchenBase from "@/assets/kitchen-true-base.jpg";
import maskUpperCabinets from "@/assets/kitchen-mask-upper-cabinets.png";
import maskLowerCabinets from "@/assets/kitchen-mask-lower-cabinets.png";
import maskBacksplash from "@/assets/kitchen-mask-backsplash.png";
import maskPerimeterCounter from "@/assets/kitchen-mask-perimeter-counter.png";
import maskIslandCounter from "@/assets/kitchen-mask-island-counter.png";
import maskIslandBase from "@/assets/kitchen-mask-island-base.png";
import maskFlooring from "@/assets/kitchen-mask-flooring.png";
import {
  BATHROOM_CATEGORIES,
  KITCHEN_CATEGORIES,
  dominantTone,
  productById,
  type Product,
  type Room,
} from "@/lib/catalog";

/** Pull the first hex color out of a CSS gradient / raw color string. */
function extractHex(swatch: string | undefined): string {
  if (!swatch) return "#cccccc";
  const m = swatch.match(/#[0-9a-fA-F]{3,8}/);
  return m ? m[0] : swatch.startsWith("#") ? swatch : "#cccccc";
}

export function roomImage(room: Room, selections: Record<string, string>) {
  if (room === "kitchen") return kitchenBase;
  const tone = dominantTone(room, selections);
  return tone === "dark" ? bathMoody : bathClassic;
}

// -------- kitchen mask layer definitions --------
// Each region is independent and non-overlapping.

type BlendMode = React.CSSProperties["mixBlendMode"];

type MaskLayer = {
  id: string;
  label: string;
  maskUrl: string;
  blend: BlendMode;
  opacity: number;
  debugColor: string;
  /** Resolve which product (and its swatch/texture) drives this layer. */
  resolveProduct: (sel: Record<string, string>) => Product | undefined;
};

/**
 * Look up the product that visually drives an "included / match" fall-through:
 * when Island Finish = "Match Perimeter Cabinets" (id ends in -none) the
 * island base follows the current Kitchen Cabinets selection. Same idea for
 * Island Countertop = "Match Perimeter Countertop".
 */
function resolveIslandFinish(sel: Record<string, string>): Product | undefined {
  const explicit = productById(sel.islandFinish);
  if (explicit && !explicit.id.endsWith("-none")) return explicit;
  return productById(sel.cabinets);
}
function resolveIslandCounter(sel: Record<string, string>): Product | undefined {
  const explicit = productById(sel.islandCounter);
  if (explicit && explicit.id !== "isl-ct-match") return explicit;
  return productById(sel.countertops);
}

const KITCHEN_MASK_LAYERS: MaskLayer[] = [
  { id: "flooring",         label: "Flooring",         maskUrl: maskFlooring,         blend: "multiply",   opacity: 0.7,  debugColor: "rgba(239, 68, 68, 0.55)",
    resolveProduct: (s) => productById(s.flooring) },
  { id: "upperCabinets",    label: "Upper Cabinets",   maskUrl: maskUpperCabinets,    blend: "color",      opacity: 0.9,  debugColor: "rgba(56, 189, 248, 0.55)",
    resolveProduct: (s) => productById(s.cabinets) },
  { id: "lowerCabinets",    label: "Lower Cabinets",   maskUrl: maskLowerCabinets,    blend: "color",      opacity: 0.9,  debugColor: "rgba(20, 184, 166, 0.55)",
    resolveProduct: (s) => productById(s.cabinets) },
  { id: "perimeterCounter", label: "Perimeter Counter", maskUrl: maskPerimeterCounter, blend: "multiply",   opacity: 0.7,  debugColor: "rgba(163, 230, 53, 0.55)",
    resolveProduct: (s) => productById(s.countertops) },
  { id: "backsplash",       label: "Backsplash",       maskUrl: maskBacksplash,       blend: "soft-light", opacity: 0.9,  debugColor: "rgba(244, 114, 182, 0.55)",
    resolveProduct: (s) => productById(s.backsplash) },
  { id: "islandBase",       label: "Island Base",      maskUrl: maskIslandBase,       blend: "color",      opacity: 0.9,  debugColor: "rgba(249, 115, 22, 0.55)",
    resolveProduct: resolveIslandFinish },
  { id: "islandCounter",    label: "Island Counter",   maskUrl: maskIslandCounter,    blend: "multiply",   opacity: 0.7,  debugColor: "rgba(250, 204, 21, 0.6)",
    resolveProduct: resolveIslandCounter },
];

function MaskedRegion({
  layer,
  product,
  showBase,
  debug,
  onError,
}: {
  layer: MaskLayer;
  product: Product;
  showBase: boolean;
  debug: boolean;
  onError: (id: string) => void;
}) {
  if (showBase) return null;
  if (product.included && !debug) return null;

  const color = debug ? layer.debugColor : extractHex(product.swatch);
  const texture = !debug && product.textureImageUrl;
  const overlay = !debug && product.overlayImageUrl;
  const visual = product.visual;

  const maskStyle: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    backgroundColor: color,
    backgroundImage: texture ? `url(${texture})` : undefined,
    backgroundRepeat: texture ? "repeat" : undefined,
    backgroundSize: texture ? `${Math.max(25, (visual?.scale ?? 1) * 100)}px auto` : undefined,
    transform: visual?.rotation ? `rotate(${visual.rotation}deg) scale(1.04)` : undefined,
    mixBlendMode: debug ? "normal" : visual?.blendMode ?? layer.blend,
    opacity: debug ? 1 : visual?.opacity ?? layer.opacity,
    WebkitMaskImage: `url(${layer.maskUrl})`,
    maskImage: `url(${layer.maskUrl})`,
    WebkitMaskSize: "100% 100%",
    maskSize: "100% 100%",
    WebkitMaskRepeat: "no-repeat",
    maskRepeat: "no-repeat",
    WebkitMaskPosition: "center",
    maskPosition: "center",
    maskMode: "luminance",
    WebkitMaskSourceType: "luminance",
    pointerEvents: "none",
    transition: "background-color 400ms ease, opacity 400ms ease",
  } as React.CSSProperties;

  return (
    <div
      key={`${layer.id}-${product.id}-${debug ? "d" : "n"}`}
      style={maskStyle}
      className="animate-fade-in"
      data-layer={layer.id}
    >
      {overlay && (
        <img
          src={overlay}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-fill"
          onError={() => onError(layer.id)}
        />
      )}
      <img
        src={layer.maskUrl}
        alt=""
        aria-hidden
        onError={() => onError(layer.id)}
        className="hidden"
      />
    </div>
  );
}

function KitchenPreview({
  selections,
  className,
  hideChips,
  enableMaskQA,
  changeLabel,
}: {
  selections: Record<string, string>;
  className: string;
  hideChips?: boolean;
  enableMaskQA?: boolean;
  changeLabel?: string;
}) {
  const [debug, setDebug] = useState(false);
  const [showBase, setShowBase] = useState(false);
  const [failed, setFailed] = useState<Set<string>>(new Set());

  const changedCount = useMemo(
    () =>
      KITCHEN_MASK_LAYERS.filter((layer) => {
        const product = layer.resolveProduct(selections);
        return product && !product.included;
      }).length,
    [selections],
  );

  const markFailed = (id: string) =>
    setFailed((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });

  const chips = KITCHEN_CATEGORIES.map((c) => {
    const p = productById(selections[c.id]);
    if (!p) return null;
    return { catLabel: c.label, product: p };
  }).filter((x): x is { catLabel: string; product: Product } => !!x);

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-border bg-muted ${className}`}>
      <div className="relative w-full" style={{ aspectRatio: "1320 / 848" }}>
        <img
          src={kitchenBase}
          alt="Kitchen base scene"
          className="absolute inset-0 h-full w-full object-cover"
          width={1320}
          height={848}
        />

        {KITCHEN_MASK_LAYERS.map((layer) => {
          if (failed.has(layer.id)) return null;
          const product = layer.resolveProduct(selections);
          if (!product) return null;
          return (
            <MaskedRegion
              key={layer.id}
              layer={layer}
              product={product}
              showBase={showBase}
              debug={debug}
              onError={markFailed}
            />
          );
        })}

        {debug && (
          <div className="pointer-events-none absolute left-3 top-12 flex flex-col gap-1">
            <div className="rounded-full bg-background/85 px-2 py-1 text-[10px] uppercase tracking-widest text-foreground backdrop-blur">
              Mask QA — region legend
            </div>
            {KITCHEN_MASK_LAYERS.map((l) => (
              <div
                key={l.id}
                className="flex items-center gap-2 rounded-full bg-background/85 px-2 py-1 text-[10px] uppercase tracking-widest text-foreground backdrop-blur"
              >
                <span className="h-3 w-3 rounded-sm" style={{ background: l.debugColor }} />
                {l.label}
              </div>
            ))}
          </div>
        )}

        {failed.size > 0 && (
          <div className="pointer-events-none absolute left-3 bottom-3 rounded-md bg-background/85 px-2 py-1 text-[10px] text-muted-foreground backdrop-blur">
            Preview layer unavailable
          </div>
        )}

        <div className="absolute left-3 top-3 max-w-[70%] rounded-full bg-background/90 px-3 py-1.5 text-[11px] font-medium text-foreground shadow-sm backdrop-blur">
          <span className="truncate">
            {changeLabel
              ? changeLabel
              : changedCount
              ? `${changedCount} visual change${changedCount === 1 ? "" : "s"}`
              : "Included design"}
          </span>
        </div>

        <div className="absolute right-3 top-3 flex gap-1.5">
          <button
            onClick={() => setShowBase((v) => !v)}
            className={`inline-flex min-h-8 items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium shadow-sm backdrop-blur transition ${
              showBase ? "bg-foreground text-background" : "bg-background/90 text-foreground hover:bg-background"
            }`}
            aria-pressed={showBase}
            aria-label={showBase ? "Show your selections" : "Show original photograph"}
          >
            {showBase ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
            {showBase ? "Before" : "Selections"}
          </button>
          {enableMaskQA && (
            <button
              onClick={() => setDebug((v) => !v)}
              className={`inline-flex min-h-8 items-center gap-1.5 rounded-full px-3 py-1 text-[10px] uppercase tracking-widest backdrop-blur transition ${
                debug ? "bg-foreground text-background" : "bg-background/85 text-muted-foreground hover:text-foreground"
              }`}
              aria-pressed={debug}
              title="Internal QA — visualize mask regions"
            >
              <Layers3 className="h-3 w-3" /> Mask QA
            </button>
          )}
        </div>


        <div className="pointer-events-none absolute bottom-3 right-3 hidden rounded-full bg-background/85 px-3 py-1 text-[10px] uppercase tracking-widest text-muted-foreground backdrop-blur sm:block">
          {showBase ? "Original photograph" : "Live preview · masked layers"}
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
  enableMaskQA,
  changeLabel,
}: {
  room: Room;
  selections: Record<string, string>;
  className?: string;
  hideChips?: boolean;
  enableMaskQA?: boolean;
  changeLabel?: string;
}) {
  return room === "kitchen" ? (
    <KitchenPreview
      selections={selections}
      className={className}
      hideChips={hideChips}
      enableMaskQA={enableMaskQA}
      changeLabel={changeLabel}
    />
  ) : (
    <BathroomPreview selections={selections} className={className} hideChips={hideChips} />
  );
}

// Kitchen preview built as plain HTML div layers over a photorealistic base
// scene. No SVG clipPaths, no hand-traced polygons, no flat vector kitchen.
//
// Approach:
//  - kitchen-scene-v2.jpg is a straight-on, unobstructed kitchen designed
//    for finish swapping (continuous perimeter uppers/lowers, centered
//    rectangular island, separate perimeter + island counters, broad
//    backsplash, visible floor, no stools/decor).
//  - Every editable surface is a rectangle in the photo. Each rectangle is
//    a percentage-positioned <div> layered over the <img>. Cabinets and
//    other painted finishes use `mix-blend-mode: multiply` so the
//    photograph's shadows, panel reveals, and hardware highlights show
//    through the applied color. Counters render procedural stone textures
//    contained by CSS overflow to their region — nothing bleeds.
//  - If the base image fails to load, a "Preview unavailable" state is
//    shown instead of a broken overlay.

import { useState, type CSSProperties } from "react";
import kitchenBase from "@/assets/kitchen-scene-v2.jpg";
import {
  renderStoneElements,
  stoneById,
  DEFAULT_ISLAND_FINISH_ID,
  DEFAULT_PERIMETER_FINISH_ID,
} from "@/lib/stoneTextures";
import { productById } from "@/lib/catalog";

const IMG_W = 1600;
const IMG_H = 912;

// ---------- Region rectangles (percent of scene) ----------
// Measured against kitchen-scene-v2.jpg via edge detection. Every region
// under-covers its surface slightly so nothing bleeds onto appliances,
// walls, or hardware.

type RegionBox = {
  left: number;
  top: number;
  width: number;
  height: number;
};

const REGION: Record<string, RegionBox> = {
  perimeterUppers:  { left: 16.375, top: 18.42, width: 66.75, height: 21.05 },
  backsplash:       { left: 16.375, top: 40.79, width: 66.75, height: 11.84 },
  perimeterCounter: { left: 16.375, top: 52.85, width: 66.75, height: 2.85 },
  perimeterLowersL: { left: 16.375, top: 55.92, width: 4.75,  height: 31.80 },
  perimeterLowersR: { left: 79.25,  top: 55.92, width: 3.875, height: 31.80 },
  islandCounter:    { left: 19.06,  top: 56.14, width: 62.19, height: 7.68 },
  islandBase:       { left: 21.375, top: 64.25, width: 57.63, height: 23.46 },
  flooring:         { left: 0,      top: 88.60, width: 100,   height: 11.40 },
};

function boxStyle(r: RegionBox): CSSProperties {
  return {
    position: "absolute",
    left: `${r.left}%`,
    top: `${r.top}%`,
    width: `${r.width}%`,
    height: `${r.height}%`,
    pointerEvents: "none",
  };
}

function extractHex(swatch: string | undefined): string | undefined {
  if (!swatch) return undefined;
  const m = swatch.match(/#[0-9a-fA-F]{3,8}/);
  return m ? m[0] : swatch.startsWith("#") ? swatch : undefined;
}

// ---------- Region primitives ----------

/** Paint a rectangle with a solid color using a two-pass composite:
 *  a low-opacity base ensures light selections remain visible against a
 *  bright photograph, while a multiply layer restores photographic depth
 *  so panel reveals, shadows, and hardware remain readable. */
function ColorRegion({
  box,
  color,
  baseOpacity = 0.58,
  multiplyOpacity = 0.42,
}: {
  box: RegionBox;
  color: string;
  baseOpacity?: number;
  multiplyOpacity?: number;
}) {
  return (
    <>
      <div style={{ ...boxStyle(box), background: color, opacity: baseOpacity }} />
      <div
        style={{
          ...boxStyle(box),
          background: color,
          mixBlendMode: "multiply",
          opacity: multiplyOpacity,
        }}
      />
    </>
  );
}

/** Render a procedural stone texture confined to a rectangle. */
function StoneRegion({
  box,
  stone,
  keyId,
}: {
  box: RegionBox;
  stone: NonNullable<ReturnType<typeof stoneById>>;
  keyId: string;
}) {
  const w = 800;
  const h = Math.max(120, Math.round((box.height / box.width) * 800));
  return (
    <div style={{ ...boxStyle(box), overflow: "hidden" }}>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        preserveAspectRatio="xMidYMid slice"
        width="100%"
        height="100%"
        style={{ display: "block", opacity: 0.95 }}
        aria-hidden
      >
        {renderStoneElements(stone as never, w, h, keyId)}
      </svg>
      {/* Restrained highlight preserves ambient sheen from the photo. */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "#ffffff",
          mixBlendMode: "soft-light",
          opacity: 0.2,
          pointerEvents: "none",
        }}
      />
    </div>
  );
}

// ---------- Public component ----------

// Kept for backwards compatibility with the previous SVG implementation so
// import sites that referenced REGIONS still compile. Downstream code no
// longer surfaces mask/debug UI to buyers.
export const REGIONS: { id: string; label: string; debugColor: string }[] = [
  { id: "perimeterUppers",  label: "Perimeter Uppers",   debugColor: "#38bdf8" },
  { id: "perimeterLowers",  label: "Perimeter Lowers",   debugColor: "#14b8a6" },
  { id: "islandBase",       label: "Island Base",        debugColor: "#f97316" },
  { id: "perimeterCounter", label: "Perimeter Counter",  debugColor: "#a3e635" },
  { id: "islandCounter",    label: "Island Countertop",  debugColor: "#facc15" },
  { id: "backsplash",       label: "Backsplash",         debugColor: "#f472b6" },
  { id: "flooring",         label: "Flooring",           debugColor: "#ef4444" },
];

interface Props {
  selections: Record<string, string>;
  perimeterVisualFinishId?: string;
  islandVisualFinishId?: string;
  /** When true, no finishes are applied; users see the untouched photo. */
  before?: boolean;
  /** Ignored — kept for backwards compatibility. */
  debug?: boolean;
  /** Ignored — kept for backwards compatibility. */
  debugVisible?: Partial<Record<string, boolean>>;
}

export function KitchenPhotoScene({
  selections,
  perimeterVisualFinishId,
  islandVisualFinishId,
  before,
}: Props) {
  const [imageFailed, setImageFailed] = useState(false);

  // Product resolution.
  //  - Cabinets drive ALL perimeter cabinet surfaces (uppers + visible lowers).
  //  - Perimeter Finish (if the user upgraded it) overrides lowers only.
  //  - Island base follows Cabinets unless Island Finish is set to a real
  //    upgrade (ids ending with "-none" mean "Match Perimeter Cabinets").
  //  - Perimeter Countertop and Island Countertop are independent.
  const cabinetsProduct = productById(selections.cabinets);
  const perimFinishExplicit = productById(selections.perimeterFinish);
  const perimeterFinishProduct =
    perimFinishExplicit && !perimFinishExplicit.included
      ? perimFinishExplicit
      : cabinetsProduct;

  const islandFinishExplicit = productById(selections.islandFinish);
  const islandFinishProduct =
    islandFinishExplicit && !islandFinishExplicit.id.endsWith("-none")
      ? islandFinishExplicit
      : cabinetsProduct;

  const backsplashProduct = productById(selections.backsplash);
  const flooringProduct = productById(selections.flooring);

  // Only paint when a real upgrade is selected — an "included" product
  // means "keep the photo as-is."
  const cabinetColor =
    cabinetsProduct && !cabinetsProduct.included ? extractHex(cabinetsProduct.swatch) : undefined;
  const lowerColor =
    perimeterFinishProduct && !perimeterFinishProduct.included
      ? extractHex(perimeterFinishProduct.swatch)
      : undefined;
  const islandBaseColor =
    islandFinishProduct && !islandFinishProduct.included
      ? extractHex(islandFinishProduct.swatch)
      : undefined;
  const backsplashColor =
    backsplashProduct && !backsplashProduct.included
      ? extractHex(backsplashProduct.swatch)
      : undefined;
  const flooringColor =
    flooringProduct && !flooringProduct.included
      ? extractHex(flooringProduct.swatch)
      : undefined;

  const perimCounterProduct = productById(selections.countertops);
  const islandCounterExplicit = productById(selections.islandCounter);

  const paintPerimCounter =
    (perimCounterProduct && !perimCounterProduct.included) ||
    (perimeterVisualFinishId && perimeterVisualFinishId !== DEFAULT_PERIMETER_FINISH_ID);
  const paintIslandCounter =
    (islandCounterExplicit && islandCounterExplicit.id !== "isl-ct-match") ||
    (islandVisualFinishId && islandVisualFinishId !== DEFAULT_ISLAND_FINISH_ID);

  const perimStone =
    stoneById(perimeterVisualFinishId) ?? stoneById(DEFAULT_PERIMETER_FINISH_ID)!;
  const islandStone =
    stoneById(islandVisualFinishId) ?? stoneById(DEFAULT_ISLAND_FINISH_ID)!;

  const showOverlays = !before && !imageFailed;

  return (
    <div
      className="relative w-full"
      style={{ aspectRatio: `${IMG_W} / ${IMG_H}`, isolation: "isolate" }}
    >
      <img
        src={kitchenBase}
        alt="Kitchen preview reference photo"
        width={IMG_W}
        height={IMG_H}
        className="absolute inset-0 h-full w-full object-cover"
        loading="eager"
        onError={() => setImageFailed(true)}
      />

      {imageFailed && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted text-sm text-muted-foreground">
          Preview unavailable
        </div>
      )}

      {showOverlays && (
        <>
          {cabinetColor && <ColorRegion box={REGION.perimeterUppers} color={cabinetColor} />}

          {lowerColor && (
            <>
              <ColorRegion box={REGION.perimeterLowersL} color={lowerColor} />
              <ColorRegion box={REGION.perimeterLowersR} color={lowerColor} />
            </>
          )}

          {islandBaseColor && <ColorRegion box={REGION.islandBase} color={islandBaseColor} />}

          {backsplashColor && (
            <ColorRegion
              box={REGION.backsplash}
              color={backsplashColor}
              baseOpacity={0.7}
              multiplyOpacity={0.32}
            />
          )}

          {flooringColor && (
            <ColorRegion
              box={REGION.flooring}
              color={flooringColor}
              baseOpacity={0.55}
              multiplyOpacity={0.34}
            />
          )}

          {paintPerimCounter && (
            <StoneRegion box={REGION.perimeterCounter} stone={perimStone} keyId="perim-ct" />
          )}
          {paintIslandCounter && (
            <StoneRegion box={REGION.islandCounter} stone={islandStone} keyId="island-ct" />
          )}
        </>
      )}
    </div>
  );
}

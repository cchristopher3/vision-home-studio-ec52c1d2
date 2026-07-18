// Photorealistic kitchen preview: single base photo plus a shared-viewBox
// SVG overlay that applies finishes ONLY inside hand-traced clip paths.
// Every finish is a controlled color/multiply layer confined to its clip —
// there is no full-frame tint, and no PNG mask is consulted.

import { useEffect, useMemo } from "react";
import kitchenBase from "@/assets/kitchen-true-base.jpg";
import {
  renderStoneElements,
  stoneById,
  DEFAULT_ISLAND_FINISH_ID,
  DEFAULT_PERIMETER_FINISH_ID,
} from "@/lib/stoneTextures";
import { productById } from "@/lib/catalog";


const VB_W = 1320;
const VB_H = 848;

// ---------- Region trace definitions ----------
// Every path is expressed in the photo's own pixel space (viewBox 1320x848).
// A region is marked `pending` when its polygon cannot yet be traced with
// confidence; in that case the overlay is skipped for that region and the
// original photograph is preserved (with a "refinement in progress" note),
// while pricing and selection remain fully live.

type RegionId =
  | "perimeterUppers"
  | "perimeterLowers"
  | "islandBase"
  | "perimeterCounter"
  | "islandCounter"
  | "backsplash"
  | "flooring";

export interface RegionDef {
  id: RegionId;
  label: string;
  /** Multiple sub-paths — kept separate so complex surfaces are traced with
   *  many small polygons that avoid appliances, stools, sinks and openings. */
  paths: string[];
  /** Even-odd lets sub-paths cut holes for range/sink cutouts. */
  fillRule?: "evenodd" | "nonzero";
  /** Skip painting when true; original photo shows through. */
  pending?: boolean;
  /** Debug fill color. */
  debugColor: string;
}

// NOTE: These traces are conservative best-effort hand-traces read against
// src/assets/kitchen-true-base.jpg (1320×848). They intentionally under-cover
// rather than bleed into appliances, stools, sink, faucet, lights, ceiling,
// walls or windows. Refine per-path as tighter traces become available.

export const REGIONS: RegionDef[] = [
  {
    id: "perimeterUppers",
    label: "Perimeter Uppers",
    debugColor: "rgba(56, 189, 248, 0.55)",
    paths: [
      // Pantry uppers (left wall, angled)
      "M 90 220 L 230 210 L 230 370 L 90 380 Z",
      // Back-wall uppers, left of microwave — two door groups
      "M 290 275 L 445 260 L 445 405 L 290 410 Z",
      "M 445 260 L 585 250 L 585 405 L 445 405 Z",
      // Above-microwave narrow bridge (skips the microwave face)
      "M 610 232 L 720 228 L 720 300 L 610 300 Z",
      // Back-wall uppers, right of microwave — several door groups
      "M 735 232 L 870 224 L 870 400 L 735 402 Z",
      "M 870 224 L 995 220 L 995 400 L 870 400 Z",
      "M 995 220 L 1105 218 L 1105 400 L 995 400 Z",
    ],
    fillRule: "nonzero",
  },
  {
    id: "perimeterLowers",
    label: "Perimeter Lowers",
    debugColor: "rgba(20, 184, 166, 0.55)",
    paths: [
      // Back-wall lowers left of range — doors/drawers below counter
      "M 305 505 L 445 500 L 445 615 L 305 620 Z",
      "M 445 500 L 585 495 L 585 615 L 445 615 Z",
      // Back-wall lowers right of range
      "M 740 500 L 870 495 L 870 615 L 740 618 Z",
      "M 870 495 L 985 492 L 985 615 L 870 615 Z",
    ],
    fillRule: "nonzero",
  },
  {
    id: "islandBase",
    label: "Island Base",
    debugColor: "rgba(249, 115, 22, 0.55)",
    // Right portion of island wood base only — leaves the stool zone (left front)
    // uncovered so stool legs/seats remain untouched.
    paths: [
      "M 455 650 L 605 615 L 600 795 L 455 810 Z",
    ],
    fillRule: "nonzero",
  },
  {
    id: "perimeterCounter",
    label: "Perimeter Counter",
    debugColor: "rgba(163, 230, 53, 0.55)",
    // Back-leg slim edge + right-leg slab (with sink cutout via even-odd).
    paths: [
      // Back leg top surface strip (thin band showing on top of lowers)
      "M 285 442 L 605 435 L 605 490 L 285 492 Z",
      "M 730 435 L 990 428 L 990 480 L 730 482 Z",
      // Right leg slab — bounded so it never covers cabinets or floor.
      "M 985 428 L 1320 460 L 1320 715 L 860 700 L 860 615 L 985 615 Z",
      // Sink cutout on the right leg
      "M 1015 555 L 1230 555 L 1230 680 L 1015 680 Z",
    ],
    fillRule: "evenodd",
  },

  {
    id: "islandCounter",
    label: "Island Counter",
    debugColor: "rgba(250, 204, 21, 0.6)",
    // Marble slab top + front edge band; leaves stools untouched.
    paths: [
      "M 245 610 L 605 455 L 630 585 L 240 640 Z",
    ],
    fillRule: "nonzero",
  },
  {
    id: "backsplash",
    label: "Backsplash",
    debugColor: "rgba(244, 114, 182, 0.55)",
    // Narrow band between uppers-bottom and counter-top, split around microwave.
    paths: [
      "M 295 410 L 585 405 L 585 440 L 295 445 Z",
      "M 735 405 L 1050 400 L 1050 432 L 735 435 Z",
    ],
    fillRule: "nonzero",
  },
  {
    id: "flooring",
    label: "Flooring",
    debugColor: "rgba(239, 68, 68, 0.55)",
    // Open floor area between island (right side) and right-leg cabinets.
    // Left-front stool zone is deliberately excluded.
    paths: [
      // Central floor between island and right cabinets
      "M 620 700 L 855 700 L 855 848 L 620 848 Z",
      // Narrow far-left strip near doorway (avoids stools)
      "M 0 760 L 90 755 L 90 848 L 0 848 Z",
    ],
    fillRule: "nonzero",
  },
];


// ---------- Overlay component ----------

function extractHex(swatch: string | undefined): string | undefined {
  if (!swatch) return undefined;
  const m = swatch.match(/#[0-9a-fA-F]{3,8}/);
  return m ? m[0] : swatch.startsWith("#") ? swatch : undefined;
}

interface Props {
  selections: Record<string, string>;
  perimeterVisualFinishId?: string;
  islandVisualFinishId?: string;
  /** When true, no finishes are applied; users see the untouched photo. */
  before?: boolean;
  /** Show translucent debug fills instead of realistic compositing. */
  debug?: boolean;
  /** Per-region debug visibility. */
  debugVisible?: Partial<Record<RegionId, boolean>>;
}

export function KitchenPhotoScene({
  selections,
  perimeterVisualFinishId,
  islandVisualFinishId,
  before,
  debug,
  debugVisible,
}: Props) {
  // Product resolution — cabinets drives all perimeter cabinet paths.
  const cabinetsProduct = productById(selections.cabinets);
  const perimFinishProduct = productById(selections.perimeterFinish);
  const perimeterFinishProduct =
    perimFinishProduct && !perimFinishProduct.included ? perimFinishProduct : cabinetsProduct;

  const islandFinishExplicit = productById(selections.islandFinish);
  const islandFinishProduct =
    islandFinishExplicit && !islandFinishExplicit.id.endsWith("-none")
      ? islandFinishExplicit
      : cabinetsProduct;

  const backsplashProduct = productById(selections.backsplash);
  const flooringProduct = productById(selections.flooring);

  const cabinetColor = cabinetsProduct && !cabinetsProduct.included ? extractHex(cabinetsProduct.swatch) : undefined;
  const perimeterFinishColor = perimeterFinishProduct && !perimeterFinishProduct.included
    ? extractHex(perimeterFinishProduct.swatch)
    : undefined;
  const islandBaseColor = islandFinishProduct && !islandFinishProduct.included
    ? extractHex(islandFinishProduct.swatch)
    : undefined;
  const backsplashColor = backsplashProduct && !backsplashProduct.included
    ? extractHex(backsplashProduct.swatch)
    : undefined;
  const flooringColor = flooringProduct && !flooringProduct.included
    ? extractHex(flooringProduct.swatch)
    : undefined;

  // Stone finishes — always defined via defaults; only paint when perimeter
  // or island countertop is an upgrade OR when the user has explicitly chosen
  // a non-default visual finish. Otherwise leave the photo pristine.
  const perimCounterProduct = productById(selections.countertops);
  const islandCounterExplicit = productById(selections.islandCounter);
  const perimCounterPaint =
    (perimCounterProduct && !perimCounterProduct.included) ||
    (perimeterVisualFinishId && perimeterVisualFinishId !== DEFAULT_PERIMETER_FINISH_ID);
  const islandCounterPaint =
    (islandCounterExplicit && islandCounterExplicit.id !== "isl-ct-match") ||
    (islandVisualFinishId && islandVisualFinishId !== DEFAULT_ISLAND_FINISH_ID);

  const perimStone = stoneById(perimeterVisualFinishId) ?? stoneById(DEFAULT_PERIMETER_FINISH_ID)!;
  const islandStone = stoneById(islandVisualFinishId) ?? stoneById(DEFAULT_ISLAND_FINISH_ID)!;

  const regionById = useMemo(() => {
    const m: Record<string, RegionDef> = {};
    for (const r of REGIONS) m[r.id] = r;
    return m;
  }, []);

  const visibleRegions = (id: RegionId) => debugVisible?.[id] !== false;

  // In "before" mode, paint nothing.
  const applyCabinets = !before && !!cabinetColor && !regionById.perimeterUppers.pending;
  const applyLowers = !before && !!perimeterFinishColor && !regionById.perimeterLowers.pending;
  const applyIslandBase = !before && !!islandBaseColor && !regionById.islandBase.pending;
  const applyPerimCounter = !before && perimCounterPaint && !regionById.perimeterCounter.pending;
  const applyIslandCounter = !before && islandCounterPaint && !regionById.islandCounter.pending;
  const applyBacksplash = !before && !!backsplashColor && !regionById.backsplash.pending;
  const applyFlooring = !before && !!flooringColor && !regionById.flooring.pending;

  const pendingRegions = REGIONS.filter((r) => r.pending).map((r) => r.label);

  return (
    <div className="relative w-full" style={{ aspectRatio: `${VB_W} / ${VB_H}` }}>
      <img
        src={kitchenBase}
        alt="Kitchen photo reference"
        width={VB_W}
        height={VB_H}
        className="absolute inset-0 h-full w-full object-cover"
        loading="eager"
      />

      <svg
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full transition-opacity duration-200"
        style={{ opacity: before ? 0 : 1, pointerEvents: "none" }}
        aria-hidden
      >
        <defs>
          {REGIONS.map((r) => (
            <clipPath id={`clip-${r.id}`} key={r.id} clipPathUnits="userSpaceOnUse">
              <RegionPathGroup region={r} />
            </clipPath>
          ))}
        </defs>

        {debug ? (
          <>
            {REGIONS.filter((r) => visibleRegions(r.id)).map((r) => (
              <g key={r.id}>
                <RegionPathGroup region={r} fill={r.debugColor} />
              </g>
            ))}
          </>
        ) : (
          <>
            {applyCabinets && (
              <>
                <g clipPath="url(#clip-perimeterUppers)" style={{ mixBlendMode: "multiply", opacity: 0.9 }}>
                  <rect x={0} y={0} width={VB_W} height={VB_H} fill={cabinetColor} />
                </g>
                <g clipPath="url(#clip-perimeterUppers)" style={{ mixBlendMode: "color", opacity: 0.35 }}>
                  <rect x={0} y={0} width={VB_W} height={VB_H} fill={cabinetColor} />
                </g>
              </>
            )}
            {applyLowers && (
              <>
                <g clipPath="url(#clip-perimeterLowers)" style={{ mixBlendMode: "multiply", opacity: 0.9 }}>
                  <rect x={0} y={0} width={VB_W} height={VB_H} fill={perimeterFinishColor} />
                </g>
                <g clipPath="url(#clip-perimeterLowers)" style={{ mixBlendMode: "color", opacity: 0.35 }}>
                  <rect x={0} y={0} width={VB_W} height={VB_H} fill={perimeterFinishColor} />
                </g>
              </>
            )}
            {applyIslandBase && (
              <>
                <g clipPath="url(#clip-islandBase)" style={{ mixBlendMode: "multiply", opacity: 0.85 }}>
                  <rect x={0} y={0} width={VB_W} height={VB_H} fill={islandBaseColor} />
                </g>
                <g clipPath="url(#clip-islandBase)" style={{ mixBlendMode: "color", opacity: 0.35 }}>
                  <rect x={0} y={0} width={VB_W} height={VB_H} fill={islandBaseColor} />
                </g>
              </>
            )}
            {applyPerimCounter && (
              <>
                <g clipPath="url(#clip-perimeterCounter)" style={{ mixBlendMode: "multiply", opacity: 0.85 }}>
                  {renderStoneElements(perimStone, VB_W, VB_H, `perim-${perimStone.id}`)}
                </g>
                <g clipPath="url(#clip-perimeterCounter)" style={{ mixBlendMode: "soft-light", opacity: 0.3 }}>
                  <rect x={0} y={0} width={VB_W} height={VB_H} fill="#ffffff" />
                </g>
              </>
            )}
            {applyIslandCounter && (
              <>
                <g clipPath="url(#clip-islandCounter)" style={{ mixBlendMode: "multiply", opacity: 0.85 }}>
                  {renderStoneElements(islandStone, VB_W, VB_H, `isl-${islandStone.id}`)}
                </g>
                <g clipPath="url(#clip-islandCounter)" style={{ mixBlendMode: "soft-light", opacity: 0.3 }}>
                  <rect x={0} y={0} width={VB_W} height={VB_H} fill="#ffffff" />
                </g>
              </>
            )}
            {applyBacksplash && (
              <g clipPath="url(#clip-backsplash)" style={{ mixBlendMode: "multiply", opacity: 0.8 }}>
                <rect x={0} y={0} width={VB_W} height={VB_H} fill={backsplashColor} />
              </g>
            )}
            {applyFlooring && (
              <g clipPath="url(#clip-flooring)" style={{ mixBlendMode: "multiply", opacity: 0.75 }}>
                <rect x={0} y={0} width={VB_W} height={VB_H} fill={flooringColor} />
              </g>
            )}
          </>
        )}

      </svg>

      {pendingRegions.length > 0 && !before && (
        <div className="pointer-events-none absolute bottom-3 left-3 rounded-md bg-background/85 px-2 py-1 text-[10px] text-muted-foreground backdrop-blur">
          Preview refinement in progress · {pendingRegions.join(", ")}
        </div>
      )}
    </div>
  );
}

function RegionPathGroup({ region, fill }: { region: RegionDef; fill?: string }) {
  return (
    <g fillRule={region.fillRule}>
      {region.paths.map((d, i) => (
        <path key={i} d={d} fill={fill ?? "#000"} />
      ))}
    </g>
  );
}

// ---------- Debug overlap check (dev aid) ----------

/**
 * Report region overlaps by rasterising each region into a 1320x848 grid.
 * Purely a dev aid: call from the browser console when debugging.
 */
export function reportRegionOverlaps(): { pair: string; overlapPixels: number }[] {
  if (typeof document === "undefined") return [];
  const results: { pair: string; overlapPixels: number }[] = [];
  const grids: Record<string, Uint8Array> = {};
  for (const r of REGIONS) {
    const canvas = document.createElement("canvas");
    canvas.width = VB_W;
    canvas.height = VB_H;
    const ctx = canvas.getContext("2d");
    if (!ctx) continue;
    ctx.fillStyle = "#000";
    for (const d of r.paths) {
      const p = new Path2D(d);
      ctx.fill(p, r.fillRule ?? "nonzero");
    }
    const img = ctx.getImageData(0, 0, VB_W, VB_H).data;
    const g = new Uint8Array(VB_W * VB_H);
    for (let i = 0; i < g.length; i++) g[i] = img[i * 4 + 3] > 0 ? 1 : 0;
    grids[r.id] = g;
  }
  const ids = Object.keys(grids);
  for (let i = 0; i < ids.length; i++) {
    for (let j = i + 1; j < ids.length; j++) {
      const a = grids[ids[i]];
      const b = grids[ids[j]];
      let c = 0;
      for (let k = 0; k < a.length; k++) if (a[k] && b[k]) c++;
      if (c > 0) results.push({ pair: `${ids[i]} ↔ ${ids[j]}`, overlapPixels: c });
    }
  }
  return results;
}

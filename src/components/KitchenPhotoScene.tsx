// Photorealistic kitchen preview: single base photo plus a shared-viewBox
// SVG overlay that applies finishes ONLY inside hand-traced clip paths.
// Every finish is a controlled color/multiply layer confined to its clip —
// there is no full-frame tint, and no PNG mask is consulted.

import { useMemo } from "react";
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
      // Back wall — left of microwave (three door faces)
      "M 300 220 L 460 212 L 460 340 L 300 356 Z",
      "M 460 214 L 585 210 L 585 338 L 460 340 Z",
      // Above microwave (small stack)
      "M 590 208 L 735 205 L 735 338 L 590 338 Z",
      // Back wall — right of microwave
      "M 745 205 L 880 200 L 880 388 L 745 390 Z",
      "M 880 200 L 1010 196 L 1010 386 L 880 388 Z",
      "M 1010 196 L 1090 194 L 1090 384 L 1010 386 Z",
      // Left wall pantry uppers (angled toward camera)
      "M 105 218 L 210 210 L 210 345 L 105 360 Z",
      "M 210 210 L 285 205 L 285 340 L 210 345 Z",
    ],
    fillRule: "nonzero",
  },
  {
    id: "perimeterLowers",
    label: "Perimeter Lowers",
    debugColor: "rgba(20, 184, 166, 0.55)",
    paths: [
      // Back wall — left of range (door + drawer faces)
      "M 300 500 L 430 496 L 430 700 L 300 708 Z",
      "M 430 496 L 585 492 L 585 700 L 430 700 Z",
      // Back wall — right of range
      "M 745 492 L 880 490 L 880 700 L 745 702 Z",
      "M 880 490 L 1000 488 L 1000 700 L 880 700 Z",
      // Right-leg lowers (below sink run, but not the sink itself)
      "M 1010 640 L 1160 640 L 1160 800 L 1010 800 Z",
      "M 1160 640 L 1290 640 L 1290 810 L 1160 800 Z",
    ],
    fillRule: "nonzero",
  },
  {
    id: "islandBase",
    label: "Island Base",
    debugColor: "rgba(249, 115, 22, 0.55)",
    // Island wood block, right-side portion (avoids stools on the left/front).
    paths: [
      "M 355 660 L 680 588 L 655 800 L 335 820 Z",
    ],
    fillRule: "nonzero",
  },
  {
    id: "perimeterCounter",
    label: "Perimeter Counter",
    debugColor: "rgba(163, 230, 53, 0.55)",
    // Back leg + right leg of the L, with range/sink cutouts via even-odd.
    paths: [
      // Back leg (from left wall counter across to back-right corner)
      "M 100 448 L 295 442 L 585 438 L 735 438 L 1085 434 L 1085 495 L 295 500 L 100 502 Z",
      // Right leg coming forward (corner → front-right)
      "M 1075 434 L 1320 460 L 1320 640 L 1075 640 Z",
      // Range cutout (even-odd removes this rectangle)
      "M 588 438 L 732 438 L 732 470 L 588 470 Z",
      // Sink cutout on right leg
      "M 1085 552 L 1290 552 L 1290 630 L 1085 630 Z",
    ],
    fillRule: "evenodd",
  },
  {
    id: "islandCounter",
    label: "Island Counter",
    debugColor: "rgba(250, 204, 21, 0.6)",
    paths: [
      // Slab top surface (perspective quad)
      "M 285 528 L 655 498 L 685 588 L 280 655 Z",
      // Slab front edge (thin band)
      "M 280 655 L 685 588 L 682 610 L 278 675 Z",
    ],
    fillRule: "nonzero",
  },
  {
    id: "backsplash",
    label: "Backsplash",
    debugColor: "rgba(244, 114, 182, 0.55)",
    paths: [
      // Back wall band between uppers and counter — split around microwave.
      "M 300 360 L 585 342 L 585 435 L 300 442 Z",
      "M 745 392 L 1080 388 L 1080 434 L 745 434 Z",
      // Right leg backsplash strip on side wall behind sink faucet
      "M 1090 400 L 1290 420 L 1290 460 L 1090 440 Z",
    ],
    fillRule: "nonzero",
  },
  {
    id: "flooring",
    label: "Flooring",
    debugColor: "rgba(239, 68, 68, 0.55)",
    // Bottom band, but shy of stools on the far left and the island block.
    paths: [
      // Left strip (behind/around stools — kept narrow to avoid stool feet)
      "M 0 780 L 105 770 L 105 848 L 0 848 Z",
      // Front strip beneath island, between stools and island wood
      "M 420 810 L 660 795 L 660 848 L 400 848 Z",
      // Right open floor between island and right-leg cabinets
      "M 655 720 L 1010 710 L 1010 848 L 655 848 Z",
      // Far-right strip beneath right-leg cabinets' toe kick shadow
      "M 1010 810 L 1320 810 L 1320 848 L 1010 848 Z",
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
              <g clipPath="url(#clip-perimeterUppers)" style={{ mixBlendMode: "color", opacity: 0.85 }}>
                <rect x={0} y={0} width={VB_W} height={VB_H} fill={cabinetColor} />
              </g>
            )}
            {applyLowers && (
              <g clipPath="url(#clip-perimeterLowers)" style={{ mixBlendMode: "color", opacity: 0.85 }}>
                <rect x={0} y={0} width={VB_W} height={VB_H} fill={perimeterFinishColor} />
              </g>
            )}
            {applyIslandBase && (
              <g clipPath="url(#clip-islandBase)" style={{ mixBlendMode: "color", opacity: 0.9 }}>
                <rect x={0} y={0} width={VB_W} height={VB_H} fill={islandBaseColor} />
              </g>
            )}
            {applyPerimCounter && (
              <>
                <g clipPath="url(#clip-perimeterCounter)" style={{ mixBlendMode: "multiply", opacity: 0.85 }}>
                  {renderStoneElements(perimStone, VB_W, VB_H, `perim-${perimStone.id}`)}
                </g>
                {/* confined highlight-retention layer to preserve slab edge lighting */}
                <g clipPath="url(#clip-perimeterCounter)" style={{ mixBlendMode: "soft-light", opacity: 0.35 }}>
                  <rect x={0} y={0} width={VB_W} height={VB_H} fill="#ffffff" />
                </g>
              </>
            )}
            {applyIslandCounter && (
              <>
                <g clipPath="url(#clip-islandCounter)" style={{ mixBlendMode: "multiply", opacity: 0.85 }}>
                  {renderStoneElements(islandStone, VB_W, VB_H, `isl-${islandStone.id}`)}
                </g>
                <g clipPath="url(#clip-islandCounter)" style={{ mixBlendMode: "soft-light", opacity: 0.35 }}>
                  <rect x={0} y={0} width={VB_W} height={VB_H} fill="#ffffff" />
                </g>
              </>
            )}
            {applyBacksplash && (
              <g clipPath="url(#clip-backsplash)" style={{ mixBlendMode: "color", opacity: 0.7 }}>
                <rect x={0} y={0} width={VB_W} height={VB_H} fill={backsplashColor} />
              </g>
            )}
            {applyFlooring && (
              <g clipPath="url(#clip-flooring)" style={{ mixBlendMode: "color", opacity: 0.7 }}>
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

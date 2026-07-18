// Photorealistic kitchen preview built on kitchen-scene-v2.jpg.
// The scene was authored specifically for material swapping: straight-on
// symmetric composition, uninterrupted upper/lower perimeter cabinet runs,
// clearly separated perimeter + island countertops, broad backsplash,
// large flooring plane, and minimal integrated appliances.
//
// Because the camera is nearly orthogonal, every editable region can be
// expressed with a small number of clean rectangles/polygons whose edges
// align precisely with the underlying photograph. Every finish is confined
// to its clip region — no full-frame tint, no shared regions.

import { useMemo } from "react";
import kitchenBase from "@/assets/kitchen-scene-v2.jpg";
import {
  renderStoneElements,
  stoneById,
  DEFAULT_ISLAND_FINISH_ID,
  DEFAULT_PERIMETER_FINISH_ID,
} from "@/lib/stoneTextures";
import { productById } from "@/lib/catalog";

const VB_W = 1600;
const VB_H = 912;

// ---------- Region definitions ----------
// Coordinates are in the photograph's own pixel space (1600x912) and were
// validated by sampling the actual image. They deliberately under-cover the
// visible surface rather than bleed onto appliances, walls, or hardware.

export type RegionId =
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
  paths: string[];
  fillRule?: "evenodd" | "nonzero";
  debugColor: string;
}

export const REGIONS: RegionDef[] = [
  {
    id: "perimeterUppers",
    label: "Perimeter Uppers",
    debugColor: "rgba(56, 189, 248, 0.55)",
    // Single continuous upper run between fridge (left) and ovens (right).
    paths: ["M 160 88 L 1495 88 L 1495 308 L 160 308 Z"],
  },
  {
    id: "backsplash",
    label: "Backsplash",
    debugColor: "rgba(244, 114, 182, 0.55)",
    // Uninterrupted band between uppers and perimeter counter.
    paths: ["M 160 314 L 1495 314 L 1495 403 L 160 403 Z"],
  },
  {
    id: "perimeterCounter",
    label: "Perimeter Counter",
    debugColor: "rgba(163, 230, 53, 0.6)",
    // Thin slab strip. Stays well clear of backsplash and cabinet faces.
    paths: ["M 160 408 L 1495 408 L 1495 426 L 160 426 Z"],
  },
  {
    id: "perimeterLowers",
    label: "Perimeter Lowers",
    debugColor: "rgba(20, 184, 166, 0.55)",
    // Only the two side slices of perimeter lowers that remain visible
    // around the island. Center is hidden behind the island by design.
    paths: [
      "M 160 430 L 270 430 L 270 608 L 160 608 Z",
      "M 1330 430 L 1495 430 L 1495 608 L 1330 608 Z",
    ],
  },
  {
    id: "islandCounter",
    label: "Island Countertop",
    debugColor: "rgba(250, 204, 21, 0.6)",
    // Trapezoid: slightly wider at the front edge than at the back.
    paths: ["M 282 442 L 1318 442 L 1330 512 L 270 512 Z"],
  },
  {
    id: "islandBase",
    label: "Island Base",
    debugColor: "rgba(249, 115, 22, 0.55)",
    // Front face of the island cabinet base.
    paths: ["M 274 516 L 1326 516 L 1326 772 L 274 772 Z"],
  },
  {
    id: "flooring",
    label: "Flooring",
    debugColor: "rgba(239, 68, 68, 0.55)",
    // L-shape: full foreground strip, plus visible floor to the left and
    // right of the island above the foreground band.
    paths: [
      "M 0 776 L 1600 776 L 1600 912 L 0 912 Z",
      "M 0 610 L 272 610 L 272 776 L 0 776 Z",
      "M 1328 610 L 1600 610 L 1600 776 L 1328 776 Z",
    ],
  },
];

// ---------- Helpers ----------

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
  /** Show translucent debug fills (dev only). */
  debug?: boolean;
  /** Per-region debug visibility (dev only). */
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
  // ------------ Product resolution ------------
  // Cabinets drive every perimeter cabinet surface (uppers + lowers).
  // Island base follows cabinets unless islandFinish is set to a non-match
  // upgrade. Perimeter counter texture is independent from island counter.
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

  const cabinetColor =
    cabinetsProduct && !cabinetsProduct.included
      ? extractHex(cabinetsProduct.swatch)
      : undefined;
  const perimeterFinishColor =
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

  const perimCounterPaint =
    (perimCounterProduct && !perimCounterProduct.included) ||
    (perimeterVisualFinishId &&
      perimeterVisualFinishId !== DEFAULT_PERIMETER_FINISH_ID);
  const islandCounterPaint =
    (islandCounterExplicit && islandCounterExplicit.id !== "isl-ct-match") ||
    (islandVisualFinishId && islandVisualFinishId !== DEFAULT_ISLAND_FINISH_ID);

  const perimStone =
    stoneById(perimeterVisualFinishId) ?? stoneById(DEFAULT_PERIMETER_FINISH_ID)!;
  const islandStone =
    stoneById(islandVisualFinishId) ?? stoneById(DEFAULT_ISLAND_FINISH_ID)!;

  const regionById = useMemo(() => {
    const m: Record<string, RegionDef> = {};
    for (const r of REGIONS) m[r.id] = r;
    return m;
  }, []);

  const visibleRegion = (id: RegionId) => debugVisible?.[id] !== false;

  const applyCabinets = !before && !!cabinetColor;
  const applyLowers = !before && !!perimeterFinishColor;
  const applyIslandBase = !before && !!islandBaseColor;
  const applyPerimCounter = !before && perimCounterPaint;
  const applyIslandCounter = !before && islandCounterPaint;
  const applyBacksplash = !before && !!backsplashColor;
  const applyFlooring = !before && !!flooringColor;

  // ---------- Compositing primitives ----------
  // Every finish is applied as (a) a guaranteed-visible normal-blend color
  // layer at controlled opacity and (b) a confined multiply layer that adds
  // depth. Both layers are clipped to the region's exact shape so nothing
  // bleeds onto adjacent surfaces. Because the base image is bright and
  // neutral, multiply darkens correctly for dark selections while the base
  // opacity ensures light selections remain visible.

  const paintedCabinet = (clipId: string, color: string, key: string) => (
    <g key={key}>
      <g clipPath={`url(#${clipId})`} style={{ opacity: 0.62 }}>
        <rect x={0} y={0} width={VB_W} height={VB_H} fill={color} />
      </g>
      <g
        clipPath={`url(#${clipId})`}
        style={{ mixBlendMode: "multiply", opacity: 0.4 }}
      >
        <rect x={0} y={0} width={VB_W} height={VB_H} fill={color} />
      </g>
    </g>
  );

  const paintedSurface = (
    clipId: string,
    color: string,
    key: string,
    baseOpacity = 0.7,
  ) => (
    <g key={key}>
      <g clipPath={`url(#${clipId})`} style={{ opacity: baseOpacity }}>
        <rect x={0} y={0} width={VB_W} height={VB_H} fill={color} />
      </g>
      <g
        clipPath={`url(#${clipId})`}
        style={{ mixBlendMode: "multiply", opacity: 0.3 }}
      >
        <rect x={0} y={0} width={VB_W} height={VB_H} fill={color} />
      </g>
    </g>
  );

  const stoneSurface = (
    clipId: string,
    stone: ReturnType<typeof stoneById> & object,
    key: string,
  ) => (
    <g key={key}>
      <g clipPath={`url(#${clipId})`} style={{ opacity: 0.94 }}>
        {renderStoneElements(stone as never, VB_W, VB_H, `${key}-tex`)}
      </g>
      {/* Restrained highlight preserves photographic sheen. */}
      <g
        clipPath={`url(#${clipId})`}
        style={{ mixBlendMode: "soft-light", opacity: 0.2 }}
      >
        <rect x={0} y={0} width={VB_W} height={VB_H} fill="#ffffff" />
      </g>
    </g>
  );

  return (
    <div
      className="relative w-full"
      style={{ aspectRatio: `${VB_W} / ${VB_H}`, isolation: "isolate" }}
    >
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
          {REGIONS.map((r) => {
            const rule = r.fillRule ?? "nonzero";
            return (
              <clipPath
                id={`clip-${r.id}`}
                key={r.id}
                clipPathUnits="userSpaceOnUse"
              >
                {r.paths.map((d, i) => (
                  <path
                    key={i}
                    d={d}
                    fill="#000"
                    fillRule={rule}
                    clipRule={rule}
                  />
                ))}
              </clipPath>
            );
          })}
        </defs>

        {debug ? (
          <>
            {REGIONS.filter((r) => visibleRegion(r.id)).map((r) => {
              const rule = r.fillRule ?? "nonzero";
              return (
                <g key={r.id} fillRule={rule} clipRule={rule}>
                  {r.paths.map((d, i) => (
                    <path
                      key={i}
                      d={d}
                      fill={r.debugColor}
                      fillRule={rule}
                      clipRule={rule}
                    />
                  ))}
                </g>
              );
            })}
          </>
        ) : (
          <>
            {applyCabinets &&
              cabinetColor &&
              paintedCabinet("clip-perimeterUppers", cabinetColor, "uppers")}
            {applyLowers &&
              perimeterFinishColor &&
              paintedCabinet(
                "clip-perimeterLowers",
                perimeterFinishColor,
                "lowers",
              )}
            {applyIslandBase &&
              islandBaseColor &&
              paintedCabinet("clip-islandBase", islandBaseColor, "islandBase")}
            {applyPerimCounter &&
              stoneSurface("clip-perimeterCounter", perimStone, "perimCounter")}
            {applyIslandCounter &&
              stoneSurface("clip-islandCounter", islandStone, "islandCounter")}
            {applyBacksplash &&
              backsplashColor &&
              paintedSurface(
                "clip-backsplash",
                backsplashColor,
                "backsplash",
                0.72,
              )}
            {applyFlooring &&
              flooringColor &&
              paintedSurface("clip-flooring", flooringColor, "flooring", 0.62)}
          </>
        )}
      </svg>
    </div>
  );
}

// Material-accurate SVG kitchen scene. Every editable surface is an
// independent polygon/path — no photo, no pixel masks, no full-frame overlays.

import React from "react";
import {
  renderStoneElements,
  stoneById,
  DEFAULT_PERIMETER_FINISH_ID,
  DEFAULT_ISLAND_FINISH_ID,
} from "@/lib/stoneTextures";
import { productById } from "@/lib/catalog";

const VB_W = 1200;
const VB_H = 760;

// Region path definitions (all deterministic).
const PATHS = {
  wall: `M0 0 H${VB_W} V520 H0 Z`,
  floor: `M0 620 H${VB_W} V${VB_H} H0 Z`,
  // Upper cabinets: row of 5 modules across back wall (skipping window area).
  upperLeft: `M40 80 H360 V240 H40 Z`,
  upperRight: `M840 80 H1160 V240 H840 Z`,
  // Backsplash: wall stripe between upper cabinets and perimeter counter.
  backsplash: `M40 240 H1160 V370 H40 Z`,
  // Perimeter countertop slab (with visible front edge).
  perimeterCounter: `M20 370 H1180 V410 H20 Z`,
  perimeterCounterEdge: `M20 405 H1180 V415 H20 Z`,
  // Lower cabinets left block (with pantry-height left column).
  lowerLeftPantry: `M20 80 H160 V620 H20 Z`,
  lowerLeftBase: `M160 410 H500 V620 H160 Z`,
  // Refrigerator surround (right side tall panel).
  fridgeSurround: `M1040 80 H1180 V620 H1040 Z`,
  // Right lower base cabinets
  lowerRightBase: `M700 410 H1040 V620 H700 Z`,
  // Island (foreground)
  islandBase: `M300 520 H900 V700 H300 Z`,
  islandToeKick: `M300 700 H900 V720 H300 Z`,
  islandCounter: `M280 495 H920 V525 H280 Z`,
  islandCounterEdge: `M280 520 H920 V532 H280 Z`,
} as const;

const CLIP_IDS = {
  perimeterCounter: "clip-perim-counter",
  islandCounter: "clip-island-counter",
} as const;

interface Props {
  selections: Record<string, string>;
  perimeterVisualFinishId?: string;
  islandVisualFinishId?: string;
  /** Preview mode: "before" reverts every surface to base colors. */
  before?: boolean;
}

function colorOf(sel: Record<string, string>, cat: string, fallback: string): string {
  const p = productById(sel[cat]);
  return p?.swatch?.match(/#[0-9a-fA-F]{3,8}/)?.[0] ?? p?.swatch ?? fallback;
}

export function VectorKitchen({
  selections,
  perimeterVisualFinishId,
  islandVisualFinishId,
  before,
}: Props) {
  const BASE = {
    wall: "#efe8dc",
    upper: "#e6d8c1",
    lower: "#c9b492",
    fridgeSurround: "#c9b492",
    backsplash: "#e2ded2",
    flooring: "#c9a577",
    islandBase: "#c9b492",
    counter: "#e8e2d3",
  };

  const cabinetColor = before
    ? BASE.upper
    : colorOf(selections, "cabinets", BASE.upper);
  const perimeterFinishExplicit = productById(selections.perimeterFinish);
  const perimeterFinishColor = before
    ? BASE.lower
    : perimeterFinishExplicit && !perimeterFinishExplicit.included
    ? colorOf(selections, "perimeterFinish", BASE.lower)
    : cabinetColor;

  const islandFinishExplicit = productById(selections.islandFinish);
  const islandBaseColor = before
    ? BASE.islandBase
    : islandFinishExplicit && !islandFinishExplicit.id.endsWith("-none")
    ? colorOf(selections, "islandFinish", BASE.islandBase)
    : cabinetColor;

  const backsplashColor = before
    ? BASE.backsplash
    : colorOf(selections, "backsplash", BASE.backsplash);
  const flooringColor = before
    ? BASE.flooring
    : colorOf(selections, "flooring", BASE.flooring);
  const wallColor = BASE.wall;

  const perimStone =
    (!before && stoneById(perimeterVisualFinishId)) ||
    stoneById(DEFAULT_PERIMETER_FINISH_ID)!;
  const islandStone =
    (!before && stoneById(islandVisualFinishId)) ||
    stoneById(DEFAULT_ISLAND_FINISH_ID)!;

  return (
    <svg
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      className="block w-full h-auto"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Material-accurate kitchen preview"
    >
      <defs>
        {/* Clip paths bind stone renderings to exactly the polygon. */}
        <clipPath id={CLIP_IDS.perimeterCounter}>
          <path d={PATHS.perimeterCounter} />
        </clipPath>
        <clipPath id={CLIP_IDS.islandCounter}>
          <path d={PATHS.islandCounter} />
        </clipPath>
        <linearGradient id="cabinetShade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.18" />
          <stop offset="0.5" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="1" stopColor="#000000" stopOpacity="0.28" />
        </linearGradient>
        <linearGradient id="counterShine" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.35" />
          <stop offset="0.5" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="1" stopColor="#000000" stopOpacity="0.18" />
        </linearGradient>
        <linearGradient id="floorGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#000000" stopOpacity="0.18" />
          <stop offset="0.35" stopColor="#000000" stopOpacity="0" />
          <stop offset="1" stopColor="#000000" stopOpacity="0.25" />
        </linearGradient>
        <linearGradient id="wallGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#000000" stopOpacity="0.08" />
          <stop offset="1" stopColor="#000000" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Walls */}
      <path d={PATHS.wall} fill={wallColor} />
      <path d={PATHS.wall} fill="url(#wallGrad)" />

      {/* Window */}
      <g>
        <rect x={430} y={110} width={380} height={230} rx={4} fill="#dfe7ea" stroke="#8a8a8a" strokeWidth={2} />
        <rect x={430} y={110} width={380} height={230} rx={4} fill="url(#counterShine)" opacity={0.5} />
        <line x1={620} y1={110} x2={620} y2={340} stroke="#8a8a8a" strokeWidth={2} />
        <line x1={430} y1={225} x2={810} y2={225} stroke="#8a8a8a" strokeWidth={2} />
      </g>

      {/* Backsplash — independent */}
      <path d={PATHS.backsplash} fill={backsplashColor} />
      {/* Subtle horizontal grout for tile-y look */}
      <g stroke="#00000010" strokeWidth={1}>
        {[280, 320, 360].map((y) => (
          <line key={y} x1={40} y1={y} x2={1160} y2={y} />
        ))}
      </g>
      {/* Backsplash shading */}
      <path d={PATHS.backsplash} fill="url(#wallGrad)" opacity={0.5} />

      {/* Upper cabinets */}
      <CabinetBlock d={PATHS.upperLeft} color={cabinetColor} panels={3} />
      <CabinetBlock d={PATHS.upperRight} color={cabinetColor} panels={3} />

      {/* Perimeter countertop (stone) */}
      <g clipPath={`url(#${CLIP_IDS.perimeterCounter})`}>
        {renderStoneElements(perimStone, VB_W, 60, `perim-${perimStone.id}`)}
      </g>
      <path d={PATHS.perimeterCounter} fill="url(#counterShine)" pointerEvents="none" />
      {/* Counter front edge slightly darker */}
      <path d={PATHS.perimeterCounterEdge} fill="#00000018" />

      {/* Lower cabinets */}
      <CabinetBlock d={PATHS.lowerLeftPantry} color={perimeterFinishColor} panels={4} vertical />
      <CabinetBlock d={PATHS.lowerLeftBase} color={perimeterFinishColor} panels={3} />
      <CabinetBlock d={PATHS.lowerRightBase} color={perimeterFinishColor} panels={3} />
      <CabinetBlock d={PATHS.fridgeSurround} color={perimeterFinishColor} panels={3} vertical />

      {/* Refrigerator */}
      <g>
        <rect x={1050} y={110} width={120} height={480} rx={6} fill="#d8dade" stroke="#9099a2" strokeWidth={2} />
        <line x1={1050} y1={310} x2={1170} y2={310} stroke="#9099a2" strokeWidth={2} />
        <circle cx={1160} cy={220} r={3} fill="#6b7278" />
        <circle cx={1160} cy={400} r={3} fill="#6b7278" />
      </g>

      {/* Range / cooktop + hood (center back) */}
      <g>
        <rect x={540} y={410} width={160} height={210} fill="#22262b" />
        <rect x={548} y={420} width={144} height={30} fill="#2c3138" />
        <circle cx={578} cy={478} r={12} fill="#3a3f46" stroke="#191b1e" strokeWidth={2} />
        <circle cx={620} cy={478} r={14} fill="#3a3f46" stroke="#191b1e" strokeWidth={2} />
        <circle cx={662} cy={478} r={12} fill="#3a3f46" stroke="#191b1e" strokeWidth={2} />
        <rect x={548} y={520} width={144} height={90} rx={4} fill="#191b1e" stroke="#0d0f11" strokeWidth={2} />
        <rect x={558} y={575} width={124} height={4} rx={2} fill="#5b6068" />
      </g>

      {/* Sink (in lower right base under window edge for perimeter) */}
      <g>
        <rect x={200} y={378} width={220} height={30} rx={4} fill="#a0a4aa" />
        <rect x={210} y={382} width={200} height={22} rx={3} fill="#6c7178" />
        {/* Faucet */}
        <path
          d="M310 340 v40 M290 360 h40 M310 340 c0 -14 20 -14 20 -28"
          stroke={colorOf(selections, "faucet", "#8a8f96")}
          strokeWidth={5}
          fill="none"
          strokeLinecap="round"
        />
        <circle cx={310} cy={310} r={6} fill={colorOf(selections, "faucet", "#8a8f96")} />
      </g>

      {/* Island base (independent) */}
      <path d={PATHS.islandBase} fill={islandBaseColor} />
      <path d={PATHS.islandBase} fill="url(#cabinetShade)" />
      {/* Island panels */}
      <g stroke="#0000001f" strokeWidth={1.2} fill="none">
        {[430, 560, 690, 820].map((x) => (
          <line key={x} x1={x} y1={520} x2={x} y2={700} />
        ))}
      </g>
      <path d={PATHS.islandToeKick} fill="#00000024" />

      {/* Island countertop (stone) */}
      <g clipPath={`url(#${CLIP_IDS.islandCounter})`}>
        {renderStoneElements(islandStone, VB_W, 60, `isl-${islandStone.id}`)}
      </g>
      <path d={PATHS.islandCounter} fill="url(#counterShine)" pointerEvents="none" />
      <path d={PATHS.islandCounterEdge} fill="#00000022" />

      {/* Pendant lights above island */}
      <g>
        {[450, 600, 750].map((x) => (
          <g key={x}>
            <line x1={x} y1={0} x2={x} y2={60} stroke="#5d5d5d" strokeWidth={1.5} />
            <path
              d={`M${x - 22} 60 Q${x} 110 ${x + 22} 60 Z`}
              fill="#2b2e33"
              stroke="#0d0f11"
              strokeWidth={1}
            />
          </g>
        ))}
      </g>

      {/* Flooring */}
      <path d={PATHS.floor} fill={flooringColor} />
      {/* Plank lines */}
      <g stroke="#00000020" strokeWidth={1}>
        {[640, 660, 680, 700, 720, 740].map((y) => (
          <line key={y} x1={0} y1={y} x2={VB_W} y2={y} />
        ))}
      </g>
      <path d={PATHS.floor} fill="url(#floorGrad)" />
    </svg>
  );
}

function CabinetBlock({
  d,
  color,
  panels,
  vertical,
}: {
  d: string;
  color: string;
  panels: number;
  vertical?: boolean;
}) {
  // Extract bounds from a simple axis-aligned rect path like "M x y H x2 V y2 H x Z".
  const nums = d.match(/[-\d.]+/g)!.map(Number);
  const [x, y, x2, y2] = [nums[0], nums[1], nums[2], nums[3]];
  const w = x2 - x;
  const h = y2 - y;
  const lines: number[] = [];
  for (let i = 1; i < panels; i++) {
    lines.push((vertical ? y : x) + (vertical ? h : w) * (i / panels));
  }
  return (
    <g>
      <path d={d} fill={color} />
      <path d={d} fill="url(#cabinetShade)" />
      <g stroke="#00000024" strokeWidth={1.2} fill="none">
        {lines.map((p, i) =>
          vertical ? (
            <line key={i} x1={x} y1={p} x2={x2} y2={p} />
          ) : (
            <line key={i} x1={p} y1={y} x2={p} y2={y2} />
          ),
        )}
      </g>
      {/* Hardware pulls — small horizontal bars */}
      <g fill="#4a4a4a">
        {Array.from({ length: panels }).map((_, i) => {
          if (vertical) {
            const cy = y + (h * (i + 0.5)) / panels;
            return <rect key={i} x={x2 - 22} y={cy - 2} width={14} height={3} rx={1} />;
          }
          const cx = x + (w * (i + 0.5)) / panels;
          return <rect key={i} x={cx - 8} y={y + h - 18} width={16} height={3} rx={1} />;
        })}
      </g>
    </g>
  );
}

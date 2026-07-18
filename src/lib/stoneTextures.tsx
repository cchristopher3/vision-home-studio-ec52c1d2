// Deterministic procedural stone/marble textures rendered as SVG.
// Illustrative only — not a manufacturer sample.

import React from "react";

export type MaterialFamily = "marble" | "granite" | "stone";
export type ColorFamily =
  | "light-white"
  | "warm-neutral"
  | "gray-cool"
  | "dark-dramatic"
  | "color-statement";

export interface StoneTextureDefinition {
  id: string;
  name: string;
  family: MaterialFamily;
  colorFamily: ColorFamily;
  baseColor: string;
  /** Deep vein / branching colors (marble). */
  veinColors: string[];
  /** Small mineral fleck colors (granite / stone). */
  mineralColors: string[];
  /** Optional broad tonal wash colors. */
  tonalColors?: string[];
  /** Stable pseudo-random seed. Never change once shipped. */
  seed: number;
  /** Broad slab scale for texture density. */
  scale?: number;
}

// ------------------ 16 canonical finishes ------------------

export const STONE_TEXTURES: StoneTextureDefinition[] = [
  {
    id: "calacatta-gold",
    name: "Calacatta Gold Look",
    family: "marble",
    colorFamily: "light-white",
    baseColor: "#f4efe6",
    veinColors: ["#8f8577", "#b09a6c", "#e7d9a5"],
    mineralColors: [],
    tonalColors: ["#efe7d5"],
    seed: 1001,
  },
  {
    id: "carrara",
    name: "Carrara Look",
    family: "marble",
    colorFamily: "light-white",
    baseColor: "#eeece7",
    veinColors: ["#a9adb3", "#c8ccd1"],
    mineralColors: [],
    tonalColors: ["#e2e2df"],
    seed: 1002,
  },
  {
    id: "statuario",
    name: "Statuario White Marble Look",
    family: "marble",
    colorFamily: "light-white",
    baseColor: "#f7f6f2",
    veinColors: ["#6b7079", "#9aa0a8"],
    mineralColors: [],
    tonalColors: ["#ebeae6"],
    seed: 1003,
  },
  {
    id: "arabescato-gray",
    name: "Arabescato Gray Marble Look",
    family: "marble",
    colorFamily: "gray-cool",
    baseColor: "#e6e6e5",
    veinColors: ["#3d4149", "#7c8189", "#c9c8c5"],
    mineralColors: [],
    tonalColors: ["#dcdcda"],
    seed: 1004,
  },
  {
    id: "emperador-brown",
    name: "Emperador Brown Marble Look",
    family: "marble",
    colorFamily: "warm-neutral",
    baseColor: "#4a3527",
    veinColors: ["#d8b58a", "#f0e2c8", "#a67848"],
    mineralColors: [],
    tonalColors: ["#5b4130"],
    seed: 1005,
  },
  {
    id: "nero-marquina",
    name: "Nero Marquina Marble Look",
    family: "marble",
    colorFamily: "dark-dramatic",
    baseColor: "#141518",
    veinColors: ["#f4f2ec", "#c9c6bc"],
    mineralColors: [],
    tonalColors: ["#1e1f22"],
    seed: 1006,
  },
  {
    id: "verde-alpine",
    name: "Verde Alpine Marble Look",
    family: "marble",
    colorFamily: "color-statement",
    baseColor: "#2f4a3a",
    veinColors: ["#f2f5ee", "#b7d3b7", "#7ba087"],
    mineralColors: [],
    tonalColors: ["#37543f"],
    seed: 1007,
  },
  {
    id: "blue-gray",
    name: "Blue Gray Marble Look",
    family: "marble",
    colorFamily: "gray-cool",
    baseColor: "#4d5f6b",
    veinColors: ["#e6ecef", "#a4b3bc", "#33424c"],
    mineralColors: [],
    tonalColors: ["#586b78"],
    seed: 1008,
  },
  {
    id: "warm-speckled-granite",
    name: "Warm Speckled Granite Look",
    family: "granite",
    colorFamily: "warm-neutral",
    baseColor: "#b6a181",
    veinColors: [],
    mineralColors: ["#5b4a34", "#f0e5d0", "#8b6f4c", "#2c221a"],
    tonalColors: ["#c9b593", "#a08b6d"],
    seed: 2001,
  },
  {
    id: "black-galaxy",
    name: "Black Galaxy Granite Look",
    family: "granite",
    colorFamily: "dark-dramatic",
    baseColor: "#0f1013",
    veinColors: [],
    mineralColors: ["#c69353", "#e0a15b", "#8a6532", "#c9c5bd"],
    tonalColors: ["#171820"],
    seed: 2002,
  },
  {
    id: "white-ice-granite",
    name: "White Ice Granite Look",
    family: "granite",
    colorFamily: "light-white",
    baseColor: "#e6e5e0",
    veinColors: [],
    mineralColors: ["#181818", "#c9c6be", "#7a1a1e", "#f4f2ec"],
    tonalColors: ["#d9d8d2"],
    seed: 2003,
  },
  {
    id: "colonial-cream",
    name: "Colonial Cream Granite Look",
    family: "granite",
    colorFamily: "warm-neutral",
    baseColor: "#dfd2b3",
    veinColors: [],
    mineralColors: ["#7b6444", "#3d3324", "#e2b57a", "#f1e6cb"],
    tonalColors: ["#c9bb99", "#e8dcb9"],
    seed: 2004,
  },
  {
    id: "steel-gray-granite",
    name: "Steel Gray Granite Look",
    family: "granite",
    colorFamily: "gray-cool",
    baseColor: "#484a4d",
    veinColors: [],
    mineralColors: ["#8f9296", "#c9ccd0", "#1e1f22"],
    tonalColors: ["#3d3f42"],
    seed: 2005,
  },
  {
    id: "blue-pearl",
    name: "Blue Pearl Granite Look",
    family: "granite",
    colorFamily: "color-statement",
    baseColor: "#3a4a5c",
    veinColors: [],
    mineralColors: ["#7ea2c4", "#b7c9d8", "#1c2531", "#e7f0f7"],
    tonalColors: ["#425668"],
    seed: 2006,
  },
  {
    id: "tan-brown-granite",
    name: "Tan Brown Granite Look",
    family: "granite",
    colorFamily: "warm-neutral",
    baseColor: "#3f2b21",
    veinColors: [],
    mineralColors: ["#a3703f", "#e5c99b", "#1a120c", "#7a3b1e"],
    tonalColors: ["#4c3327"],
    seed: 2007,
  },
  {
    id: "charcoal-stone",
    name: "Charcoal Stone Look",
    family: "stone",
    colorFamily: "dark-dramatic",
    baseColor: "#2a2c30",
    veinColors: ["#b7bac0", "#5a5d63"],
    mineralColors: ["#3b3e44"],
    tonalColors: ["#33363b"],
    seed: 3001,
  },
];

export const COLOR_FAMILIES: { id: ColorFamily | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "light-white", label: "Light & White" },
  { id: "warm-neutral", label: "Warm Neutral" },
  { id: "gray-cool", label: "Gray & Cool" },
  { id: "dark-dramatic", label: "Dark & Dramatic" },
  { id: "color-statement", label: "Color Statement" },
];

/** Six recommended finishes shown before the user opens the full grid. */
export const RECOMMENDED_FINISH_IDS = [
  "calacatta-gold",
  "carrara",
  "warm-speckled-granite",
  "steel-gray-granite",
  "colonial-cream",
  "nero-marquina",
];

export const DEFAULT_PERIMETER_FINISH_ID = "carrara";
export const DEFAULT_ISLAND_FINISH_ID = "calacatta-gold";

export function stoneById(id: string | undefined): StoneTextureDefinition | undefined {
  if (!id) return undefined;
  return STONE_TEXTURES.find((s) => s.id === id);
}

// ------------------ Deterministic PRNG (mulberry32) ------------------

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ------------------ Texture renderers ------------------

/**
 * Render the inner elements of a stone surface into an SVG group.
 * Caller controls sizing / clipping via a wrapping <svg> viewBox.
 * viewBox space is 0..W x 0..H.
 */
export function renderStoneElements(
  def: StoneTextureDefinition,
  w: number,
  h: number,
  keyPrefix = "s",
): React.ReactNode {
  const rand = mulberry32(def.seed);
  const scale = def.scale ?? 1;

  return (
    <g>
      {/* Base color */}
      <rect x={0} y={0} width={w} height={h} fill={def.baseColor} />

      {/* Broad tonal wash blobs — subtle depth without changing hue */}
      {def.tonalColors?.map((c, i) => {
        const cx = rand() * w;
        const cy = rand() * h;
        const rx = w * (0.35 + rand() * 0.3);
        const ry = h * (0.3 + rand() * 0.35);
        return (
          <ellipse
            key={`${keyPrefix}-tone-${i}`}
            cx={cx}
            cy={cy}
            rx={rx}
            ry={ry}
            fill={c}
            opacity={0.35}
          />
        );
      })}

      {def.family === "marble" && renderMarbleVeins(def, w, h, rand, scale, keyPrefix)}
      {def.family === "granite" && renderGraniteMinerals(def, w, h, rand, scale, keyPrefix)}
      {def.family === "stone" && (
        <>
          {renderGraniteMinerals(def, w, h, rand, scale * 0.6, keyPrefix)}
          {renderMarbleVeins({ ...def, veinColors: def.veinColors }, w, h, mulberry32(def.seed + 7), scale * 0.8, keyPrefix + "-v")}
        </>
      )}
    </g>
  );
}

function renderMarbleVeins(
  def: StoneTextureDefinition,
  w: number,
  h: number,
  rand: () => number,
  scale: number,
  keyPrefix: string,
): React.ReactNode {
  const veins: React.ReactNode[] = [];
  const primaryCount = 4;
  const secondaryCount = 10;

  // Broad sweeping primary veins
  for (let i = 0; i < primaryCount; i++) {
    const color = def.veinColors[i % def.veinColors.length];
    const path = buildOrganicVein(w, h, rand, 8, 0.45);
    veins.push(
      <path
        key={`${keyPrefix}-v${i}`}
        d={path}
        stroke={color}
        strokeWidth={0.9 + rand() * 1.4}
        strokeOpacity={0.55 + rand() * 0.3}
        fill="none"
        strokeLinecap="round"
      />,
    );
    // Feathered branches off the primary
    const branches = 2 + Math.floor(rand() * 3);
    for (let b = 0; b < branches; b++) {
      const bp = buildOrganicVein(w, h, rand, 4, 0.25);
      veins.push(
        <path
          key={`${keyPrefix}-v${i}-b${b}`}
          d={bp}
          stroke={color}
          strokeWidth={0.35 + rand() * 0.5}
          strokeOpacity={0.35 + rand() * 0.25}
          fill="none"
          strokeLinecap="round"
        />,
      );
    }
  }

  // Fine hair veins
  for (let i = 0; i < secondaryCount; i++) {
    const color = def.veinColors[(i + 1) % def.veinColors.length];
    const p = buildOrganicVein(w, h, rand, 3, 0.18);
    veins.push(
      <path
        key={`${keyPrefix}-hv${i}`}
        d={p}
        stroke={color}
        strokeWidth={0.2 + rand() * 0.35}
        strokeOpacity={0.25 + rand() * 0.2}
        fill="none"
      />,
    );
  }

  return <g style={{ transform: `scale(${scale})`, transformOrigin: "center" }}>{veins}</g>;
}

function buildOrganicVein(
  w: number,
  h: number,
  rand: () => number,
  segments: number,
  jitter: number,
): string {
  // Start on one edge, wander diagonally across.
  const startSide = rand();
  let x = startSide < 0.5 ? -w * 0.05 : w * (0.3 + rand() * 0.6);
  let y = rand() * h;
  const dxTotal = w * (0.9 + rand() * 0.4);
  const dyTotal = h * ((rand() - 0.5) * 1.6);
  let d = `M ${x.toFixed(2)} ${y.toFixed(2)}`;
  for (let i = 1; i <= segments; i++) {
    const t = i / segments;
    const nx = x + (dxTotal / segments) + (rand() - 0.5) * w * jitter;
    const ny = y + (dyTotal / segments) + (rand() - 0.5) * h * jitter * 1.2;
    const cx1 = x + (nx - x) * 0.35 + (rand() - 0.5) * w * jitter * 0.6;
    const cy1 = y + (ny - y) * 0.15 + (rand() - 0.5) * h * jitter * 0.6;
    const cx2 = x + (nx - x) * 0.7 + (rand() - 0.5) * w * jitter * 0.6;
    const cy2 = y + (ny - y) * 0.85 + (rand() - 0.5) * h * jitter * 0.6;
    d += ` C ${cx1.toFixed(2)} ${cy1.toFixed(2)}, ${cx2.toFixed(2)} ${cy2.toFixed(2)}, ${nx.toFixed(2)} ${ny.toFixed(2)}`;
    x = nx;
    y = ny;
    // avoid unused var warning
    void t;
  }
  return d;
}

function renderGraniteMinerals(
  def: StoneTextureDefinition,
  w: number,
  h: number,
  rand: () => number,
  scale: number,
  keyPrefix: string,
): React.ReactNode {
  const cells: React.ReactNode[] = [];
  const density = 900 * scale;
  const minerals = def.mineralColors.length ? def.mineralColors : [def.baseColor];

  for (let i = 0; i < density; i++) {
    const cx = rand() * w;
    const cy = rand() * h;
    const rBase = 0.35 + rand() * 1.4;
    // Occasional larger translucent flecks
    const large = rand() < 0.04;
    const r = large ? rBase * (2.5 + rand() * 2.5) : rBase;
    const color = minerals[Math.floor(rand() * minerals.length)];
    const opacity = large ? 0.35 + rand() * 0.25 : 0.55 + rand() * 0.4;
    cells.push(
      <circle
        key={`${keyPrefix}-m${i}`}
        cx={cx}
        cy={cy}
        r={r}
        fill={color}
        opacity={opacity}
      />,
    );
  }
  return <g>{cells}</g>;
}

// ------------------ Public renderers ------------------

/** Small stand-alone SVG thumbnail; identical generator as the surface. */
export function StoneSwatchThumb({
  def,
  size = 88,
  className,
}: {
  def: StoneTextureDefinition;
  size?: number;
  className?: string;
}) {
  const w = 100;
  const h = 100;
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      width={size}
      height={size}
      className={className}
      aria-hidden
      preserveAspectRatio="xMidYMid slice"
    >
      {renderStoneElements(def, w, h, `sw-${def.id}`)}
      {/* subtle inner highlight for depth without hue change */}
      <rect
        x={0}
        y={0}
        width={w}
        height={h}
        fill="url(#stone-thumb-shine)"
        opacity={0.25}
      />
      <defs>
        <linearGradient id="stone-thumb-shine" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.4" />
          <stop offset="0.5" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="1" stopColor="#000000" stopOpacity="0.12" />
        </linearGradient>
      </defs>
    </svg>
  );
}

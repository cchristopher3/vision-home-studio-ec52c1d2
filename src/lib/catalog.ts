// True Homes-Inspired Demo Catalog — DEMONSTRATION DATA ONLY.
// Not an official builder application. All prices, product codes, and
// availability are illustrative and must be confirmed by the builder.

export const CATALOG_META = {
  name: "True Homes-Inspired Demo Catalog",
  disclaimer:
    "Demonstration data only — not an official builder application. Availability, pricing, and product codes must be confirmed by the builder.",
  effectiveDate: "2026-01-01",
} as const;

export type Room = "kitchen" | "bathroom";
export type Tone = "light" | "dark";
export type ProductStatus = "included" | "upgrade" | "optional";
export type KitchenLayout = "standard" | "alt1";

export interface Product {
  id: string;
  code?: string;
  category: string;
  room: Room;
  name: string;
  configuration?: string;
  manufacturer: string;
  finish: string;
  status: ProductStatus;
  /** Backwards-compat convenience. True when status === "included". */
  included: boolean;
  price: number;
  tone: Tone;
  swatch: string;
  /** Optional tileable material texture used by the masked room renderer. */
  textureImageUrl?: string;
  /** Optional full-region transparent overlay for builder-approved renders. */
  overlayImageUrl?: string;
  /** Per-product renderer tuning. Values fall back to the region defaults. */
  visual?: {
    opacity?: number;
    blendMode?: "normal" | "multiply" | "overlay" | "soft-light" | "color";
    scale?: number;
    rotation?: number;
  };
  layouts?: KitchenLayout[]; // kitchen only. If omitted, available in all.
  /** Per-layout price overrides (kitchen only). */
  priceByLayout?: Partial<Record<KitchenLayout, number>>;
  requires?: { category: string; anyOf: string[] }[];
  excludesCategoryConfig?: { category: string; configurationIncludes: string[] }[];
  restrictions?: string;
  builderNotes?: string;
  imagePlaceholder?: string;
  effectiveDate?: string;
  active?: boolean;
  description?: string;
}

export const BUILDERS = [
  { id: "true-homes", name: "True Homes-Inspired Demo", tagline: "Demonstration builder (not affiliated)" },
];

export const COMMUNITIES = [
  { id: "calebs-creek", name: "Caleb's Creek", location: "Kernersville, NC" },
  { id: "haven-rocky-river", name: "Haven at Rocky River", location: "Concord, NC" },
  { id: "northborough", name: "Northborough", location: "Lake Norman, NC" },
];

export const FLOOR_PLANS = [
  { id: "riley", name: "The Riley", beds: 3, baths: 2.5, sqft: 2140 },
  { id: "hudson", name: "The Hudson", beds: 4, baths: 3, sqft: 2680 },
  { id: "kipling", name: "The Kipling", beds: 5, baths: 4, sqft: 3220 },
];

export const KITCHEN_LAYOUTS: { id: KitchenLayout; label: string; description: string }[] = [
  { id: "standard", label: "Standard Kitchen", description: "Base plan kitchen footprint with island." },
  { id: "alt1", label: "Alternate Kitchen 1", description: "Optional layout with extended island and rearranged appliance wall." },
];

export interface CategoryDef {
  id: string;
  label: string;
  group: "cabinetry" | "surfaces" | "fixtures" | "island" | "appliances";
}

export const KITCHEN_CATEGORIES: CategoryDef[] = [
  { id: "backsplash", label: "Kitchen Backsplash", group: "surfaces" },
  { id: "cabinets", label: "Kitchen Cabinets", group: "cabinetry" },
  { id: "countertops", label: "Kitchen Countertops (Perimeter)", group: "surfaces" },
  { id: "islandCounter", label: "Island Countertop", group: "island" },
  { id: "flooring", label: "Kitchen Flooring", group: "surfaces" },
  { id: "sink", label: "Kitchen Sink", group: "fixtures" },
  { id: "faucet", label: "Kitchen Faucet", group: "fixtures" },
  { id: "cooktopBacksplash", label: "Cooktop Accent Backsplash", group: "surfaces" },
  { id: "soapDispenser", label: "Soap Dispenser", group: "fixtures" },
  { id: "islandFinish", label: "Island Finish", group: "island" },
  { id: "islandTrim", label: "Island Trim", group: "island" },
  { id: "islandWaterfall", label: "Island Waterfall", group: "island" },
  { id: "extendedIslandCountertop", label: "Extended Island Countertop", group: "island" },
  { id: "perimeterFinish", label: "Kitchen Perimeter Finish", group: "cabinetry" },
  { id: "dishwasher", label: "Dishwasher", group: "appliances" },
  { id: "cooktop", label: "Cooktop", group: "appliances" },
  { id: "range", label: "Range", group: "appliances" },
  { id: "hood", label: "Hood", group: "appliances" },
  { id: "microwave", label: "Microwave", group: "appliances" },
  { id: "wallOven", label: "Wall Oven", group: "appliances" },
  { id: "refrigerator", label: "Refrigerator", group: "appliances" },
];


export const BATHROOM_CATEGORIES: CategoryDef[] = [
  { id: "vanity", label: "Vanity", group: "cabinetry" },
  { id: "countertop", label: "Countertop", group: "surfaces" },
  { id: "showerTile", label: "Shower Tile", group: "surfaces" },
  { id: "floorTile", label: "Floor Tile", group: "surfaces" },
  { id: "faucets", label: "Faucets", group: "fixtures" },
  { id: "wallPaint", label: "Wall Paint", group: "surfaces" },
];

// ---------- helpers to build cabinet & countertop entries succinctly
const CAB_MFR = "Timberline Cabinetry";
const cabSwatch = (hex1: string, hex2: string) => `linear-gradient(135deg,${hex1},${hex2})`;

const cabinetLine: {
  key: string;
  name: string;
  swatch: [string, string];
  tone: Tone;
  prices: { p30: number; p36: number; p42: number };
  included?: boolean;
}[] = [
  { key: "seacrest",   name: "Seacrest",             swatch: ["#f7f5f0", "#e8e4dd"], tone: "light", prices: { p30: 0,    p36: 725,  p42: 1225 }, included: true },
  { key: "maddie",     name: "Maddie",               swatch: ["#eae4d6", "#c9bfa8"], tone: "light", prices: { p30: 1650, p36: 1975, p42: 2475 } },
  { key: "derby",      name: "Derby",                swatch: ["#c9c2b3", "#8a8371"], tone: "light", prices: { p30: 1850, p36: 2200, p42: 2700 } },
  { key: "skylar",     name: "Skylar",               swatch: ["#8f8b82", "#4c4a44"], tone: "dark",  prices: { p30: 7850, p36: 8350, p42: 8850 } },
  { key: "shay",       name: "Shay",                 swatch: ["#4a5566", "#232a35"], tone: "dark",  prices: { p30: 8600, p36: 9125, p42: 9625 } },
  { key: "galveston",  name: "Galveston",            swatch: ["#b58658", "#6a4626"], tone: "dark",  prices: { p30: 9125, p36: 9675, p42: 10175 } },
  { key: "felix",      name: "Felix",                swatch: ["#2a2e33", "#0d1013"], tone: "dark",  prices: { p30: 9800, p36: 10375, p42: 10850 } },
  { key: "galveston5", name: "Galveston 5-piece",    swatch: ["#b58658", "#5a3a1e"], tone: "dark",  prices: { p30: 9800, p36: 10375, p42: 10850 } },
  { key: "reagan",     name: "Reagan",               swatch: ["#e8dfd0", "#a89e88"], tone: "light", prices: { p30: 11200, p36: 11850, p42: 12300 } },
];

const configs: { id: "30" | "36" | "42"; label: string; priceKey: "p30" | "p36" | "p42" }[] = [
  { id: "30", label: '30" Staggered', priceKey: "p30" },
  { id: "36", label: '36" Staggered', priceKey: "p36" },
  { id: "42", label: '42" Straight',  priceKey: "p42" },
];

const cabinetProducts: Product[] = cabinetLine.flatMap((c) =>
  configs.map<Product>((cfg) => ({
    id: `cab-${c.key}-${cfg.id}`,
    code: `CAB-${c.key.toUpperCase().slice(0, 4)}-${cfg.id}`,
    category: "cabinets",
    room: "kitchen",
    name: c.name,
    configuration: cfg.label,
    manufacturer: CAB_MFR,
    finish: c.name,
    status: c.included && cfg.id === "30" ? "included" : "upgrade",
    included: !!(c.included && cfg.id === "30"),
    price: c.prices[cfg.priceKey],
    tone: c.tone,
    swatch: cabSwatch(c.swatch[0], c.swatch[1]),
    effectiveDate: CATALOG_META.effectiveDate,
    active: true,
    builderNotes: cfg.id === "42" ? "42\" straight overlay reaches ceiling on 9' plate; verify ceiling height." : undefined,
    imagePlaceholder: `cabinet-${c.key}-${cfg.id}.jpg`,
  })),
);

// countertops levels 1..6
const ctPalette: [string, string, Tone][] = [
  ["#e6e3dc", "#b8b3a8", "light"],
  ["#f2efe9", "#d6d2c8", "light"],
  ["#efece5", "#c9c3b6", "light"],
  ["#f6f3ea", "#c9a55b", "light"],
  ["#dcd8cf", "#8a8478", "light"],
  ["#2a2c30", "#0e1013", "dark"],
];
const countertopProducts: Product[] = [1, 2, 3, 4, 5, 6].map<Product>((lvl, i) => {
  const prices = [0, 1250, 1900, 2500, 4800, 6200];
  return {
    id: `ct-l${lvl}`,
    code: `CT-L${lvl}`,
    category: "countertops",
    room: "kitchen",
    name: `Countertop Level ${lvl}`,
    configuration: `Level ${lvl}`,
    manufacturer: "Approved Stone Supplier",
    finish: lvl >= 5 ? "Polished / Suede" : "Polished",
    status: lvl === 1 ? "included" : "upgrade",
    included: lvl === 1,
    price: prices[lvl - 1],
    tone: ctPalette[i][2],
    swatch: cabSwatch(ctPalette[i][0], ctPalette[i][1]),
    effectiveDate: CATALOG_META.effectiveDate,
    active: true,
    imagePlaceholder: `countertop-l${lvl}.jpg`,
    builderNotes: lvl >= 5 ? "Slab availability varies; confirm current lot with design consultant." : undefined,
  };
});

const sinkProducts: Product[] = ([
  { key: "ss-under", name: "Stainless Steel Undermount", price: 0, status: "included", swatch: ["#dfe3e7", "#9aa0a6"], tone: "light", restrictions: undefined },
  { key: "6040-under", name: "60/40 Undermount Sink", price: 200, status: "upgrade", swatch: ["#d1d5d9", "#8a8f94"], tone: "light" },
  { key: "porcelain-farm", name: '35.5" Porcelain Farm Style Sink', price: 1500, status: "upgrade", swatch: ["#f7f5ef", "#d8d3c6"], tone: "light", restrictions: 'Requires 36" or 42" cabinet configuration.' },
  { key: "stainless-farm", name: '32.5" Stainless Farm Style Sink', price: 1250, status: "upgrade", swatch: ["#c6cbd0", "#6d7378"], tone: "light", restrictions: 'Requires 36" or 42" cabinet configuration.' },
] as { key: string; name: string; price: number; status: ProductStatus; swatch: [string, string]; tone: Tone; restrictions?: string }[]).map<Product>((s, i) => ({
  id: `sink-${s.key}`,
  code: `SNK-${String(i + 1).padStart(3, "0")}`,
  category: "sink",
  room: "kitchen",
  name: s.name,
  manufacturer: "Kohler / Elkay (spec)",
  finish: s.name.includes("Porcelain") ? "White Porcelain" : "Stainless",
  status: s.status,
  included: s.status === "included",
  price: s.price,
  tone: s.tone,
  swatch: cabSwatch(s.swatch[0], s.swatch[1]),
  restrictions: s.restrictions,
  excludesCategoryConfig: s.key.includes("farm")
    ? [{ category: "cabinets", configurationIncludes: ['30"'] }]
    : undefined,
  builderNotes: s.key.includes("farm") ? "Farm sinks require modified sink base cabinet." : undefined,
  effectiveDate: CATALOG_META.effectiveDate,
  active: true,
  imagePlaceholder: `sink-${s.key}.jpg`,
}));

const faucetList: { key: string; name: string; price: number; finishHex: [string, string]; tone: Tone; status?: ProductStatus }[] = [
  { key: "integra-pull-chrome", name: "Integra Pull-Out Chrome", price: 0, finishHex: ["#dfe3e7", "#9aa0a6"], tone: "light", status: "included" },
  { key: "arbor-chrome", name: "Arbor Chrome", price: 230, finishHex: ["#dfe3e7", "#9aa0a6"], tone: "light" },
  { key: "arbor-srs", name: "Arbor Spot Resist Stainless", price: 360, finishHex: ["#c6cbd0", "#7c8186"], tone: "light" },
  { key: "arbor-matte", name: "Arbor Matte Black", price: 385, finishHex: ["#2a2a2a", "#0a0a0a"], tone: "dark" },
  { key: "integra-stainless", name: "Integra Stainless", price: 95, finishHex: ["#c6cbd0", "#7c8186"], tone: "light" },
  { key: "align-spring-ss", name: "Align Spring Pulldown Stainless", price: 650, finishHex: ["#c6cbd0", "#7c8186"], tone: "light" },
  { key: "align-spring-mb", name: "Align Spring Pulldown Matte Black", price: 685, finishHex: ["#2a2a2a", "#0a0a0a"], tone: "dark" },
  { key: "genta-chrome", name: "Genta LX Chrome", price: 260, finishHex: ["#dfe3e7", "#9aa0a6"], tone: "light" },
  { key: "genta-mb", name: "Genta LX Matte Black", price: 425, finishHex: ["#2a2a2a", "#0a0a0a"], tone: "dark" },
  { key: "genta-ss", name: "Genta LX Stainless", price: 400, finishHex: ["#c6cbd0", "#7c8186"], tone: "light" },
  { key: "genta-bg", name: "Genta LX Bronzed Gold", price: 510, finishHex: ["#c9a45a", "#8a6a2b"], tone: "light" },
  { key: "align-ss", name: "Align Stainless", price: 525, finishHex: ["#c6cbd0", "#7c8186"], tone: "light" },
  { key: "align-mb", name: "Align Matte Black", price: 555, finishHex: ["#2a2a2a", "#0a0a0a"], tone: "dark" },
  { key: "align-bs", name: "Align Black Stainless", price: 655, finishHex: ["#3a3a3d", "#141416"], tone: "dark" },
  { key: "align-bg", name: "Align Brushed Gold", price: 655, finishHex: ["#c9a45a", "#8a6a2b"], tone: "light" },
];

const faucetProducts: Product[] = faucetList.map<Product>((f, i) => ({
  id: `fct-${f.key}`,
  code: `FCT-${String(i + 1).padStart(3, "0")}`,
  category: "faucet",
  room: "kitchen",
  name: f.name,
  manufacturer: f.name.startsWith("Arbor") || f.name.startsWith("Align") || f.name.startsWith("Genta") ? "Moen" : "Moen",
  finish: f.name.split(" ").slice(-2).join(" "),
  status: f.status ?? "upgrade",
  included: f.status === "included",
  price: f.price,
  tone: f.tone,
  swatch: cabSwatch(f.finishHex[0], f.finishHex[1]),
  effectiveDate: CATALOG_META.effectiveDate,
  active: true,
  imagePlaceholder: `faucet-${f.key}.jpg`,
}));

// Island Finish (painted color)
const islandFinishProducts: Product[] = [
  { key: "none", name: "Match Perimeter Cabinets", price: 0, status: "included" as ProductStatus, swatch: ["#f7f5f0", "#e8e4dd"], tone: "light" as Tone },
  { key: "finish-b", name: "Painted Island — Finish B", price: 500, status: "upgrade" as ProductStatus, swatch: ["#3d4a5a", "#1e2732"], tone: "dark" as Tone },
  { key: "finish-m", name: "Painted Island — Finish M", price: 500, status: "upgrade" as ProductStatus, swatch: ["#6a5a48", "#3a2f22"], tone: "dark" as Tone },
].map<Product>((x, i) => ({
  id: `isl-fin-${x.key}`,
  code: `ISL-FIN-${String(i).padStart(2, "0")}`,
  category: "islandFinish",
  room: "kitchen",
  name: x.name,
  manufacturer: CAB_MFR,
  finish: x.name,
  status: x.status,
  included: x.status === "included",
  price: x.price,
  tone: x.tone,
  swatch: cabSwatch(x.swatch[0], x.swatch[1]),
  effectiveDate: CATALOG_META.effectiveDate,
  active: true,
  imagePlaceholder: `island-finish-${x.key}.jpg`,
}));

const islandTrimProducts: Product[] = [
  { key: "none", name: "No Additional Trim", price: 0, status: "included" as ProductStatus },
  { key: "bead", name: "Bead Board Detail", price: 175 },
  { key: "contemporary", name: "Contemporary Island", price: 1200 },
  { key: "contemporary-bead", name: "Contemporary Island with Bead Board", price: 1400 },
  { key: "luxury", name: "Luxury Island Trim", price: 1850 },
  { key: "luxury-bead", name: "Luxury Island Trim with Bead Board", price: 2050 },
  { key: "luxury-x", name: "Luxury Island Trim with X Detail", price: 2350 },
].map<Product>((x, i) => ({
  id: `isl-trim-${x.key}`,
  code: `ISL-TRM-${String(i).padStart(2, "0")}`,
  category: "islandTrim",
  room: "kitchen",
  name: x.name,
  manufacturer: CAB_MFR,
  finish: "Match Island",
  status: (x as { status?: ProductStatus }).status ?? "upgrade",
  included: (x as { status?: ProductStatus }).status === "included",
  price: x.price,
  tone: "light",
  swatch: cabSwatch("#efece5", "#c9c3b6"),
  effectiveDate: CATALOG_META.effectiveDate,
  active: true,
  imagePlaceholder: `island-trim-${x.key}.jpg`,
}));

const waterfallLevels: [number, number][] = [
  [1, 2100], [2, 2300], [3, 2500], [4, 2700], [5, 3300], [6, 3600],
];
const islandWaterfallProducts: Product[] = [
  {
    id: "isl-wf-none",
    code: "ISL-WF-00",
    category: "islandWaterfall",
    room: "kitchen",
    name: "No Waterfall",
    manufacturer: "Approved Stone Supplier",
    finish: "—",
    status: "included",
    included: true,
    price: 0,
    tone: "light",
    swatch: cabSwatch("#f2efe9", "#d6d2c8"),
    effectiveDate: CATALOG_META.effectiveDate,
    active: true,
    imagePlaceholder: "island-waterfall-none.jpg",
  },
  ...waterfallLevels.map<Product>(([lvl, price], i) => ({
    id: `isl-wf-l${lvl}`,
    code: `ISL-WF-L${lvl}`,
    category: "islandWaterfall",
    room: "kitchen",
    name: `Standard Waterfall — Level ${lvl}`,
    configuration: `Level ${lvl}`,
    manufacturer: "Approved Stone Supplier",
    finish: "Match Countertop",
    status: "upgrade",
    included: false,
    price,
    tone: ctPalette[i][2],
    swatch: cabSwatch(ctPalette[i][0], ctPalette[i][1]),
    requires: [{ category: "countertops", anyOf: countertopProducts.map((c) => c.id) }],
    builderNotes: "Waterfall level should match selected countertop level for a consistent seam.",
    effectiveDate: CATALOG_META.effectiveDate,
    active: true,
    imagePlaceholder: `island-waterfall-l${lvl}.jpg`,
  })),
];

const extIslandLevels: [number, number][] = [
  [1, 2400], [2, 2700], [3, 3100], [4, 3200], [5, 4200], [6, 4500],
];
const extendedIslandProducts: Product[] = [
  {
    id: "ext-isl-none",
    code: "EXT-ISL-00",
    category: "extendedIslandCountertop",
    room: "kitchen",
    name: "No Extended Island",
    manufacturer: "Approved Stone Supplier",
    finish: "—",
    status: "included",
    included: true,
    price: 0,
    tone: "light",
    swatch: cabSwatch("#f2efe9", "#d6d2c8"),
    layouts: ["alt1"],
    effectiveDate: CATALOG_META.effectiveDate,
    active: true,
    imagePlaceholder: "ext-island-none.jpg",
  },
  ...extIslandLevels.map<Product>(([lvl, price], i) => ({
    id: `ext-isl-l${lvl}`,
    code: `EXT-ISL-L${lvl}`,
    category: "extendedIslandCountertop",
    room: "kitchen",
    name: `Extended Island Waterfall — Level ${lvl}`,
    configuration: `Level ${lvl}`,
    manufacturer: "Approved Stone Supplier",
    finish: "Match Countertop",
    status: "upgrade",
    included: false,
    price,
    tone: ctPalette[i][2],
    swatch: cabSwatch(ctPalette[i][0], ctPalette[i][1]),
    layouts: ["alt1"],
    restrictions: "Available only in Alternate Kitchen 1 layout.",
    requires: [{ category: "countertops", anyOf: countertopProducts.map((c) => c.id) }],
    builderNotes: "Requires floor plan option for extended island. Confirm rough-in and clearance.",
    effectiveDate: CATALOG_META.effectiveDate,
    active: true,
    imagePlaceholder: `ext-island-l${lvl}.jpg`,
  })),
];

// Small placeholder categories with 2-3 illustrative options
type Simple = { key: string; name: string; price: number; status?: ProductStatus; swatch?: [string, string]; tone?: Tone; notes?: string; restrictions?: string };
function makeSimple(
  category: string,
  codePrefix: string,
  manufacturer: string,
  items: Simple[],
): Product[] {
  return items.map<Product>((x, i) => ({
    id: `${category}-${x.key}`,
    code: `${codePrefix}-${String(i + 1).padStart(3, "0")}`,
    category,
    room: "kitchen",
    name: x.name,
    manufacturer,
    finish: x.name,
    status: x.status ?? (i === 0 ? "included" : "upgrade"),
    included: (x.status ?? (i === 0 ? "included" : "upgrade")) === "included",
    price: x.price,
    tone: x.tone ?? "light",
    swatch: cabSwatch((x.swatch ?? ["#efece5", "#c9c3b6"])[0], (x.swatch ?? ["#efece5", "#c9c3b6"])[1]),
    builderNotes: x.notes,
    restrictions: x.restrictions,
    effectiveDate: CATALOG_META.effectiveDate,
    active: true,
    imagePlaceholder: `${category}-${x.key}.jpg`,
  }));
}

const backsplashProducts = makeSimple("backsplash", "BSP", "Daltile / Bedrosians", [
  { key: "subway", name: "Classic 3x6 Subway — White Gloss", price: 0, status: "included", swatch: ["#fafaf7", "#eeece6"] },
  { key: "herringbone", name: "Marble Herringbone", price: 950, swatch: ["#efece5", "#c8c3b8"] },
  { key: "picket", name: "Sage Picket", price: 1250, swatch: ["#a8b59a", "#6f8168"] },
  { key: "slate", name: "Slate Stack", price: 1600, tone: "dark", swatch: ["#3d403f", "#1a1c1c"] },
]);

const cooktopBspProducts = makeSimple("cooktopBacksplash", "CBS", "Bedrosians", [
  { key: "none", name: "None (matches primary backsplash)", price: 0, status: "included" },
  { key: "marble-mosaic", name: "Marble Mosaic Accent", price: 650, swatch: ["#f2efe9", "#c9c3b6"], notes: "Framed accent behind cooktop only." },
  { key: "chevron-metal", name: "Chevron Metal Accent", price: 850, swatch: ["#c9a45a", "#8a6a2b"] },
]);

const soapProducts = makeSimple("soapDispenser", "SOP", "Moen", [
  { key: "none", name: "No Soap Dispenser", price: 0, status: "included" },
  { key: "chrome", name: "Deck-Mount Chrome Soap Dispenser", price: 85 },
  { key: "matte-black", name: "Deck-Mount Matte Black Soap Dispenser", price: 105, tone: "dark", swatch: ["#2a2a2a", "#0a0a0a"] },
]);

const perimeterProducts = makeSimple("perimeterFinish", "PER", CAB_MFR, [
  { key: "match", name: "Perimeter Matches Base Cabinet", price: 0, status: "included" },
  { key: "two-tone-light", name: "Two-Tone — Light Perimeter", price: 950, swatch: ["#f2efe9", "#d6d2c8"] },
  { key: "two-tone-dark", name: "Two-Tone — Dark Perimeter", price: 1150, tone: "dark", swatch: ["#2a2e33", "#0d1013"] },
]);

const dishwasherProducts = makeSimple("dishwasher", "DW", "Whirlpool / KitchenAid", [
  { key: "wp-standard", name: "Whirlpool Standard Dishwasher — Stainless", price: 0, status: "included", swatch: ["#c6cbd0", "#7c8186"] },
  { key: "wp-quiet", name: "Whirlpool Quiet Series Dishwasher", price: 425, swatch: ["#c6cbd0", "#7c8186"] },
  { key: "ka-panel-ready", name: "KitchenAid Panel-Ready Dishwasher", price: 1450, swatch: ["#f7f5f0", "#e8e4dd"], notes: "Requires matching cabinet panel — coordinate with cabinet order." },
]);

const cooktopProducts = makeSimple("cooktop", "CKT", "Whirlpool / KitchenAid", [
  { key: "gas-30", name: '30" Gas Cooktop — Stainless', price: 0, status: "included", swatch: ["#c6cbd0", "#7c8186"], restrictions: "Requires gas rough-in." },
  { key: "induction-30", name: '30" Induction Cooktop', price: 1650, swatch: ["#2a2e33", "#0d1013"], tone: "dark" },
  { key: "gas-36", name: '36" Pro Gas Cooktop', price: 2200, swatch: ["#c6cbd0", "#7c8186"], notes: "Requires 36\" upper cabinet cutout above." },
]);

const rangeProducts = makeSimple("range", "RNG", "Whirlpool", [
  { key: "none", name: "None (cooktop + wall oven configuration)", price: 0, status: "included" },
  { key: "slide-in-gas", name: "Slide-In Gas Range — Stainless", price: 950 },
  { key: "dual-fuel", name: "Dual-Fuel Range", price: 2450 },
]);

const hoodProducts = makeSimple("hood", "HOD", "Broan / Zephyr", [
  { key: "otr", name: "Over-the-Range Microhood", price: 0, status: "included" },
  { key: "chimney-ss", name: "Stainless Chimney Hood", price: 1250 },
  { key: "custom-insert", name: "Custom Wood Hood with Liner", price: 3450, notes: "Requires custom-built cabinet surround." },
]);

const microwaveProducts = makeSimple("microwave", "MWV", "Whirlpool", [
  { key: "otr", name: "Over-the-Range Microwave — Stainless", price: 0, status: "included" },
  { key: "drawer", name: "Microwave Drawer in Island", price: 1650, notes: "Requires dedicated 20A circuit in island base." },
  { key: "built-in", name: "Built-In Microwave with Trim Kit", price: 1150 },
]);

const wallOvenProducts = makeSimple("wallOven", "WOV", "KitchenAid", [
  { key: "none", name: "None (range configuration)", price: 0, status: "included" },
  { key: "single-30", name: '30" Single Wall Oven', price: 1850 },
  { key: "double-30", name: '30" Double Wall Oven', price: 3450, notes: "Requires wall oven cabinet." },
]);

const fridgeProducts = makeSimple("refrigerator", "REF", "Whirlpool / KitchenAid", [
  { key: "wp-french", name: '36" French Door Refrigerator — Stainless', price: 0, status: "included" },
  { key: "counter-depth", name: 'Counter-Depth 36" French Door', price: 1650 },
  { key: "built-in-42", name: 'Built-In 42" Panel-Ready Refrigerator', price: 6850, notes: "Requires matching cabinet panels and enclosure." },
]);

// ---------- KITCHEN FLOORING (illustrative demo data)
const kitchenFlooringProducts: Product[] = [
  { id: "kfl-oak-natural", code: "KFL-001", category: "flooring", room: "kitchen", name: "Natural Oak Plank", configuration: '7" wide plank', manufacturer: "Shaw Floors", finish: "Matte", status: "included", included: true, price: 0, tone: "light", swatch: cabSwatch("#c9a877", "#8f6b3f"), effectiveDate: CATALOG_META.effectiveDate, active: true, imagePlaceholder: "flooring-oak-natural.jpg", builderNotes: "Included natural oak — illustrative demo finish." },
  { id: "kfl-oak-whitewash", code: "KFL-002", category: "flooring", room: "kitchen", name: "Whitewashed Oak", configuration: '7" wide plank', manufacturer: "Shaw Floors", finish: "Matte", status: "upgrade", included: false, price: 1450, tone: "light", swatch: cabSwatch("#e6dcc7", "#b8a988"), effectiveDate: CATALOG_META.effectiveDate, active: true, imagePlaceholder: "flooring-oak-white.jpg" },
  { id: "kfl-walnut", code: "KFL-003", category: "flooring", room: "kitchen", name: "Warm Walnut Plank", configuration: '9" wide plank', manufacturer: "Mohawk", finish: "Matte", status: "upgrade", included: false, price: 2650, tone: "dark", swatch: cabSwatch("#6b4a2a", "#3a2411"), effectiveDate: CATALOG_META.effectiveDate, active: true, imagePlaceholder: "flooring-walnut.jpg" },
  { id: "kfl-charcoal", code: "KFL-004", category: "flooring", room: "kitchen", name: "Charcoal Slate Plank", configuration: '7" wide plank', manufacturer: "Karndean", finish: "Textured", status: "optional", included: false, price: 3200, tone: "dark", swatch: cabSwatch("#3a3a3d", "#141416"), effectiveDate: CATALOG_META.effectiveDate, active: true, imagePlaceholder: "flooring-charcoal.jpg", builderNotes: "Optional dark plank — verify with community design guidelines." },
];

// ---------- BATHROOM (kept from prior demo, lightly tagged with new fields)

const bathroomProducts: Product[] = [
  { id: "van-white", code: "VAN-001", category: "vanity", room: "bathroom", name: "White Shaker Vanity", manufacturer: CAB_MFR, finish: "Pure White", status: "included", included: true, price: 0, tone: "light", swatch: cabSwatch("#f7f5f0", "#e8e4dd"), effectiveDate: CATALOG_META.effectiveDate, active: true },
  { id: "van-gray", code: "VAN-002", category: "vanity", room: "bathroom", name: "Harbor Gray Vanity", manufacturer: CAB_MFR, finish: "Harbor Gray", status: "upgrade", included: false, price: 1450, tone: "light", swatch: cabSwatch("#a8adb2", "#7d8388"), effectiveDate: CATALOG_META.effectiveDate, active: true },
  { id: "van-walnut", code: "VAN-003", category: "vanity", room: "bathroom", name: "Warm Walnut Vanity", manufacturer: "Wellborn Craft", finish: "Walnut", status: "upgrade", included: false, price: 2100, tone: "dark", swatch: cabSwatch("#7a5432", "#3f2916"), effectiveDate: CATALOG_META.effectiveDate, active: true },

  { id: "bct-quartz", code: "BCT-001", category: "countertop", room: "bathroom", name: "Carrara Quartz", manufacturer: "MSI", finish: "Polished", status: "included", included: true, price: 0, tone: "light", swatch: cabSwatch("#f2efe9", "#d6d2c8"), effectiveDate: CATALOG_META.effectiveDate, active: true },
  { id: "bct-cala", code: "BCT-002", category: "countertop", room: "bathroom", name: "Calacatta Gold Quartz", manufacturer: "Cambria", finish: "Polished", status: "upgrade", included: false, price: 1600, tone: "light", swatch: cabSwatch("#f6f3ea", "#c9a55b"), effectiveDate: CATALOG_META.effectiveDate, active: true },
  { id: "bct-soap", code: "BCT-003", category: "countertop", room: "bathroom", name: "Soapstone Black Quartz", manufacturer: "Silestone", finish: "Suede", status: "upgrade", included: false, price: 1900, tone: "dark", swatch: cabSwatch("#2a2c30", "#0e1013"), effectiveDate: CATALOG_META.effectiveDate, active: true },

  { id: "st-hex", code: "STL-001", category: "showerTile", room: "bathroom", name: "Marble Hexagon", manufacturer: "Bedrosians", finish: "Honed", status: "included", included: true, price: 0, tone: "light", swatch: cabSwatch("#efece5", "#c8c3b8"), effectiveDate: CATALOG_META.effectiveDate, active: true },
  { id: "st-subway", code: "STL-002", category: "showerTile", room: "bathroom", name: "Handmade Subway", manufacturer: "Fireclay Tile", finish: "Gloss", status: "upgrade", included: false, price: 780, tone: "light", swatch: cabSwatch("#fafaf7", "#eeece6"), effectiveDate: CATALOG_META.effectiveDate, active: true },
  { id: "st-slate", code: "STL-003", category: "showerTile", room: "bathroom", name: "Large-Format Slate", manufacturer: "Ann Sacks", finish: "Matte", status: "upgrade", included: false, price: 1450, tone: "dark", swatch: cabSwatch("#3d403f", "#1a1c1c"), effectiveDate: CATALOG_META.effectiveDate, active: true },

  { id: "ft-oak", code: "FTL-001", category: "floorTile", room: "bathroom", name: "Light Oak Plank Tile", manufacturer: "Daltile", finish: "Matte", status: "included", included: true, price: 0, tone: "light", swatch: cabSwatch("#d9c4a0", "#a68b62"), effectiveDate: CATALOG_META.effectiveDate, active: true },
  { id: "ft-terra", code: "FTL-002", category: "floorTile", room: "bathroom", name: "Warm Terracotta", manufacturer: "Cle Tile", finish: "Matte", status: "upgrade", included: false, price: 1200, tone: "dark", swatch: cabSwatch("#c26b48", "#7a3a22"), effectiveDate: CATALOG_META.effectiveDate, active: true },
  { id: "ft-marble", code: "FTL-003", category: "floorTile", room: "bathroom", name: "Carrara Marble", manufacturer: "Bedrosians", finish: "Honed", status: "upgrade", included: false, price: 1800, tone: "light", swatch: cabSwatch("#f2efe9", "#c8c3b8"), effectiveDate: CATALOG_META.effectiveDate, active: true },

  { id: "fx-chrome", code: "BFC-001", category: "faucets", room: "bathroom", name: "Polished Chrome", manufacturer: "Delta", finish: "Chrome", status: "included", included: true, price: 0, tone: "light", swatch: cabSwatch("#dfe3e7", "#9aa0a6"), effectiveDate: CATALOG_META.effectiveDate, active: true },
  { id: "fx-brass", code: "BFC-002", category: "faucets", room: "bathroom", name: "Champagne Brass", manufacturer: "Kohler", finish: "Brass", status: "upgrade", included: false, price: 420, tone: "light", swatch: cabSwatch("#c9a45a", "#8a6a2b"), effectiveDate: CATALOG_META.effectiveDate, active: true },
  { id: "fx-black", code: "BFC-003", category: "faucets", room: "bathroom", name: "Matte Black", manufacturer: "Kohler", finish: "Matte Black", status: "upgrade", included: false, price: 380, tone: "dark", swatch: cabSwatch("#2a2a2a", "#0a0a0a"), effectiveDate: CATALOG_META.effectiveDate, active: true },

  { id: "bwp-alabaster", code: "BWP-001", category: "wallPaint", room: "bathroom", name: "Alabaster", manufacturer: "Sherwin-Williams", finish: "Eggshell", status: "included", included: true, price: 0, tone: "light", swatch: "#efeadd", effectiveDate: CATALOG_META.effectiveDate, active: true },
  { id: "bwp-sea-salt", code: "BWP-002", category: "wallPaint", room: "bathroom", name: "Sea Salt", manufacturer: "Sherwin-Williams", finish: "Eggshell", status: "upgrade", included: false, price: 220, tone: "light", swatch: "#cfd8d1", effectiveDate: CATALOG_META.effectiveDate, active: true },
  { id: "bwp-iron-ore", code: "BWP-003", category: "wallPaint", room: "bathroom", name: "Iron Ore", manufacturer: "Sherwin-Williams", finish: "Eggshell", status: "upgrade", included: false, price: 340, tone: "dark", swatch: "#3d3d3b", effectiveDate: CATALOG_META.effectiveDate, active: true },
];

export const PRODUCTS: Product[] = [
  ...cabinetProducts,
  ...countertopProducts,
  ...kitchenFlooringProducts,

  ...sinkProducts,
  ...faucetProducts,
  ...backsplashProducts,
  ...cooktopBspProducts,
  ...soapProducts,
  ...islandFinishProducts,
  ...islandTrimProducts,
  ...islandWaterfallProducts,
  ...extendedIslandProducts,
  ...perimeterProducts,
  ...dishwasherProducts,
  ...cooktopProducts,
  ...rangeProducts,
  ...hoodProducts,
  ...microwaveProducts,
  ...wallOvenProducts,
  ...fridgeProducts,
  ...bathroomProducts,
];

// ---------- helpers ----------

export function productsFor(room: Room, category: string, layout: KitchenLayout = "standard") {
  return PRODUCTS.filter((p) => {
    if (p.room !== room || p.category !== category) return false;
    if (room === "kitchen" && p.layouts && !p.layouts.includes(layout)) return false;
    return true;
  });
}

export function productById(id: string | undefined) {
  if (!id) return undefined;
  return PRODUCTS.find((p) => p.id === id);
}

export function priceFor(p: Product, layout: KitchenLayout = "standard"): number {
  if (p.room === "kitchen" && p.priceByLayout?.[layout] !== undefined) return p.priceByLayout[layout]!;
  return p.price;
}

export function defaultSelections(room: Room, layout: KitchenLayout = "standard"): Record<string, string> {
  const cats = room === "kitchen" ? KITCHEN_CATEGORIES : BATHROOM_CATEGORIES;
  const out: Record<string, string> = {};
  for (const c of cats) {
    const inc = productsFor(room, c.id, layout).find((p) => p.included);
    if (inc) out[c.id] = inc.id;
  }
  return out;
}

export function totalFor(selections: Record<string, string>, layout: KitchenLayout = "standard") {
  return Object.values(selections).reduce((sum, id) => {
    const p = productById(id);
    return sum + (p ? priceFor(p, layout) : 0);
  }, 0);
}

export function dominantTone(room: Room, selections: Record<string, string>): Tone {
  const key = room === "kitchen" ? "cabinets" : "vanity";
  const p = productById(selections[key]);
  return p?.tone ?? "light";
}

export function formatMoney(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

/** Returns a list of dependency / compatibility issues for the current selections. */
export interface SelectionIssue {
  productId: string;
  category: string;
  message: string;
}

export function selectionIssues(
  selections: Record<string, string>,
  layout: KitchenLayout = "standard",
): SelectionIssue[] {
  const issues: SelectionIssue[] = [];
  for (const [cat, id] of Object.entries(selections)) {
    const p = productById(id);
    if (!p) continue;
    // layout availability
    if (p.layouts && !p.layouts.includes(layout)) {
      issues.push({
        productId: p.id,
        category: cat,
        message: `${p.name} is only available in ${p.layouts.map((l) => (l === "alt1" ? "Alternate Kitchen 1" : "Standard Kitchen")).join(", ")}.`,
      });
    }
    // excludes based on another category's product configuration
    if (p.excludesCategoryConfig) {
      for (const rule of p.excludesCategoryConfig) {
        const other = productById(selections[rule.category]);
        if (other?.configuration && rule.configurationIncludes.some((c) => other.configuration!.includes(c))) {
          issues.push({
            productId: p.id,
            category: cat,
            message: `${p.name} is not compatible with the selected ${rule.category} configuration (${other.configuration}).`,
          });
        }
      }
    }
    // requires
    if (p.requires) {
      for (const rule of p.requires) {
        const otherId = selections[rule.category];
        if (!otherId || !rule.anyOf.includes(otherId)) {
          issues.push({
            productId: p.id,
            category: cat,
            message: `${p.name} requires a compatible ${rule.category} selection.`,
          });
        }
      }
    }
  }
  return issues;
}

export function isProductCompatible(
  product: Product,
  selections: Record<string, string>,
  layout: KitchenLayout = "standard",
): { ok: boolean; reason?: string } {
  if (product.layouts && !product.layouts.includes(layout)) {
    return { ok: false, reason: `Available only in ${product.layouts.map((l) => (l === "alt1" ? "Alternate Kitchen 1" : "Standard Kitchen")).join(", ")}.` };
  }
  if (product.excludesCategoryConfig) {
    for (const rule of product.excludesCategoryConfig) {
      const other = productById(selections[rule.category]);
      if (other?.configuration && rule.configurationIncludes.some((c) => other.configuration!.includes(c))) {
        return { ok: false, reason: `Not compatible with current ${rule.category} configuration (${other.configuration}).` };
      }
    }
  }
  return { ok: true };
}

// Demonstration catalog for HomeVision Studio
export type Room = "kitchen" | "bathroom";
export type Tone = "light" | "dark";

export interface Product {
  id: string;
  category: string;
  room: Room;
  name: string;
  manufacturer: string;
  finish: string;
  included: boolean;
  price: number;
  tone: Tone;
  swatch: string; // css background
  description?: string;
}

export const BUILDERS = [
  { id: "true-homes", name: "True Homes Demo", tagline: "Demonstration builder" },
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

export const KITCHEN_CATEGORIES = [
  { id: "cabinets", label: "Cabinets" },
  { id: "countertops", label: "Countertops" },
  { id: "backsplash", label: "Backsplash" },
  { id: "flooring", label: "Flooring" },
  { id: "hardware", label: "Hardware" },
  { id: "wallPaint", label: "Wall Paint" },
] as const;

export const BATHROOM_CATEGORIES = [
  { id: "vanity", label: "Vanity" },
  { id: "countertop", label: "Countertop" },
  { id: "showerTile", label: "Shower Tile" },
  { id: "floorTile", label: "Floor Tile" },
  { id: "faucets", label: "Faucets" },
  { id: "wallPaint", label: "Wall Paint" },
] as const;

export const PRODUCTS: Product[] = [
  // ---- KITCHEN CABINETS
  { id: "cab-white", category: "cabinets", room: "kitchen", name: "White Shaker", manufacturer: "Timberline Cabinetry", finish: "Pure White", included: true, price: 0, tone: "light", swatch: "linear-gradient(135deg,#f7f5f0,#e8e4dd)" },
  { id: "cab-harbor", category: "cabinets", room: "kitchen", name: "Harbor Gray Shaker", manufacturer: "Timberline Cabinetry", finish: "Harbor Gray", included: false, price: 1850, tone: "light", swatch: "linear-gradient(135deg,#a8adb2,#7d8388)" },
  { id: "cab-oak", category: "cabinets", room: "kitchen", name: "Natural Oak", manufacturer: "Wellborn Craft", finish: "Natural Oak", included: false, price: 2650, tone: "light", swatch: "linear-gradient(135deg,#c69a6b,#8a5f3a)" },
  { id: "cab-midnight", category: "cabinets", room: "kitchen", name: "Midnight Blue", manufacturer: "Wellborn Craft", finish: "Midnight Blue", included: false, price: 3100, tone: "dark", swatch: "linear-gradient(135deg,#1e2942,#0f1626)" },

  // ---- COUNTERTOPS
  { id: "ct-luna", category: "countertops", room: "kitchen", name: "Luna Pearl Granite", manufacturer: "Stone Source", finish: "Polished", included: true, price: 0, tone: "light", swatch: "linear-gradient(135deg,#e6e3dc,#b8b3a8)" },
  { id: "ct-carrara", category: "countertops", room: "kitchen", name: "Carrara Quartz", manufacturer: "MSI Surfaces", finish: "Polished", included: false, price: 2400, tone: "light", swatch: "linear-gradient(135deg,#f2efe9,#d6d2c8)" },
  { id: "ct-calacatta", category: "countertops", room: "kitchen", name: "Calacatta Gold Quartz", manufacturer: "Cambria", finish: "Polished", included: false, price: 3800, tone: "light", swatch: "linear-gradient(135deg,#f6f3ea,#c9a55b)" },
  { id: "ct-soapstone", category: "countertops", room: "kitchen", name: "Soapstone Black Quartz", manufacturer: "Silestone", finish: "Suede", included: false, price: 3200, tone: "dark", swatch: "linear-gradient(135deg,#2a2c30,#0e1013)" },

  // ---- BACKSPLASH
  { id: "bs-subway", category: "backsplash", room: "kitchen", name: "Classic Subway", manufacturer: "Daltile", finish: "Gloss White", included: true, price: 0, tone: "light", swatch: "linear-gradient(90deg,#fafaf7 50%,#eeece6 50%)" },
  { id: "bs-herringbone", category: "backsplash", room: "kitchen", name: "Marble Herringbone", manufacturer: "Bedrosians", finish: "Honed", included: false, price: 950, tone: "light", swatch: "linear-gradient(135deg,#efece5,#c8c3b8)" },
  { id: "bs-picket", category: "backsplash", room: "kitchen", name: "Sage Picket", manufacturer: "Fireclay Tile", finish: "Matte", included: false, price: 1250, tone: "light", swatch: "linear-gradient(135deg,#a8b59a,#6f8168)" },
  { id: "bs-slate", category: "backsplash", room: "kitchen", name: "Slate Stack", manufacturer: "Ann Sacks", finish: "Natural", included: false, price: 1600, tone: "dark", swatch: "linear-gradient(135deg,#3d403f,#1a1c1c)" },

  // ---- KITCHEN FLOORING
  { id: "fl-oak", category: "flooring", room: "kitchen", name: "Natural Oak LVP", manufacturer: "Shaw Floors", finish: "Matte", included: true, price: 0, tone: "light", swatch: "linear-gradient(135deg,#c9a276,#8a6a44)" },
  { id: "fl-drift", category: "flooring", room: "kitchen", name: "Driftwood LVP", manufacturer: "Shaw Floors", finish: "Matte", included: false, price: 1600, tone: "light", swatch: "linear-gradient(135deg,#b8ada0,#7a6f62)" },
  { id: "fl-walnut", category: "flooring", room: "kitchen", name: "Warm Walnut Engineered", manufacturer: "Mohawk", finish: "Wire Brushed", included: false, price: 4800, tone: "dark", swatch: "linear-gradient(135deg,#6b4a2f,#3a2818)" },
  { id: "fl-white-oak", category: "flooring", room: "kitchen", name: "Coastal White Oak", manufacturer: "Mohawk", finish: "Wire Brushed", included: false, price: 5400, tone: "light", swatch: "linear-gradient(135deg,#d9c4a0,#a68b62)" },

  // ---- HARDWARE
  { id: "hw-nickel", category: "hardware", room: "kitchen", name: "Brushed Nickel Bar Pulls", manufacturer: "Top Knobs", finish: "Brushed Nickel", included: true, price: 0, tone: "light", swatch: "linear-gradient(135deg,#c9cdd1,#8f9498)" },
  { id: "hw-brass", category: "hardware", room: "kitchen", name: "Aged Brass Pulls", manufacturer: "Emtek", finish: "Aged Brass", included: false, price: 380, tone: "light", swatch: "linear-gradient(135deg,#c9a45a,#8a6a2b)" },
  { id: "hw-black", category: "hardware", room: "kitchen", name: "Matte Black Pulls", manufacturer: "Emtek", finish: "Matte Black", included: false, price: 320, tone: "dark", swatch: "linear-gradient(135deg,#2a2a2a,#0a0a0a)" },

  // ---- WALL PAINT (kitchen)
  { id: "wp-alabaster", category: "wallPaint", room: "kitchen", name: "Alabaster", manufacturer: "Sherwin-Williams", finish: "Eggshell", included: true, price: 0, tone: "light", swatch: "#efeadd" },
  { id: "wp-agreeable", category: "wallPaint", room: "kitchen", name: "Agreeable Gray", manufacturer: "Sherwin-Williams", finish: "Eggshell", included: false, price: 220, tone: "light", swatch: "#c8c2b6" },
  { id: "wp-urbane", category: "wallPaint", room: "kitchen", name: "Urbane Bronze", manufacturer: "Sherwin-Williams", finish: "Eggshell", included: false, price: 340, tone: "dark", swatch: "#4a4239" },

  // ---- BATHROOM VANITY
  { id: "van-white", category: "vanity", room: "bathroom", name: "White Shaker Vanity", manufacturer: "Timberline Cabinetry", finish: "Pure White", included: true, price: 0, tone: "light", swatch: "linear-gradient(135deg,#f7f5f0,#e8e4dd)" },
  { id: "van-gray", category: "vanity", room: "bathroom", name: "Harbor Gray Vanity", manufacturer: "Timberline Cabinetry", finish: "Harbor Gray", included: false, price: 1450, tone: "light", swatch: "linear-gradient(135deg,#a8adb2,#7d8388)" },
  { id: "van-walnut", category: "vanity", room: "bathroom", name: "Warm Walnut Vanity", manufacturer: "Wellborn Craft", finish: "Walnut", included: false, price: 2100, tone: "dark", swatch: "linear-gradient(135deg,#7a5432,#3f2916)" },

  // ---- BATHROOM COUNTERTOP
  { id: "bct-quartz", category: "countertop", room: "bathroom", name: "Carrara Quartz", manufacturer: "MSI Surfaces", finish: "Polished", included: true, price: 0, tone: "light", swatch: "linear-gradient(135deg,#f2efe9,#d6d2c8)" },
  { id: "bct-cala", category: "countertop", room: "bathroom", name: "Calacatta Gold Quartz", manufacturer: "Cambria", finish: "Polished", included: false, price: 1600, tone: "light", swatch: "linear-gradient(135deg,#f6f3ea,#c9a55b)" },
  { id: "bct-soap", category: "countertop", room: "bathroom", name: "Soapstone Black Quartz", manufacturer: "Silestone", finish: "Suede", included: false, price: 1900, tone: "dark", swatch: "linear-gradient(135deg,#2a2c30,#0e1013)" },

  // ---- SHOWER TILE
  { id: "st-hex", category: "showerTile", room: "bathroom", name: "Marble Hexagon", manufacturer: "Bedrosians", finish: "Honed", included: true, price: 0, tone: "light", swatch: "linear-gradient(135deg,#efece5,#c8c3b8)" },
  { id: "st-subway", category: "showerTile", room: "bathroom", name: "Handmade Subway", manufacturer: "Fireclay Tile", finish: "Gloss", included: false, price: 780, tone: "light", swatch: "linear-gradient(90deg,#fafaf7 50%,#eeece6 50%)" },
  { id: "st-slate", category: "showerTile", room: "bathroom", name: "Large-Format Slate", manufacturer: "Ann Sacks", finish: "Matte", included: false, price: 1450, tone: "dark", swatch: "linear-gradient(135deg,#3d403f,#1a1c1c)" },

  // ---- FLOOR TILE (bath)
  { id: "ft-oak", category: "floorTile", room: "bathroom", name: "Light Oak Plank Tile", manufacturer: "Daltile", finish: "Matte", included: true, price: 0, tone: "light", swatch: "linear-gradient(135deg,#d9c4a0,#a68b62)" },
  { id: "ft-terra", category: "floorTile", room: "bathroom", name: "Warm Terracotta", manufacturer: "Cle Tile", finish: "Matte", included: false, price: 1200, tone: "dark", swatch: "linear-gradient(135deg,#c26b48,#7a3a22)" },
  { id: "ft-marble", category: "floorTile", room: "bathroom", name: "Carrara Marble", manufacturer: "Bedrosians", finish: "Honed", included: false, price: 1800, tone: "light", swatch: "linear-gradient(135deg,#f2efe9,#c8c3b8)" },

  // ---- FAUCETS
  { id: "fx-chrome", category: "faucets", room: "bathroom", name: "Polished Chrome", manufacturer: "Delta", finish: "Chrome", included: true, price: 0, tone: "light", swatch: "linear-gradient(135deg,#dfe3e7,#9aa0a6)" },
  { id: "fx-brass", category: "faucets", room: "bathroom", name: "Champagne Brass", manufacturer: "Kohler", finish: "Brass", included: false, price: 420, tone: "light", swatch: "linear-gradient(135deg,#c9a45a,#8a6a2b)" },
  { id: "fx-black", category: "faucets", room: "bathroom", name: "Matte Black", manufacturer: "Kohler", finish: "Matte Black", included: false, price: 380, tone: "dark", swatch: "linear-gradient(135deg,#2a2a2a,#0a0a0a)" },

  // ---- WALL PAINT (bath)
  { id: "bwp-alabaster", category: "wallPaint", room: "bathroom", name: "Alabaster", manufacturer: "Sherwin-Williams", finish: "Eggshell", included: true, price: 0, tone: "light", swatch: "#efeadd" },
  { id: "bwp-sea-salt", category: "wallPaint", room: "bathroom", name: "Sea Salt", manufacturer: "Sherwin-Williams", finish: "Eggshell", included: false, price: 220, tone: "light", swatch: "#cfd8d1" },
  { id: "bwp-iron-ore", category: "wallPaint", room: "bathroom", name: "Iron Ore", manufacturer: "Sherwin-Williams", finish: "Eggshell", included: false, price: 340, tone: "dark", swatch: "#3d3d3b" },
];

export function productsFor(room: Room, category: string) {
  return PRODUCTS.filter((p) => p.room === room && p.category === category);
}

export function productById(id: string | undefined) {
  if (!id) return undefined;
  return PRODUCTS.find((p) => p.id === id);
}

export function defaultSelections(room: Room): Record<string, string> {
  const cats = room === "kitchen" ? KITCHEN_CATEGORIES : BATHROOM_CATEGORIES;
  const out: Record<string, string> = {};
  for (const c of cats) {
    const inc = PRODUCTS.find((p) => p.room === room && p.category === c.id && p.included);
    if (inc) out[c.id] = inc.id;
  }
  return out;
}

export function totalFor(selections: Record<string, string>) {
  return Object.values(selections).reduce((sum, id) => {
    const p = productById(id);
    return sum + (p?.price ?? 0);
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

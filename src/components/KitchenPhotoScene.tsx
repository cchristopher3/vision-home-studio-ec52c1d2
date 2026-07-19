// Curated full-scene kitchen preview.
//
// This component intentionally does NOT overlay masks, SVG shapes, colored
// rectangles, or blend modes on top of a base photograph. Instead it picks
// the closest curated photorealistic scene from three approved variants and
// crossfades between them when selections change. Pricing, product names,
// codes, dependencies, and totals continue to come from the exact catalog —
// the preview only approximates the visual outcome.

import { useEffect, useState } from "react";
import { Eye } from "lucide-react";
import sceneA from "@/assets/kitchen-scene-A.jpg";
import sceneB from "@/assets/kitchen-scene-B.jpg";
import sceneC from "@/assets/kitchen-scene-C.jpg";

type SceneKey = "A" | "B" | "C";

const SCENES: Record<SceneKey, { src: string; label: string }> = {
  A: { src: sceneA, label: "Light cabinets · white quartz" },
  B: { src: sceneB, label: "Navy cabinets · dramatic marble" },
  C: { src: sceneC, label: "Natural wood · warm stone" },
};

type Family = "light" | "dark" | "warm";

function cabinetFamily(id: string | undefined): Family {
  if (!id) return "light";
  const key = id.replace(/^cab-/, "").replace(/-(30|36|42)$/, "");
  if (["shay", "skylar", "felix"].includes(key)) return "dark";
  if (["galveston", "galveston5"].includes(key)) return "warm";
  return "light";
}

function perimeterCounterFamily(id: string | undefined): Family {
  if (id === "ct-l6") return "dark"; // dramatic dark/marble family
  if (id === "ct-l4") return "warm"; // warm granite family
  return "light";
}

function islandCounterFamily(id: string | undefined): Family {
  if (!id || id === "isl-ct-match") return "light";
  if (id === "isl-ct-l6") return "dark";
  if (id === "isl-ct-l4") return "warm";
  return "light";
}

interface Props {
  selections: Record<string, string>;
  /** Kept for backwards compatibility with the previous overlay renderer. */
  perimeterVisualFinishId?: string;
  islandVisualFinishId?: string;
  /** When true, always show scene A (untouched curated base). */
  before?: boolean;
  debug?: boolean;
  debugVisible?: Partial<Record<string, boolean>>;
}

/** Kept as a stable export so legacy imports resolve; no consumer uses it. */
export const REGIONS: { id: string; label: string; debugColor: string }[] = [];

export function pickScene(selections: Record<string, string>): {
  scene: SceneKey;
  exact: boolean;
} {
  const cab = cabinetFamily(selections.cabinets);
  const perim = perimeterCounterFamily(selections.countertops);
  const island = islandCounterFamily(selections.islandCounter);

  // Dark/navy/charcoal cabinets or dramatic dark perimeter marble → B.
  if (cab === "dark" || perim === "dark") {
    const exact = cab === "dark" && perim !== "warm" && island !== "warm";
    return { scene: "B", exact };
  }
  // Natural/warm wood cabinets, warm granite, or a contrasting dark island → C.
  if (cab === "warm" || perim === "warm" || island === "dark" || island === "warm") {
    const exact = cab === "warm" && perim === "warm";
    return { scene: "C", exact };
  }
  // Default: light everywhere → A (exact match).
  return { scene: "A", exact: true };
}

export function KitchenPhotoScene({ selections, before }: Props) {
  const { scene, exact } = pickScene(selections);
  const target: SceneKey = before ? "A" : scene;

  // Manage a two-layer crossfade so the outgoing image stays mounted for
  // 200ms while the new image fades in on top of it. `previous` renders
  // underneath at full opacity; `current` starts at 0 and animates to 1,
  // producing a real crossfade in both directions (including toggling
  // Before ↔ Selections when they resolve to different scenes).
  const [current, setCurrent] = useState<SceneKey>(target);
  const [previous, setPrevious] = useState<SceneKey | null>(null);
  const [fadedIn, setFadedIn] = useState(true);

  useEffect(() => {
    if (target === current) return;
    setPrevious(current);
    setCurrent(target);
    setFadedIn(false);
    // Kick the opacity transition on the next frame so the browser records
    // the initial 0 opacity before animating to 1.
    const raf = requestAnimationFrame(() => setFadedIn(true));
    const t = setTimeout(() => setPrevious(null), 260);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t);
    };
  }, [target, current]);

  const [failed, setFailed] = useState(false);

  return (
    <div
      className="relative w-full"
      style={{ aspectRatio: "1600 / 912", isolation: "isolate" }}
      data-scene={current}
      data-before={before ? "true" : "false"}
    >
      {previous && (
        <img
          key={`prev-${previous}`}
          src={SCENES[previous].src}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
      <img
        key={`cur-${current}`}
        src={SCENES[current].src}
        alt={`Curated kitchen preview — ${SCENES[current].label}`}
        className="absolute inset-0 h-full w-full object-cover transition-opacity duration-200 ease-out"
        style={{ opacity: failed ? 0 : fadedIn ? 1 : 0 }}
        onError={() => setFailed(true)}
      />

      {failed && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted text-sm text-muted-foreground">
          Preview unavailable
        </div>
      )}

      {!failed && !before && !exact && (
        <div className="pointer-events-none absolute inset-x-3 bottom-3 flex flex-col items-start gap-1">
          <span className="rounded-full bg-background/90 px-3 py-1 text-[10px] text-muted-foreground backdrop-blur">
            Closest available visual — selections and pricing remain exact.
          </span>
        </div>
      )}
    </div>
  );
}

// Marker export so the toggle UI in RoomPreview can render the correct icon
// without importing lucide twice.
export { Eye as PreviewToggleIcon };

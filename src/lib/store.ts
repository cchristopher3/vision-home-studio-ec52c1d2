import { create } from "zustand";
import { persist } from "zustand/middleware";
import { BATHROOM_CATEGORIES, KITCHEN_CATEGORIES, defaultSelections, type KitchenLayout, type Room } from "./catalog";
import { DEFAULT_ISLAND_FINISH_ID, DEFAULT_PERIMETER_FINISH_ID } from "./stoneTextures";



export type SelectionFilter = "all" | "included" | "upgrade" | "optional";

export interface SavedDesign {
  id: string;
  name: string;
  room: Room;
  kitchenLayout: KitchenLayout;
  builderId: string;
  communityId: string;
  floorPlanId: string;
  selections: Record<string, string>;
  createdAt: number;
}

interface StudioState {
  builderId: string;
  communityId: string;
  floorPlanId: string;
  room: Room;
  kitchenLayout: KitchenLayout;
  selections: Record<string, string>;
  perimeterVisualFinishId: string;
  islandVisualFinishId: string;
  savedDesigns: SavedDesign[];
  compareIds: [string | null, string | null];
  activeCategory: string | null;
  searchQuery: string;
  statusFilter: SelectionFilter;
  setSetup: (v: { builderId: string; communityId: string; floorPlanId: string; room: Room }) => void;
  setRoom: (room: Room) => void;
  setKitchenLayout: (layout: KitchenLayout) => void;
  selectProduct: (category: string, productId: string) => void;
  setVisualFinish: (which: "perimeter" | "island", id: string) => void;
  resetSelections: () => void;
  saveDesign: (name: string) => SavedDesign;
  deleteDesign: (id: string) => void;
  setCompare: (a: string | null, b: string | null) => void;
  setActiveCategory: (id: string | null) => void;
  setSearchQuery: (q: string) => void;
  setStatusFilter: (f: SelectionFilter) => void;
}


export const useStudio = create<StudioState>()(
  persist(
    (set, get) => ({
      builderId: "true-homes",
      communityId: "calebs-creek",
      floorPlanId: "riley",
      room: "kitchen",
      kitchenLayout: "standard",
      selections: defaultSelections("kitchen", "standard"),
      perimeterVisualFinishId: DEFAULT_PERIMETER_FINISH_ID,
      islandVisualFinishId: DEFAULT_ISLAND_FINISH_ID,
      savedDesigns: [],
      compareIds: [null, null],
      activeCategory: null,
      searchQuery: "",
      statusFilter: "all",
      setSetup: (v) => set({ ...v, selections: defaultSelections(v.room, get().kitchenLayout) }),
      setRoom: (room) => set({ room, selections: defaultSelections(room, get().kitchenLayout), activeCategory: null }),
      setKitchenLayout: (layout) =>
        set((s) => ({
          kitchenLayout: layout,
          selections: s.room === "kitchen" ? defaultSelections("kitchen", layout) : s.selections,
        })),
      selectProduct: (category, productId) =>
        set((s) => ({ selections: { ...s.selections, [category]: productId } })),
      setVisualFinish: (which, id) =>
        set(() => (which === "perimeter" ? { perimeterVisualFinishId: id } : { islandVisualFinishId: id })),

      resetSelections: () => set((s) => ({ selections: defaultSelections(s.room, s.kitchenLayout) })),
      saveDesign: (name) => {
        const s = get();
        const design: SavedDesign = {
          id: `d-${Date.now()}`,
          name: name || `Design ${s.savedDesigns.length + 1}`,
          room: s.room,
          kitchenLayout: s.kitchenLayout,
          builderId: s.builderId,
          communityId: s.communityId,
          floorPlanId: s.floorPlanId,
          selections: { ...s.selections },
          createdAt: Date.now(),
        };
        set({ savedDesigns: [design, ...s.savedDesigns] });
        return design;
      },
      deleteDesign: (id) => set((s) => ({
        savedDesigns: s.savedDesigns.filter((d) => d.id !== id),
        compareIds: [s.compareIds[0] === id ? null : s.compareIds[0], s.compareIds[1] === id ? null : s.compareIds[1]],
      })),
      setCompare: (a, b) => set({ compareIds: [a, b] }),
      setActiveCategory: (id) => set({ activeCategory: id }),
      setSearchQuery: (q) => set({ searchQuery: q }),
      setStatusFilter: (f) => set({ statusFilter: f }),
    }),
    {
      name: "homevision-studio-v3",
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        // Reconcile persisted selections against the current catalog so every
        // known category always has a valid selection (defaults to included).
        const validCategoryIds = new Set(
          [...KITCHEN_CATEGORIES, ...BATHROOM_CATEGORIES].map((c) => c.id),
        );
        const cleaned: Record<string, string> = {};
        for (const [k, v] of Object.entries(state.selections ?? {})) {
          if (validCategoryIds.has(k)) cleaned[k] = v;
        }
        const kDefaults = defaultSelections("kitchen", state.kitchenLayout);
        const bDefaults = defaultSelections("bathroom");
        state.selections = { ...kDefaults, ...bDefaults, ...cleaned };
      },
    }

  )
);

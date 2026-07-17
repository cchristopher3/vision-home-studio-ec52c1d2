import { create } from "zustand";
import { persist } from "zustand/middleware";
import { defaultSelections, type Room } from "./catalog";

export interface SavedDesign {
  id: string;
  name: string;
  room: Room;
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
  selections: Record<string, string>;
  savedDesigns: SavedDesign[];
  compareIds: [string | null, string | null];
  setSetup: (v: { builderId: string; communityId: string; floorPlanId: string; room: Room }) => void;
  setRoom: (room: Room) => void;
  selectProduct: (category: string, productId: string) => void;
  resetSelections: () => void;
  saveDesign: (name: string) => SavedDesign;
  deleteDesign: (id: string) => void;
  setCompare: (a: string | null, b: string | null) => void;
}

export const useStudio = create<StudioState>()(
  persist(
    (set, get) => ({
      builderId: "true-homes",
      communityId: "calebs-creek",
      floorPlanId: "riley",
      room: "kitchen",
      selections: defaultSelections("kitchen"),
      savedDesigns: [],
      compareIds: [null, null],
      setSetup: (v) => set({ ...v, selections: defaultSelections(v.room) }),
      setRoom: (room) => set({ room, selections: defaultSelections(room) }),
      selectProduct: (category, productId) =>
        set((s) => ({ selections: { ...s.selections, [category]: productId } })),
      resetSelections: () => set((s) => ({ selections: defaultSelections(s.room) })),
      saveDesign: (name) => {
        const s = get();
        const design: SavedDesign = {
          id: `d-${Date.now()}`,
          name: name || `Design ${s.savedDesigns.length + 1}`,
          room: s.room,
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
    }),
    { name: "homevision-studio-v1" }
  )
);

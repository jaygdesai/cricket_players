import { create } from 'zustand';
import { persist } from 'zustand/middleware';
// Types only used in interface definition below

interface CollectionState {
  ownedCardIds: string[];
  dreamXI: string[];
  addCard: (cardId: string) => void;
  addCards: (cardIds: string[]) => void;
  removeCard: (cardId: string) => void;
  hasCard: (cardId: string) => boolean;
  setDreamXI: (cardIds: string[]) => void;
  addToDreamXI: (cardId: string) => boolean;
  removeFromDreamXI: (cardId: string) => void;
  getCollectionCount: () => number;
}

export const useCollectionStore = create<CollectionState>()(
  persist(
    (set, get) => ({
      ownedCardIds: [],
      dreamXI: [],

      addCard: (cardId) => set((s) => ({
        ownedCardIds: s.ownedCardIds.includes(cardId) ? s.ownedCardIds : [...s.ownedCardIds, cardId],
      })),

      addCards: (cardIds) => set((s) => {
        const newIds = cardIds.filter(id => !s.ownedCardIds.includes(id));
        return { ownedCardIds: [...s.ownedCardIds, ...newIds] };
      }),

      removeCard: (cardId) => set((s) => ({
        ownedCardIds: s.ownedCardIds.filter(id => id !== cardId),
        dreamXI: s.dreamXI.filter(id => id !== cardId),
      })),

      hasCard: (cardId) => get().ownedCardIds.includes(cardId),

      setDreamXI: (cardIds) => set({ dreamXI: cardIds }),

      addToDreamXI: (cardId) => {
        const { dreamXI } = get();
        if (dreamXI.length >= 11 || dreamXI.includes(cardId)) return false;
        set({ dreamXI: [...dreamXI, cardId] });
        return true;
      },

      removeFromDreamXI: (cardId) => set((s) => ({
        dreamXI: s.dreamXI.filter(id => id !== cardId),
      })),

      getCollectionCount: () => get().ownedCardIds.length,
    }),
    { name: 'cricket-collection-store' }
  )
);

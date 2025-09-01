import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { FavoriteTool } from '@/types/ai-tool';

interface FavoritesStore {
  favorites: FavoriteTool[];
  addFavorite: (toolId: string) => void;
  removeFavorite: (toolId: string) => void;
  isFavorite: (toolId: string) => boolean;
  getFavoriteTools: () => string[];
  clearFavorites: () => void;
}

export const useFavoritesStore = create<FavoritesStore>()(
  persist(
    (set, get) => ({
      favorites: [],
      
      addFavorite: (toolId: string) => {
        set((state) => {
          if (state.favorites.some(fav => fav.toolId === toolId)) {
            return state;
          }
          return {
            favorites: [
              ...state.favorites,
              {
                toolId,
                addedAt: new Date().toISOString(),
              },
            ],
          };
        });
      },
      
      removeFavorite: (toolId: string) => {
        set((state) => ({
          favorites: state.favorites.filter((fav) => fav.toolId !== toolId),
        }));
      },
      
      isFavorite: (toolId: string) => {
        return get().favorites.some((fav) => fav.toolId === toolId);
      },
      
      getFavoriteTools: () => {
        return get().favorites.map((fav) => fav.toolId);
      },
      
      clearFavorites: () => {
        set({ favorites: [] });
      },
    }),
    {
      name: 'favorites-storage',
    }
  )
);
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MenuItem} from "@/models/menu_card/MenuCard-model";

interface MenuStore {
  menus: MenuItem[];
  filteredMenus: MenuItem[];
  searchQuery: string;
  loading: boolean;
  error: string | null;
  fetchMenus: () => Promise<void>;
  setSearchQuery: (query: string) => void;
  addMenu: (menu: MenuItem) => void;
  updateMenu: (id: string, updatedMenu: Partial<MenuItem>) => void;
  deleteMenu: (id: string) => void;
}

export const useMenuStore = create<MenuStore>()(
  persist(
    (set, get) => ({
      menus: [],
      filteredMenus: [],
      searchQuery: '',
      loading: false,
      error: null,
      
      fetchMenus: async () => {
        set({ loading: true, error: null });
        try {
          const res = await fetch("/api/get/menu-list");
          if (!res.ok) throw new Error("Failed to fetch menu list");
          const data = await res.json();
          set({ menus: data, filteredMenus: data });
        } catch (err: unknown) {
          set({ error: err instanceof Error ? err.message : "Unknown error" });
        } finally {
          set({ loading: false });
        }
      },
      
      setSearchQuery: (query) => {
        const filtered = get().menus.filter(menu =>
          menu.menu_name?.toLowerCase().includes(query.toLowerCase())
        );
        set({ searchQuery: query, filteredMenus: filtered });
      },
      
      addMenu: (menu) => {
        set((state) => ({
          menus: [...state.menus, menu],
          filteredMenus: [...state.filteredMenus, menu]
        }));
      },
      
      updateMenu: (id, updatedMenu) => {
        set((state) => {
          const updatedMenus = state.menus.map(menu => 
            menu.menu_id === id ? { ...menu, ...updatedMenu } : menu
          );
          return {
            menus: updatedMenus,
            filteredMenus: updatedMenus.filter(menu =>
              menu.menu_name?.toLowerCase().includes(state.searchQuery.toLowerCase())
            )
          };
        });
      },
      
      deleteMenu: (id) => {
        set((state) => {
          const updatedMenus = state.menus.filter(menu => menu.menu_id !== id);
          return {
            menus: updatedMenus,
            filteredMenus: updatedMenus.filter(menu =>
              menu.menu_name?.toLowerCase().includes(state.searchQuery.toLowerCase())
            )
          };
        });
      }
    }),
    {
      name: 'menu-storage',
    }
  )
);


// import { create } from 'zustand';

// interface CounterStore {
//   count: number;
//   increment: () => void;
//   decrement: () => void;
// }

// export const useCounterStore = create<CounterStore>((set) => ({
//   count: 0,
//   increment: () => set((state) => ({ count: state.count + 1 })),
//   decrement: () => set((state) => ({ count: state.count - 1 })),
// }));
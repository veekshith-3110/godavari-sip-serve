import { createContext, useContext, ReactNode } from 'react';
import { useMenuItems, MenuItem, MenuCategory } from '@/hooks/useMenuItems';

interface MenuContextType {
  menuItems: MenuItem[];
  loading: boolean;
  isOffline: boolean;
  addMenuItem: (item: Omit<MenuItem, 'id'>) => Promise<MenuItem | null>;
  updateMenuItem: (item: MenuItem) => Promise<void>;
  toggleAvailability: (itemId: string) => Promise<void>;
  deleteMenuItem: (itemId: string) => Promise<void>;
}

const MenuContext = createContext<MenuContextType | undefined>(undefined);

export const MenuProvider = ({ children }: { children: ReactNode }) => {
  const {
    menuItems,
    loading,
    isOffline,
    addMenuItem,
    updateMenuItem,
    toggleAvailability,
    deleteMenuItem,
  } = useMenuItems();

  return (
    <MenuContext.Provider
      value={{
        menuItems,
        loading,
        isOffline,
        addMenuItem,
        updateMenuItem,
        toggleAvailability,
        deleteMenuItem,
      }}
    >
      {children}
    </MenuContext.Provider>
  );
};

export const useMenu = () => {
  const context = useContext(MenuContext);
  if (!context) {
    throw new Error('useMenu must be used within a MenuProvider');
  }
  return context;
};

export type { MenuItem, MenuCategory };

import { createContext, useContext, useState, ReactNode } from 'react';
import { menuItems as initialMenuItems, MenuItem } from '@/data/mockData';

interface MenuContextType {
  menuItems: MenuItem[];
  addMenuItem: (item: MenuItem) => void;
  updateMenuItem: (item: MenuItem) => void;
  toggleAvailability: (itemId: string) => void;
}

const MenuContext = createContext<MenuContextType | undefined>(undefined);

export const MenuProvider = ({ children }: { children: ReactNode }) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(initialMenuItems);

  const addMenuItem = (item: MenuItem) => {
    setMenuItems(prev => [...prev, { ...item, id: Date.now().toString() }]);
  };

  const updateMenuItem = (item: MenuItem) => {
    setMenuItems(prev => prev.map(i => i.id === item.id ? item : i));
  };

  const toggleAvailability = (itemId: string) => {
    setMenuItems(prev => prev.map(item =>
      item.id === itemId ? { ...item, available: !item.available } : item
    ));
  };

  return (
    <MenuContext.Provider value={{ menuItems, addMenuItem, updateMenuItem, toggleAvailability }}>
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

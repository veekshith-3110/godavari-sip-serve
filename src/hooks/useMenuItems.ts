import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type MenuCategory = 'hot' | 'snacks' | 'cold' | 'smoke';

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: MenuCategory;
  image: string;
  available: boolean;
  buttonColor?: string;
}

const MENU_CACHE_KEY = 'godavari_menu_cache';
const CACHE_TIMESTAMP_KEY = 'godavari_menu_cache_time';

// Helper to save menu to localStorage
const cacheMenuItems = (items: MenuItem[]) => {
  try {
    localStorage.setItem(MENU_CACHE_KEY, JSON.stringify(items));
    localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
  } catch (e) {
    console.warn('Failed to cache menu items:', e);
  }
};

// Helper to load menu from localStorage
const loadCachedMenuItems = (): MenuItem[] | null => {
  try {
    const cached = localStorage.getItem(MENU_CACHE_KEY);
    if (cached) {
      return JSON.parse(cached) as MenuItem[];
    }
  } catch (e) {
    console.warn('Failed to load cached menu:', e);
  }
  return null;
};

export const useMenuItems = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const { toast } = useToast();

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      fetchMenuItems(); // Refresh when back online
    };
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const fetchMenuItems = async () => {
    // Try to load from cache first (for instant display)
    const cachedItems = loadCachedMenuItems();
    if (cachedItems && cachedItems.length > 0) {
      setMenuItems(cachedItems);
      setLoading(false);
    }

    // If offline, use cache only
    if (!navigator.onLine) {
      if (!cachedItems || cachedItems.length === 0) {
        toast({
          title: 'Offline',
          description: 'No cached menu available. Connect to internet.',
          variant: 'destructive',
        });
      }
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;

      const items: MenuItem[] = (data || []).map((item) => ({
        id: item.id,
        name: item.name,
        price: Number(item.price),
        category: item.category as MenuCategory,
        image: item.image || '/placeholder.svg',
        available: item.available,
        buttonColor: item.button_color || undefined,
      }));

      setMenuItems(items);
      cacheMenuItems(items); // Save to cache for offline use
    } catch (error) {
      console.error('Error fetching menu items:', error);
      // Only show error if no cached data available
      if (!cachedItems || cachedItems.length === 0) {
        toast({
          title: 'Error',
          description: 'Failed to load menu items',
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const addMenuItem = async (item: Omit<MenuItem, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .insert({
          name: item.name,
          price: item.price,
          category: item.category,
          image: item.image,
          available: item.available,
          button_color: item.buttonColor,
        })
        .select()
        .single();

      if (error) throw error;

      const newItem: MenuItem = {
        id: data.id,
        name: data.name,
        price: Number(data.price),
        category: data.category as MenuCategory,
        image: data.image || '/placeholder.svg',
        available: data.available,
        buttonColor: data.button_color || undefined,
      };

      setMenuItems((prev) => [...prev, newItem]);
      toast({ title: 'Success', description: 'Menu item added' });
      return newItem;
    } catch (error) {
      console.error('Error adding menu item:', error);
      toast({
        title: 'Error',
        description: 'Failed to add menu item',
        variant: 'destructive',
      });
      return null;
    }
  };

  const updateMenuItem = async (item: MenuItem) => {
    try {
      const { error } = await supabase
        .from('menu_items')
        .update({
          name: item.name,
          price: item.price,
          category: item.category,
          image: item.image,
          available: item.available,
          button_color: item.buttonColor,
        })
        .eq('id', item.id);

      if (error) throw error;

      setMenuItems((prev) => prev.map((i) => (i.id === item.id ? item : i)));
      toast({ title: 'Success', description: 'Menu item updated' });
    } catch (error) {
      console.error('Error updating menu item:', error);
      toast({
        title: 'Error',
        description: 'Failed to update menu item',
        variant: 'destructive',
      });
    }
  };

  const toggleAvailability = async (itemId: string) => {
    const item = menuItems.find((i) => i.id === itemId);
    if (!item) return;

    try {
      const { error } = await supabase
        .from('menu_items')
        .update({ available: !item.available })
        .eq('id', itemId);

      if (error) throw error;

      setMenuItems((prev) =>
        prev.map((i) => (i.id === itemId ? { ...i, available: !i.available } : i))
      );
    } catch (error) {
      console.error('Error toggling availability:', error);
      toast({
        title: 'Error',
        description: 'Failed to update availability',
        variant: 'destructive',
      });
    }
  };

  const deleteMenuItem = async (itemId: string) => {
    try {
      const { error } = await supabase.from('menu_items').delete().eq('id', itemId);

      if (error) throw error;

      setMenuItems((prev) => prev.filter((i) => i.id !== itemId));
      toast({ title: 'Success', description: 'Menu item deleted' });
    } catch (error) {
      console.error('Error deleting menu item:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete menu item',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    fetchMenuItems();
  }, []);

  return {
    menuItems,
    loading,
    isOffline,
    addMenuItem,
    updateMenuItem,
    toggleAvailability,
    deleteMenuItem,
    refetch: fetchMenuItems,
  };
};

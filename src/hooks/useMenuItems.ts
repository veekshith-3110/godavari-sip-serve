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

  // Listen for online/offline events and app reconnection
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      fetchMenuItems(); // Refresh when back online
    };
    const handleOffline = () => setIsOffline(true);
    const handleReconnected = () => {
      setIsOffline(false);
      fetchMenuItems(); // Refresh data when app reconnects
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('app-reconnected', handleReconnected);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('app-reconnected', handleReconnected);
    };
  }, []);

  const fetchMenuItems = async () => {
    // Try to load from cache first (for instant display)
    const cachedItems = loadCachedMenuItems();
    if (cachedItems && cachedItems.length > 0) {
      setMenuItems(cachedItems);
      setLoading(false);
    }

    // If offline, use cache only (no error toast - overlay handles it)
    if (!navigator.onLine) {
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
      // Don't show scary error toasts - the NoInternetOverlay handles offline state
    } finally {
      setLoading(false);
    }
  };

  const addMenuItem = async (item: Omit<MenuItem, 'id'>) => {
    // Check network
    if (!navigator.onLine) {
      toast({
        title: 'No Internet',
        description: 'Please connect to add menu items',
        variant: 'destructive',
      });
      return null;
    }

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
      toast({ title: 'Item Added', description: newItem.name });
      return newItem;
    } catch (error) {
      console.error('Error adding menu item:', error);
      toast({
        title: 'Failed to Add',
        description: 'Please try again',
        variant: 'destructive',
      });
      return null;
    }
  };

  const updateMenuItem = async (item: MenuItem) => {
    // Check network
    if (!navigator.onLine) {
      toast({
        title: 'No Internet',
        description: 'Please connect to update menu items',
        variant: 'destructive',
      });
      return;
    }

    // Optimistic update
    const originalItems = [...menuItems];
    setMenuItems((prev) => prev.map((i) => (i.id === item.id ? item : i)));

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

      toast({ title: 'Updated', description: item.name });
    } catch (error) {
      // Rollback
      setMenuItems(originalItems);
      console.error('Error updating menu item:', error);
      toast({
        title: 'Update Failed',
        description: 'Please try again',
        variant: 'destructive',
      });
    }
  };

  const toggleAvailability = async (itemId: string) => {
    const item = menuItems.find((i) => i.id === itemId);
    if (!item) return;

    // Check network
    if (!navigator.onLine) {
      toast({
        title: 'No Internet',
        description: 'Please connect to update availability',
        variant: 'destructive',
      });
      return;
    }

    // Optimistic update
    setMenuItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, available: !i.available } : i))
    );

    try {
      const { error } = await supabase
        .from('menu_items')
        .update({ available: !item.available })
        .eq('id', itemId);

      if (error) throw error;
    } catch (error) {
      // Rollback
      setMenuItems((prev) =>
        prev.map((i) => (i.id === itemId ? { ...i, available: item.available } : i))
      );
      console.error('Error toggling availability:', error);
      toast({
        title: 'Update Failed',
        description: 'Please try again',
        variant: 'destructive',
      });
    }
  };

  const deleteMenuItem = async (itemId: string) => {
    // Check network
    if (!navigator.onLine) {
      toast({
        title: 'No Internet',
        description: 'Please connect to delete items',
        variant: 'destructive',
      });
      return;
    }

    // Store for rollback
    const itemToDelete = menuItems.find((i) => i.id === itemId);
    
    // Optimistic delete
    setMenuItems((prev) => prev.filter((i) => i.id !== itemId));

    try {
      const { error } = await supabase.from('menu_items').delete().eq('id', itemId);

      if (error) throw error;

      toast({ title: 'Deleted', description: 'Menu item removed' });
    } catch (error) {
      // Rollback
      if (itemToDelete) {
        setMenuItems((prev) => [...prev, itemToDelete]);
      }
      console.error('Error deleting menu item:', error);
      toast({
        title: 'Delete Failed',
        description: 'Please try again',
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

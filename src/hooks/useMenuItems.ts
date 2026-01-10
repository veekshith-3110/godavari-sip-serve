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

export const useMenuItems = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchMenuItems = async () => {
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
    } catch (error) {
      console.error('Error fetching menu items:', error);
      toast({
        title: 'Error',
        description: 'Failed to load menu items',
        variant: 'destructive',
      });
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
    addMenuItem,
    updateMenuItem,
    toggleAvailability,
    deleteMenuItem,
    refetch: fetchMenuItems,
  };
};

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { MenuItem } from './useMenuItems';

export interface CartItem extends MenuItem {
  quantity: number;
}

export interface Order {
  id: string;
  tokenNumber: number;
  items: CartItem[];
  total: number;
  createdAt: Date;
}

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [nextTokenNumber, setNextTokenNumber] = useState(1);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchOrders = async () => {
    try {
      // Fetch orders with their items
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      const { data: orderItemsData, error: itemsError } = await supabase
        .from('order_items')
        .select('*');

      if (itemsError) throw itemsError;

      const ordersWithItems: Order[] = (ordersData || []).map((order) => {
        const items = (orderItemsData || [])
          .filter((item) => item.order_id === order.id)
          .map((item) => ({
            id: item.menu_item_id,
            name: item.item_name,
            price: Number(item.item_price),
            quantity: item.quantity,
            category: 'hot' as const, // Default, not critical for display
            image: '',
            available: true,
          }));

        return {
          id: order.id,
          tokenNumber: order.token_number,
          items,
          total: Number(order.total),
          createdAt: new Date(order.created_at),
        };
      });

      setOrders(ordersWithItems);

      // Set next token number
      if (ordersData && ordersData.length > 0) {
        const maxToken = Math.max(...ordersData.map((o) => o.token_number));
        setNextTokenNumber(maxToken + 1);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async (items: CartItem[], total: number) => {
    try {
      // Create order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          token_number: nextTokenNumber,
          total,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = items.map((item) => ({
        order_id: orderData.id,
        menu_item_id: item.id,
        item_name: item.name,
        item_price: item.price,
        quantity: item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      const newOrder: Order = {
        id: orderData.id,
        tokenNumber: orderData.token_number,
        items,
        total,
        createdAt: new Date(orderData.created_at),
      };

      setOrders((prev) => [newOrder, ...prev]);
      setNextTokenNumber((prev) => prev + 1);

      return newOrder;
    } catch (error) {
      console.error('Error creating order:', error);
      toast({
        title: 'Error',
        description: 'Failed to save order',
        variant: 'destructive',
      });
      return null;
    }
  };

  const getTodayOrders = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return orders.filter((order) => order.createdAt >= today);
  };

  const getTodayStats = () => {
    const todayOrders = getTodayOrders();
    const totalSales = todayOrders.reduce((sum, order) => sum + order.total, 0);
    const totalItems = todayOrders.reduce(
      (sum, order) => sum + order.items.reduce((s, i) => s + i.quantity, 0),
      0
    );

    return {
      totalOrders: todayOrders.length,
      totalSales,
      totalItems,
    };
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return {
    orders,
    loading,
    nextTokenNumber,
    createOrder,
    getTodayOrders,
    getTodayStats,
    refetch: fetchOrders,
  };
};

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

  // Get today's date boundaries in local time
  const getTodayBoundaries = () => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    return { startOfDay, endOfDay };
  };

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
            category: 'hot' as const,
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

      // Calculate next token based on today's order count
      const { startOfDay } = getTodayBoundaries();
      const todayOrders = ordersWithItems.filter(
        (order) => order.createdAt >= startOfDay
      );
      const nextToken = (todayOrders.length % 100) + 1;
      setNextTokenNumber(nextToken);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async (items: CartItem[], total: number) => {
    try {
      // Get fresh count of today's orders to ensure accuracy
      const { startOfDay } = getTodayBoundaries();
      
      const { count, error: countError } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startOfDay.toISOString());

      if (countError) throw countError;

      // Calculate token: (today's count % 100) + 1, loops from 1-100
      const todayCount = count || 0;
      const tokenNumber = (todayCount % 100) + 1;

      // Create order with calculated token
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          token_number: tokenNumber,
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
      
      // Update next token for display
      const newNextToken = ((todayCount + 1) % 100) + 1;
      setNextTokenNumber(newNextToken);

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

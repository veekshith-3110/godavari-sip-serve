import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useOfflineQueue } from '@/hooks/useOfflineQueue';
import { fetchWithTimeout } from '@/hooks/useNetwork';
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
  isOffline?: boolean;
}

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [nextTokenNumber, setNextTokenNumber] = useState(1);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { addToQueue, pendingCount, syncQueue } = useOfflineQueue();

  // Get today's date boundaries in local time
  const getTodayBoundaries = () => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    return { startOfDay, endOfDay };
  };

  const fetchOrders = async () => {
    // If offline, just use what we have
    if (!navigator.onLine) {
      setLoading(false);
      return;
    }

    try {
      const fetchData = async () => {
        const [ordersResult, itemsResult] = await Promise.all([
          supabase.from('orders').select('*').order('created_at', { ascending: false }),
          supabase.from('order_items').select('*'),
        ]);

        if (ordersResult.error) throw ordersResult.error;
        if (itemsResult.error) throw itemsResult.error;

        return { ordersData: ordersResult.data, orderItemsData: itemsResult.data };
      };

      const { ordersData, orderItemsData } = await fetchWithTimeout(fetchData, {
        timeout: 15000,
        retries: 2,
        onRetry: (attempt) => {
          toast({
            title: 'Retrying...',
            description: `Attempt ${attempt + 1} to load orders`,
          });
        },
      });

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
      const nextToken = ((todayOrders.length + pendingCount) % 100) + 1;
      setNextTokenNumber(nextToken);
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      toast({
        title: 'Failed to load orders',
        description: error.message || 'Please check your connection',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async (items: CartItem[], total: number): Promise<Order | null> => {
    const { startOfDay } = getTodayBoundaries();

    // Calculate token number
    const todayOrders = orders.filter((o) => o.createdAt >= startOfDay);
    const tokenNumber = ((todayOrders.length + pendingCount) % 100) + 1;

    // OFFLINE MODE: Save to queue and return optimistic order
    if (!navigator.onLine) {
      const queuedOrder = addToQueue(items, total, tokenNumber);
      
      const offlineOrder: Order = {
        id: queuedOrder.id,
        tokenNumber,
        items,
        total,
        createdAt: new Date(),
        isOffline: true,
      };

      setOrders((prev) => [offlineOrder, ...prev]);
      setNextTokenNumber(((tokenNumber) % 100) + 1);

      toast({
        title: `Token #${tokenNumber}`,
        description: 'Saved offline. Will sync when online.',
      });

      return offlineOrder;
    }

    // ONLINE MODE: Use optimistic UI
    const optimisticOrder: Order = {
      id: `temp_${Date.now()}`,
      tokenNumber,
      items,
      total,
      createdAt: new Date(),
    };

    // Immediately update UI (Optimistic)
    setOrders((prev) => [optimisticOrder, ...prev]);
    setNextTokenNumber(((tokenNumber) % 100) + 1);

    try {
      const createOrderOnServer = async () => {
        // Get fresh count to handle concurrency
        const { count, error: countError } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', startOfDay.toISOString());

        if (countError) throw countError;

        const actualTokenNumber = ((count || 0) % 100) + 1;

        // Create order with calculated token
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .insert({
            token_number: actualTokenNumber,
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

        return { orderData, actualTokenNumber };
      };

      const { orderData, actualTokenNumber } = await fetchWithTimeout(createOrderOnServer, {
        timeout: 15000,
        retries: 2,
      });

      // Update with real data
      const realOrder: Order = {
        id: orderData.id,
        tokenNumber: actualTokenNumber,
        items,
        total,
        createdAt: new Date(orderData.created_at),
      };

      setOrders((prev) => 
        prev.map((o) => o.id === optimisticOrder.id ? realOrder : o)
      );

      // Update next token if it was different
      if (actualTokenNumber !== tokenNumber) {
        setNextTokenNumber(((actualTokenNumber) % 100) + 1);
      }

      return realOrder;
    } catch (error: any) {
      console.error('Error creating order:', error);

      // If online creation failed, save to offline queue
      const queuedOrder = addToQueue(items, total, tokenNumber);
      
      // Update the optimistic order to show it's pending
      setOrders((prev) =>
        prev.map((o) =>
          o.id === optimisticOrder.id
            ? { ...o, id: queuedOrder.id, isOffline: true }
            : o
        )
      );

      toast({
        title: 'Saved Offline',
        description: 'Order saved. Will sync when connection is stable.',
        variant: 'destructive',
      });

      return { ...optimisticOrder, id: queuedOrder.id, isOffline: true };
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

  // Sync offline orders when coming online
  useEffect(() => {
    const handleOnline = () => {
      syncQueue();
      fetchOrders();
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [syncQueue]);

  useEffect(() => {
    fetchOrders();
  }, []);

  return {
    orders,
    loading,
    nextTokenNumber,
    pendingOfflineOrders: pendingCount,
    createOrder,
    getTodayOrders,
    getTodayStats,
    refetch: fetchOrders,
  };
};

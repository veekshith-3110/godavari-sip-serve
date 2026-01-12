import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CartItem } from '@/hooks/useOrders';

interface QueuedOrder {
  id: string;
  items: CartItem[];
  total: number;
  tokenNumber: number;
  timestamp: number;
  synced: boolean;
}

const QUEUE_KEY = 'godavari_offline_orders';

export const useOfflineQueue = () => {
  const [queue, setQueue] = useState<QueuedOrder[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const { toast } = useToast();

  // Load queue from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(QUEUE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as QueuedOrder[];
        setQueue(parsed.filter(o => !o.synced));
      } catch {
        localStorage.removeItem(QUEUE_KEY);
      }
    }
  }, []);

  // Save queue to localStorage
  const saveQueue = useCallback((orders: QueuedOrder[]) => {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(orders));
    setQueue(orders);
  }, []);

  // Add order to queue
  const addToQueue = useCallback((
    items: CartItem[], 
    total: number, 
    tokenNumber: number
  ): QueuedOrder => {
    const order: QueuedOrder = {
      id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      items,
      total,
      tokenNumber,
      timestamp: Date.now(),
      synced: false,
    };

    const newQueue = [...queue, order];
    saveQueue(newQueue);

    return order;
  }, [queue, saveQueue]);

  // Sync a single order
  const syncOrder = async (order: QueuedOrder): Promise<boolean> => {
    try {
      // Create order in Supabase
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          token_number: order.tokenNumber,
          total: order.total,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = order.items.map((item) => ({
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

      return true;
    } catch (error) {
      console.error('Failed to sync order:', error);
      return false;
    }
  };

  // Sync all queued orders
  const syncQueue = useCallback(async () => {
    if (!navigator.onLine || queue.length === 0 || isSyncing) return;

    setIsSyncing(true);
    let syncedCount = 0;
    const newQueue: QueuedOrder[] = [];

    for (const order of queue) {
      if (order.synced) continue;

      const success = await syncOrder(order);
      if (success) {
        syncedCount++;
      } else {
        newQueue.push(order);
      }
    }

    saveQueue(newQueue);
    setIsSyncing(false);

    if (syncedCount > 0) {
      toast({
        title: 'Synced!',
        description: `${syncedCount} offline order${syncedCount > 1 ? 's' : ''} synced successfully`,
      });
    }

    return syncedCount;
  }, [queue, isSyncing, saveQueue, toast]);

  // Auto-sync when coming online
  useEffect(() => {
    const handleOnline = () => {
      if (queue.length > 0) {
        syncQueue();
      }
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [queue, syncQueue]);

  // Get pending count
  const pendingCount = queue.filter(o => !o.synced).length;

  return {
    queue,
    pendingCount,
    isSyncing,
    addToQueue,
    syncQueue,
  };
};

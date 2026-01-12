import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Expense {
  id: string;
  description: string;
  amount: number;
  createdAt: Date;
}

export const useExpenses = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchExpenses = async () => {
    // Skip fetch if offline
    if (!navigator.onLine) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const expensesList: Expense[] = (data || []).map((exp) => ({
        id: exp.id,
        description: exp.description,
        amount: Number(exp.amount),
        createdAt: new Date(exp.created_at),
      }));

      setExpenses(expensesList);
    } catch (error: any) {
      // Only log in development, don't scare users
      console.error('Error fetching expenses:', error);
      // Don't show toast - NoInternetOverlay handles connectivity issues
    } finally {
      setLoading(false);
    }
  };

  const addExpense = async (description: string, amount: number) => {
    // Check network first
    if (!navigator.onLine) {
      toast({
        title: 'No Internet',
        description: 'Please connect to record expenses',
        variant: 'destructive',
      });
      return null;
    }

    // Optimistic update
    const tempId = `temp_${Date.now()}`;
    const optimisticExpense: Expense = {
      id: tempId,
      description,
      amount,
      createdAt: new Date(),
    };
    setExpenses((prev) => [optimisticExpense, ...prev]);

    try {
      const { data, error } = await supabase
        .from('expenses')
        .insert({
          description,
          amount,
        })
        .select()
        .single();

      if (error) throw error;

      const newExpense: Expense = {
        id: data.id,
        description: data.description,
        amount: Number(data.amount),
        createdAt: new Date(data.created_at),
      };

      // Replace optimistic with real
      setExpenses((prev) => prev.map((e) => (e.id === tempId ? newExpense : e)));
      
      toast({ 
        title: 'Expense Recorded', 
        description: `₹${amount} - ${description}` 
      });
      
      return newExpense;
    } catch (error: any) {
      // Rollback optimistic update
      setExpenses((prev) => prev.filter((e) => e.id !== tempId));
      
      console.error('Error adding expense:', error);
      toast({
        title: 'Failed to Save',
        description: 'Please try again',
        variant: 'destructive',
      });
      return null;
    }
  };

  const deleteExpense = async (id: string) => {
    // Check network first
    if (!navigator.onLine) {
      toast({
        title: 'No Internet',
        description: 'Please connect to delete expenses',
        variant: 'destructive',
      });
      return false;
    }

    // Store for rollback
    const expenseToDelete = expenses.find((e) => e.id === id);
    
    // Optimistic delete
    setExpenses((prev) => prev.filter((exp) => exp.id !== id));

    try {
      const { error } = await supabase.from('expenses').delete().eq('id', id);

      if (error) throw error;

      toast({ 
        title: 'Deleted', 
        description: 'Expense removed' 
      });
      return true;
    } catch (error: any) {
      // Rollback
      if (expenseToDelete) {
        setExpenses((prev) => [expenseToDelete, ...prev]);
      }
      
      console.error('Error deleting expense:', error);
      toast({
        title: 'Delete Failed',
        description: 'Please try again',
        variant: 'destructive',
      });
      return false;
    }
  };

  const getTodayExpenses = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return expenses.filter((exp) => exp.createdAt >= today);
  };

  const getTodayTotal = () => {
    return getTodayExpenses().reduce((sum, exp) => sum + exp.amount, 0);
  };

  // Fetch on mount and when coming back online
  useEffect(() => {
    fetchExpenses();

    const handleOnline = () => fetchExpenses();
    const handleReconnected = () => fetchExpenses();
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('app-reconnected', handleReconnected);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('app-reconnected', handleReconnected);
    };
  }, []);

  return {
    expenses,
    loading,
    addExpense,
    deleteExpense,
    getTodayExpenses,
    getTodayTotal,
    refetch: fetchExpenses,
  };
};

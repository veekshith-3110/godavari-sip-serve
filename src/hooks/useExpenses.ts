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
    } catch (error) {
      console.error('Error fetching expenses:', error);
      toast({
        title: 'Error',
        description: 'Failed to load expenses',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const addExpense = async (description: string, amount: number) => {
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

      setExpenses((prev) => [newExpense, ...prev]);
      toast({ title: 'Success', description: 'Expense recorded' });
      return newExpense;
    } catch (error) {
      console.error('Error adding expense:', error);
      toast({
        title: 'Error',
        description: 'Failed to add expense',
        variant: 'destructive',
      });
      return null;
    }
  };

  const deleteExpense = async (id: string) => {
    try {
      const { error } = await supabase.from('expenses').delete().eq('id', id);

      if (error) throw error;

      setExpenses((prev) => prev.filter((exp) => exp.id !== id));
      toast({ title: 'Success', description: 'Expense deleted' });
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete expense',
        variant: 'destructive',
      });
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

  useEffect(() => {
    fetchExpenses();
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

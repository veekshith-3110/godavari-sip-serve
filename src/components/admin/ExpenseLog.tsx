import { useState } from 'react';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import ExpenseModal from '@/components/ExpenseModal';
import { useExpenses } from '@/hooks/useExpenses';

const ExpenseLog = () => {
  const { expenses, loading, addExpense, deleteExpense, getTodayExpenses, getTodayTotal } = useExpenses();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const todayExpenses = getTodayExpenses();
  const todayTotal = getTodayTotal();

  const handleDelete = async (id: string) => {
    await deleteExpense(id);
  };

  const handleAddExpense = async (description: string, amount: number) => {
    await addExpense(description, amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl lg:text-2xl font-bold text-foreground">Expense Log</h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-3 lg:px-4 py-2 bg-destructive text-destructive-foreground rounded-xl font-semibold hover:opacity-90 transition-opacity text-sm lg:text-base"
        >
          <Plus className="w-4 h-4 lg:w-5 lg:h-5" />
          <span className="hidden sm:inline">Add Expense</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      {/* Summary */}
      <div className="stat-card p-3 lg:p-4 bg-gradient-to-br from-destructive/10 to-destructive/5">
        <p className="text-xs lg:text-sm text-muted-foreground">Total Expenses Today</p>
        <p className="text-2xl lg:text-4xl font-extrabold text-destructive mt-1 lg:mt-2">₹{todayTotal}</p>
      </div>

      {/* Expense List */}
      <div className="stat-card p-3 lg:p-4">
        <h3 className="text-base lg:text-lg font-bold text-foreground mb-3 lg:mb-4">Today's Expenses</h3>
        <div className="space-y-2 lg:space-y-3">
          {todayExpenses.map((expense) => (
            <div
              key={expense.id}
              className="flex items-center justify-between gap-3 p-3 lg:p-4 bg-muted/50 rounded-xl"
            >
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-sm lg:text-base text-foreground truncate">{expense.description}</p>
                <p className="text-xs lg:text-sm text-muted-foreground">
                  {expense.createdAt.toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <div className="flex items-center gap-2 lg:gap-4 flex-shrink-0">
                <span className="text-base lg:text-xl font-bold text-destructive">-₹{expense.amount}</span>
                <button
                  onClick={() => handleDelete(expense.id)}
                  className="p-1.5 lg:p-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                </button>
              </div>
            </div>
          ))}

          {todayExpenses.length === 0 && (
            <p className="text-center text-muted-foreground py-8 text-sm lg:text-base">No expenses recorded today</p>
          )}
        </div>
      </div>

      {/* All Expenses */}
      {expenses.length > todayExpenses.length && (
        <div className="stat-card p-3 lg:p-4">
          <h3 className="text-base lg:text-lg font-bold text-foreground mb-3 lg:mb-4">All Expenses</h3>
          <div className="space-y-2 lg:space-y-3">
            {expenses.filter(e => !todayExpenses.some(t => t.id === e.id)).slice(0, 10).map((expense) => (
              <div
                key={expense.id}
                className="flex items-center justify-between gap-3 p-3 lg:p-4 bg-muted/50 rounded-xl"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm lg:text-base text-foreground truncate">{expense.description}</p>
                  <p className="text-xs lg:text-sm text-muted-foreground">
                    {expense.createdAt.toLocaleDateString('en-IN')} {expense.createdAt.toLocaleTimeString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-2 lg:gap-4 flex-shrink-0">
                  <span className="text-base lg:text-xl font-bold text-destructive">-₹{expense.amount}</span>
                  <button
                    onClick={() => handleDelete(expense.id)}
                    className="p-1.5 lg:p-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Expense Modal */}
      <ExpenseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddExpense}
      />
    </div>
  );
};

export default ExpenseLog;

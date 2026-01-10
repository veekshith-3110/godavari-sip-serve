import { useState } from 'react';
import { mockExpenses, Expense } from '@/data/mockData';
import { Plus, Trash2 } from 'lucide-react';

const ExpenseLog = () => {
  const [expenses, setExpenses] = useState<Expense[]>(mockExpenses);
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  const handleDelete = (id: string) => {
    setExpenses(expenses.filter(exp => exp.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Expense Log</h2>
        <button className="flex items-center gap-2 px-4 py-2 bg-destructive text-destructive-foreground rounded-xl font-semibold hover:opacity-90 transition-opacity">
          <Plus className="w-5 h-5" />
          Add Expense
        </button>
      </div>

      {/* Summary */}
      <div className="stat-card bg-gradient-to-br from-destructive/10 to-destructive/5">
        <p className="text-sm text-muted-foreground">Total Expenses Today</p>
        <p className="text-4xl font-extrabold text-destructive mt-2">₹{totalExpenses}</p>
      </div>

      {/* Expense List */}
      <div className="stat-card">
        <h3 className="text-lg font-bold text-foreground mb-4">Expense History</h3>
        <div className="space-y-3">
          {expenses.map((expense) => (
            <div
              key={expense.id}
              className="flex items-center justify-between p-4 bg-muted/50 rounded-xl"
            >
              <div>
                <p className="font-semibold text-foreground">{expense.description}</p>
                <p className="text-sm text-muted-foreground">
                  {expense.timestamp.toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xl font-bold text-destructive">-₹{expense.amount}</span>
                <button
                  onClick={() => handleDelete(expense.id)}
                  className="p-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {expenses.length === 0 && (
            <p className="text-center text-muted-foreground py-8">No expenses recorded</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExpenseLog;

import { useState } from 'react';
import { X } from 'lucide-react';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (description: string, amount: number) => void;
}

const ExpenseModal = ({ isOpen, onClose, onSubmit }: ExpenseModalProps) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (description && amount) {
      onSubmit(description, parseFloat(amount));
      setDescription('');
      setAmount('');
      onClose();
    }
  };

  const quickExpenses = [
    { label: 'Milk', amount: 250 },
    { label: 'Ice', amount: 50 },
    { label: 'Sugar', amount: 100 },
    { label: 'Tea Powder', amount: 200 },
  ];

  return (
    <div className="fixed inset-0 bg-foreground/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-xl font-bold text-foreground">Cash Out (Expense)</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <X className="w-6 h-6 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Quick Expense Buttons */}
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              Quick Add
            </label>
            <div className="grid grid-cols-2 gap-2">
              {quickExpenses.map((exp) => (
                <button
                  key={exp.label}
                  onClick={() => {
                    setDescription(exp.label);
                    setAmount(exp.amount.toString());
                  }}
                  className="p-3 bg-muted rounded-lg text-left hover:bg-secondary transition-colors"
                >
                  <p className="font-semibold text-foreground">{exp.label}</p>
                  <p className="text-sm text-muted-foreground">₹{exp.amount}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Description Input */}
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Milk, Ice, etc."
              className="w-full p-4 rounded-xl border border-input bg-background text-foreground text-lg focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Amount Input */}
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              Amount (₹)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className="w-full p-4 rounded-xl border border-input bg-background text-foreground text-2xl font-bold text-center focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border">
          <button
            onClick={handleSubmit}
            disabled={!description || !amount}
            className="w-full py-4 bg-destructive text-destructive-foreground font-bold text-lg rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
          >
            Record Expense
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExpenseModal;

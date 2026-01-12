import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import FormField from '@/components/FormField';
import { expenseSchema, formatValidationError } from '@/lib/validation';
import { useToast } from '@/hooks/use-toast';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (description: string, amount: number) => Promise<any>;
}

const ExpenseModal = ({ isOpen, onClose, onSubmit }: ExpenseModalProps) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  if (!isOpen) return null;

  const handleSubmit = async () => {
    // Clear previous errors
    setErrors({});

    // Validate form
    const amountNum = amount ? parseFloat(amount) : 0;
    const result = expenseSchema.safeParse({
      description: description.trim(),
      amount: amountNum,
    });

    if (!result.success) {
      const validationErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        const path = err.path.join('.');
        if (!validationErrors[path]) {
          validationErrors[path] = err.message;
        }
      });
      setErrors(validationErrors);
      toast({
        title: 'Please fix the errors',
        description: formatValidationError(validationErrors),
        variant: 'destructive',
      });
      return;
    }

    // Check network
    if (!navigator.onLine) {
      toast({
        title: 'No Internet',
        description: 'Please connect to the internet to record expenses',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const validatedData = result.data;
      const submitResult = await onSubmit(validatedData.description, validatedData.amount);
      
      if (submitResult) {
        setDescription('');
        setAmount('');
        setErrors({});
        onClose();
      }
    } catch (error) {
      toast({
        title: 'Failed to save',
        description: 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickExpense = (label: string, quickAmount: number) => {
    setDescription(label);
    setAmount(quickAmount.toString());
    setErrors({});
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setDescription('');
      setAmount('');
      setErrors({});
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
    <div 
      className="fixed inset-0 bg-foreground/50 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-md animate-in fade-in-0 zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-xl font-bold text-foreground">Cash Out (Expense)</h2>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-2 rounded-lg hover:bg-muted transition-colors disabled:opacity-50"
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
                  onClick={() => handleQuickExpense(exp.label, exp.amount)}
                  disabled={isSubmitting}
                  className="p-3 bg-muted rounded-lg text-left hover:bg-secondary transition-colors disabled:opacity-50"
                >
                  <p className="font-semibold text-foreground">{exp.label}</p>
                  <p className="text-sm text-muted-foreground">₹{exp.amount}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Description Input */}
          <FormField 
            label="Description" 
            error={errors.description}
            required
            hint="e.g., Milk, Ice, Supplies"
          >
            <input
              type="text"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (errors.description) setErrors({ ...errors, description: '' });
              }}
              disabled={isSubmitting}
              placeholder="What's this expense for?"
              maxLength={100}
              className={`w-full p-4 rounded-xl border bg-background text-foreground text-lg focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 ${
                errors.description ? 'border-destructive' : 'border-input'
              }`}
            />
          </FormField>

          {/* Amount Input */}
          <FormField 
            label="Amount" 
            error={errors.amount}
            required
          >
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-muted-foreground">
                ₹
              </span>
              <input
                type="number"
                inputMode="numeric"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  if (errors.amount) setErrors({ ...errors, amount: '' });
                }}
                disabled={isSubmitting}
                placeholder="0"
                min="1"
                max="100000"
                className={`w-full p-4 pl-10 rounded-xl border bg-background text-foreground text-2xl font-bold text-center focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 ${
                  errors.amount ? 'border-destructive' : 'border-input'
                }`}
              />
            </div>
          </FormField>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !description || !amount}
            className="w-full py-4 bg-destructive text-destructive-foreground font-bold text-lg rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              'Record Expense'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExpenseModal;

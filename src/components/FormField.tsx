import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface FormFieldProps {
  label: string;
  error?: string;
  children: ReactNode;
  required?: boolean;
  hint?: string;
  className?: string;
}

const FormField = ({ 
  label, 
  error, 
  children, 
  required = false,
  hint,
  className 
}: FormFieldProps) => {
  return (
    <div className={cn('space-y-1.5', className)}>
      <label className="text-sm font-medium text-foreground flex items-center gap-1">
        {label}
        {required && <span className="text-destructive">*</span>}
      </label>
      {children}
      {hint && !error && (
        <p className="text-xs text-muted-foreground">{hint}</p>
      )}
      {error && (
        <p className="text-xs text-destructive font-medium animate-in fade-in-0 slide-in-from-top-1">
          {error}
        </p>
      )}
    </div>
  );
};

export default FormField;

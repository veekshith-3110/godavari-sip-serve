import { z } from 'zod';

// Expense validation
export const expenseSchema = z.object({
  description: z
    .string()
    .trim()
    .min(1, 'Description is required')
    .max(100, 'Description must be less than 100 characters')
    .regex(/^[a-zA-Z0-9\s\-_,.()]+$/, 'Description contains invalid characters'),
  amount: z
    .number()
    .positive('Amount must be greater than 0')
    .max(100000, 'Amount cannot exceed ₹1,00,000')
    .refine((val) => Number.isFinite(val), 'Invalid amount'),
});

export type ExpenseFormData = z.infer<typeof expenseSchema>;

// Menu item validation
export const menuItemSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name is required')
    .max(50, 'Name must be less than 50 characters'),
  price: z
    .number()
    .positive('Price must be greater than 0')
    .max(10000, 'Price cannot exceed ₹10,000'),
  category: z.enum(['hot', 'snacks', 'cold', 'smoke'], {
    errorMap: () => ({ message: 'Please select a valid category' }),
  }),
  image: z.string().optional(),
  available: z.boolean().default(true),
});

export type MenuItemFormData = z.infer<typeof menuItemSchema>;

// Auth validation
export const authSchema = z.object({
  email: z
    .string()
    .trim()
    .email('Please enter a valid email address')
    .max(255, 'Email is too long'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(72, 'Password is too long'),
});

export type AuthFormData = z.infer<typeof authSchema>;

// Validation helper
export const validateForm = <T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: Record<string, string> } => {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  const errors: Record<string, string> = {};
  result.error.errors.forEach((err) => {
    const path = err.path.join('.');
    if (!errors[path]) {
      errors[path] = err.message;
    }
  });
  
  return { success: false, errors };
};

// Format validation error for display
export const formatValidationError = (errors: Record<string, string>): string => {
  const messages = Object.values(errors);
  return messages.length > 0 ? messages[0] : 'Please check your input';
};

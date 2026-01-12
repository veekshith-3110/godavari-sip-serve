import { AlertCircle, CheckCircle, Info, XCircle, WifiOff, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

type StatusType = 'success' | 'error' | 'warning' | 'info' | 'offline';

interface StatusMessageProps {
  type: StatusType;
  title: string;
  message?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

const statusConfig = {
  success: {
    icon: CheckCircle,
    bgColor: 'bg-green-50 dark:bg-green-950/20',
    borderColor: 'border-green-200 dark:border-green-800',
    iconColor: 'text-green-600 dark:text-green-400',
    textColor: 'text-green-800 dark:text-green-200',
  },
  error: {
    icon: XCircle,
    bgColor: 'bg-red-50 dark:bg-red-950/20',
    borderColor: 'border-red-200 dark:border-red-800',
    iconColor: 'text-red-600 dark:text-red-400',
    textColor: 'text-red-800 dark:text-red-200',
  },
  warning: {
    icon: AlertCircle,
    bgColor: 'bg-amber-50 dark:bg-amber-950/20',
    borderColor: 'border-amber-200 dark:border-amber-800',
    iconColor: 'text-amber-600 dark:text-amber-400',
    textColor: 'text-amber-800 dark:text-amber-200',
  },
  info: {
    icon: Info,
    bgColor: 'bg-blue-50 dark:bg-blue-950/20',
    borderColor: 'border-blue-200 dark:border-blue-800',
    iconColor: 'text-blue-600 dark:text-blue-400',
    textColor: 'text-blue-800 dark:text-blue-200',
  },
  offline: {
    icon: WifiOff,
    bgColor: 'bg-slate-50 dark:bg-slate-950/20',
    borderColor: 'border-slate-200 dark:border-slate-800',
    iconColor: 'text-slate-600 dark:text-slate-400',
    textColor: 'text-slate-800 dark:text-slate-200',
  },
};

const StatusMessage = ({ type, title, message, action, className }: StatusMessageProps) => {
  const config = statusConfig[type];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 rounded-xl border',
        config.bgColor,
        config.borderColor,
        className
      )}
    >
      <Icon className={cn('w-5 h-5 flex-shrink-0 mt-0.5', config.iconColor)} />
      <div className="flex-1 min-w-0">
        <p className={cn('font-semibold text-sm', config.textColor)}>{title}</p>
        {message && (
          <p className={cn('text-sm mt-1 opacity-80', config.textColor)}>{message}</p>
        )}
        {action && (
          <button
            onClick={action.onClick}
            className={cn(
              'mt-2 text-sm font-medium underline underline-offset-2 hover:opacity-80 transition-opacity flex items-center gap-1',
              config.textColor
            )}
          >
            <RefreshCw className="w-3 h-3" />
            {action.label}
          </button>
        )}
      </div>
    </div>
  );
};

export default StatusMessage;

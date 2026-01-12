import { LogIn } from 'lucide-react';

interface SessionExpiredModalProps {
  isOpen: boolean;
  onLogin: () => void;
}

const SessionExpiredModal = ({ isOpen, onLogin }: SessionExpiredModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-foreground/50 flex items-center justify-center z-[100] p-4">
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-sm text-center p-6">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
          <LogIn className="w-8 h-8 text-primary" />
        </div>
        
        <h2 className="text-xl font-bold text-foreground mb-2">
          Session Expired
        </h2>
        
        <p className="text-muted-foreground mb-6">
          Your session has expired for security reasons. Please log in again to continue.
        </p>

        <button
          onClick={onLogin}
          className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:opacity-90 transition-opacity"
        >
          Log In Again
        </button>
      </div>
    </div>
  );
};

export default SessionExpiredModal;

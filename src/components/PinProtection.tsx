import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Lock, Eye, EyeOff, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

// Change this PIN to your desired code
const APP_PIN = '799313';
const STORAGE_KEY = 'pos_unlocked';

interface PinProtectionProps {
  children: React.ReactNode;
}

export const PinProtection = ({ children }: PinProtectionProps) => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if already unlocked in this session
    const unlocked = sessionStorage.getItem(STORAGE_KEY);
    if (unlocked === 'true') {
      setIsUnlocked(true);
    }
    setIsLoading(false);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === APP_PIN) {
      sessionStorage.setItem(STORAGE_KEY, 'true');
      setIsUnlocked(true);
      setError('');
    } else {
      setError('Incorrect PIN');
      setPin('');
    }
  };

  const handleLock = () => {
    sessionStorage.removeItem(STORAGE_KEY);
    setIsUnlocked(false);
    setPin('');
  };

  const handleSignOut = async () => {
    sessionStorage.removeItem(STORAGE_KEY);
    await signOut();
    navigate('/auth');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isUnlocked) {
    return (
      <>
        {children}
        <div className="fixed bottom-4 right-4 flex gap-2 z-50">
          <button
            onClick={handleLock}
            className="p-2 bg-muted hover:bg-muted/80 rounded-full shadow-lg opacity-50 hover:opacity-100 transition-opacity"
            title="Lock App"
          >
            <Lock className="h-4 w-4" />
          </button>
          <button
            onClick={handleSignOut}
            className="p-2 bg-destructive/10 hover:bg-destructive/20 rounded-full shadow-lg opacity-50 hover:opacity-100 transition-opacity text-destructive"
            title="Sign Out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <div className="w-full max-w-sm">
        <div className="bg-card rounded-2xl shadow-xl p-8 border">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-primary/10 rounded-full">
              <Lock className="h-8 w-8 text-primary" />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-center mb-2">POS System</h1>
          <p className="text-muted-foreground text-center mb-1">Enter PIN to access</p>
          {user && (
            <p className="text-xs text-primary text-center mb-4">
              Logged in as: {user.email}
            </p>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Input
                type={showPin ? 'text' : 'password'}
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  setError('');
                }}
                placeholder="Enter PIN"
                className="text-center text-2xl tracking-widest pr-10"
                maxLength={10}
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            
            {error && (
              <p className="text-destructive text-sm text-center">{error}</p>
            )}
            
            <Button type="submit" className="w-full" size="lg">
              Unlock
            </Button>
          </form>
          
          <button
            onClick={handleSignOut}
            className="w-full mt-4 text-sm text-muted-foreground hover:text-destructive transition-colors"
          >
            Sign out of account
          </button>
        </div>
      </div>
    </div>
  );
};

export default PinProtection;

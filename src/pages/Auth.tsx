import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Mail, Eye, EyeOff, LogIn, UserPlus, KeyRound, Loader2, WifiOff } from 'lucide-react';
import godavariLogo from '@/assets/godavari-cafe-logo.png';
import FormField from '@/components/FormField';
import { authSchema } from '@/lib/validation';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate('/');
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate('/');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const validateForm = (): boolean => {
    setErrors({});
    
    const result = authSchema.safeParse({
      email: email.trim(),
      password,
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
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form first
    if (!validateForm()) {
      return;
    }

    // Check network
    if (!navigator.onLine) {
      toast({
        title: 'No Internet Connection',
        description: 'Please check your network and try again',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`
          }
        });

        if (error) {
          handleAuthError(error.message, 'signup');
        } else {
          toast({
            title: 'Account created!',
            description: 'Check your email to confirm, or sign in directly if email confirmation is disabled.',
          });
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password
        });

        if (error) {
          handleAuthError(error.message, 'signin');
        } else {
          toast({
            title: 'Welcome back!',
            description: 'Successfully logged in',
          });
          navigate('/');
        }
      }
    } catch (error: any) {
      toast({
        title: 'Connection Error',
        description: 'Unable to connect. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthError = (errorMessage: string, action: 'signin' | 'signup') => {
    // Map technical errors to user-friendly messages
    let title = 'Error';
    let description = 'Something went wrong. Please try again.';

    if (errorMessage.includes('already registered') || errorMessage.includes('already exists')) {
      title = 'Account Already Exists';
      description = 'This email is already registered. Please sign in instead.';
    } else if (errorMessage.includes('Invalid login credentials')) {
      title = 'Login Failed';
      description = 'Incorrect email or password. Please try again.';
    } else if (errorMessage.includes('Email not confirmed')) {
      title = 'Email Not Verified';
      description = 'Please check your email and click the verification link.';
    } else if (errorMessage.includes('rate limit') || errorMessage.includes('too many requests')) {
      title = 'Too Many Attempts';
      description = 'Please wait a moment before trying again.';
    } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
      title = 'Connection Error';
      description = 'Unable to connect. Please check your internet.';
    } else if (errorMessage.includes('Password')) {
      title = 'Password Issue';
      description = errorMessage;
    }

    toast({
      title,
      description,
      variant: 'destructive'
    });
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (errors.email) {
      setErrors({ ...errors, email: '' });
    }
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (errors.password) {
      setErrors({ ...errors, password: '' });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary p-4 pt-[max(1rem,var(--safe-area-top))]">
      <div className="w-full max-w-sm">
        {/* Offline Warning */}
        {!navigator.onLine && (
          <div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 text-sm">
            <WifiOff className="w-5 h-5 flex-shrink-0" />
            <span>No internet connection</span>
          </div>
        )}

        <div className="bg-card rounded-2xl shadow-xl p-8 border border-border">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
              <img 
                src={godavariLogo} 
                alt="Godavari Cafe" 
                className="h-20 w-20 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-center mb-2 text-foreground">GODAVARI CAFE</h1>
          <p className="text-muted-foreground text-center mb-6">
            {isSignUp ? 'Create your account' : 'Sign in to continue'}
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <FormField label="Email" error={errors.email} required>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  placeholder="Enter your email"
                  className={`pl-10 ${errors.email ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                  autoComplete="email"
                  disabled={isLoading}
                  maxLength={255}
                />
              </div>
            </FormField>
            
            {/* Password Field */}
            <FormField 
              label="Password" 
              error={errors.password} 
              required
              hint={isSignUp ? 'At least 6 characters' : undefined}
            >
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  placeholder={isSignUp ? 'Create a password' : 'Enter your password'}
                  className={`pl-10 pr-10 ${errors.password ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                  autoComplete={isSignUp ? 'new-password' : 'current-password'}
                  disabled={isLoading}
                  maxLength={72}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </FormField>
            
            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full" 
              size="lg" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {isSignUp ? 'Creating account...' : 'Signing in...'}
                </>
              ) : isSignUp ? (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Create Account
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign In
                </>
              )}
            </Button>
          </form>
          
          {/* Toggle Sign Up / Sign In */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setErrors({});
              }}
              className="text-sm text-primary hover:underline transition-all"
              disabled={isLoading}
            >
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>
        </div>
        
        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-4">
          Powered by Godavari Cafe POS
        </p>
      </div>
    </div>
  );
};

export default Auth;

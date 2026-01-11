import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Mail, Eye, EyeOff, LogIn, UserPlus, Coffee, CheckCircle2 } from 'lucide-react';
import godavariLogo from '@/assets/godavari-cafe-logo.png';

const features = [
  "Fast & Easy Order Management",
  "Real-time Sales Tracking",
  "Bluetooth Thermal Printing",
  "Comprehensive Reports"
];

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`
          }
        });

        if (error) {
          if (error.message.includes('already registered')) {
            toast({
              title: "Account exists",
              description: "This email is already registered. Please sign in.",
              variant: "destructive"
            });
          } else {
            throw error;
          }
        } else {
          toast({
            title: "Account created!",
            description: "Check your email to confirm your account, or sign in directly if email confirmation is disabled.",
          });
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            toast({
              title: "Login failed",
              description: "Invalid email or password",
              variant: "destructive"
            });
          } else {
            throw error;
          }
        } else {
          toast({
            title: "Welcome back!",
            description: "Successfully logged in",
          });
          navigate('/');
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-amber-600 via-orange-500 to-amber-700 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-amber-300 rounded-full blur-3xl" />
        </div>
        
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20 text-white">
          <div className="flex items-center gap-4 mb-8">
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-3">
              <Coffee className="h-10 w-10" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">GODAVARI CAFE</h1>
              <p className="text-amber-100">Point of Sale System</p>
            </div>
          </div>
          
          <h2 className="text-4xl xl:text-5xl font-bold leading-tight mb-6">
            Streamline Your
            <br />
            <span className="text-amber-200">Cafe Operations</span>
          </h2>
          
          <p className="text-lg text-amber-100 mb-10 max-w-md">
            Manage orders, track sales, and grow your business with our powerful yet simple POS system.
          </p>
          
          <div className="space-y-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="bg-white/20 rounded-full p-1">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <span className="text-lg">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-background p-6 sm:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex flex-col items-center mb-8">
            <img src={godavariLogo} alt="Godavari Cafe" className="h-20 w-20 object-contain mb-4" />
            <h1 className="text-2xl font-bold text-foreground">GODAVARI CAFE</h1>
          </div>

          {/* Desktop Logo */}
          <div className="hidden lg:block mb-8">
            <img src={godavariLogo} alt="Godavari Cafe" className="h-16 w-16 object-contain mb-4" />
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-2">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </h2>
            <p className="text-muted-foreground">
              {isSignUp 
                ? 'Get started with your free account today' 
                : 'Sign in to access your dashboard'}
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="pl-12 h-12 text-base border-2 focus:border-primary transition-colors"
                  autoComplete="email"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Password</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </div>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="pl-12 pr-12 h-12 text-base border-2 focus:border-primary transition-colors"
                  autoComplete={isSignUp ? 'new-password' : 'current-password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {isSignUp && (
                <p className="text-xs text-muted-foreground">Must be at least 6 characters</p>
              )}
            </div>
            
            <Button 
              type="submit" 
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/25 transition-all duration-300" 
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
              ) : isSignUp ? (
                <>
                  <UserPlus className="h-5 w-5 mr-2" />
                  Create Account
                </>
              ) : (
                <>
                  <LogIn className="h-5 w-5 mr-2" />
                  Sign In
                </>
              )}
            </Button>
          </form>
          
          <div className="mt-8 text-center">
            <p className="text-muted-foreground">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-primary font-semibold hover:underline"
              >
                {isSignUp ? 'Sign in' : 'Sign up'}
              </button>
            </p>
          </div>
          
          <div className="mt-10 pt-8 border-t border-border">
            <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              Secured with enterprise-grade encryption
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;

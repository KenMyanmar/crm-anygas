
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signIn, user, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [redirectAttempted, setRedirectAttempted] = useState(false);

  // Only redirect if user is already authenticated AND we're on the login page
  useEffect(() => {
    console.log('Login check - user:', user?.id, 'path:', location.pathname, 'isLoading:', isLoading, 'redirectAttempted:', redirectAttempted);
    
    // Wait until authentication check is complete and only redirect once
    if (!isLoading && user && location.pathname === '/login' && !redirectAttempted) {
      console.log('User already authenticated, redirecting to dashboard once');
      setRedirectAttempted(true);
      
      // Force this to happen outside the current render cycle
      const redirectTimer = setTimeout(() => {
        console.log('Executing redirect to dashboard');
        navigate('/', { replace: true });
      }, 200);
      
      return () => clearTimeout(redirectTimer);
    }
  }, [user, navigate, location.pathname, isLoading, redirectAttempted]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      console.log('Attempting sign in for:', email);
      await signIn(email, password);
      toast({
        description: "Login successful! Redirecting to dashboard..."
      });
      
      // Add explicit navigation here as a fallback in case the useEffect doesn't trigger
      setTimeout(() => {
        console.log('Manual redirect after successful login');
        navigate('/', { replace: true });
      }, 500);
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login failed",
        description: "Please check your credentials and try again",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // If we're still checking auth status, show loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading authentication status...</div>
      </div>
    );
  }

  // Only render login form if user is not authenticated
  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4">Already authenticated!</div>
          <Button 
            onClick={() => {
              console.log('Dashboard button clicked, navigating to / directly');
              // Use forceful navigation approach
              window.location.href = '/';
            }}
          >
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30">
      <div className="w-full max-w-md px-4">
        <div className="text-center mb-8">
          <div 
            className="mx-auto h-16 w-64 bg-[#FDD835] flex items-center justify-center mb-4"
          >
            <span className="text-2xl font-bold text-black">ANY GAS</span>
          </div>
          <h2 className="mt-4 text-2xl font-bold text-gray-900">NY GAS Myanmar</h2>
          <p className="text-gray-600">Customer Relationship Management</p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Log in to your account</CardTitle>
            <CardDescription>Enter your email and password to access the CRM</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    placeholder="Email address"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    placeholder="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                type="submit" 
                className="w-full bg-[#FDD835] text-black hover:bg-[#FDD835]/90" 
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Signing in...' : 'Sign In'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Login;

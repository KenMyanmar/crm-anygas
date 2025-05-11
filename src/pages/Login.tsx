
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
  const { signIn, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Only redirect if user is already authenticated AND we're on the login page
  useEffect(() => {
    console.log('Login check - user:', user?.id, 'path:', location.pathname);
    
    // Only redirect if we're actually on the login page and user is authenticated
    if (user && location.pathname === '/login') {
      console.log('User already authenticated, redirecting to dashboard');
      // Use single-time navigation flag to prevent loops
      const redirectTimer = setTimeout(() => {
        navigate('/', { replace: true });
      }, 0);
      
      return () => clearTimeout(redirectTimer);
    }
  }, [user, navigate, location.pathname]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      console.log('Attempting sign in for:', email);
      await signIn(email, password);
      toast({
        description: "Login successful! Redirecting to dashboard..."
      });
      // Don't navigate here - let the useEffect handle navigation
      // This prevents potential race conditions with auth state updates
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

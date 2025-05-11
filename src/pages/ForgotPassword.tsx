
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await resetPassword(email);
      setIsSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30">
      <div className="w-full max-w-md px-4">
        <div className="text-center mb-8">
          <img 
            src="/logo.png" 
            alt="ANY GAS Myanmar" 
            className="mx-auto h-16 w-auto"
            onError={(e) => {
              // Fallback if logo image doesn't exist
              e.currentTarget.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="40"><rect width="100" height="40" fill="%23fdd835" /><text x="50%" y="50%" font-family="Arial" font-size="16" font-weight="bold" text-anchor="middle" dominant-baseline="middle" fill="%23000">ANY GAS</text></svg>';
            }}
          />
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Reset your password</CardTitle>
            <CardDescription>
              {!isSubmitted 
                ? "Enter your email and we'll send you instructions to reset your password" 
                : "Reset instructions sent! Check your email"
              }
            </CardDescription>
          </CardHeader>
          
          {!isSubmitted ? (
            <form onSubmit={handleSubmit}>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      placeholder="Your email address"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-2">
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? 'Sending...' : 'Send Reset Instructions'}
                </Button>
                <Link to="/login" className="flex items-center text-sm text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="mr-1 h-4 w-4" />
                  Back to login
                </Link>
              </CardFooter>
            </form>
          ) : (
            <CardContent className="pt-2">
              <div className="space-y-4">
                <p className="text-center text-sm text-muted-foreground">
                  Check your email for password reset instructions. If you don't see it in your inbox, please check your spam folder.
                </p>
                <div className="pt-4">
                  <Link to="/login" className="block w-full">
                    <Button variant="outline" className="w-full">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to Login
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;

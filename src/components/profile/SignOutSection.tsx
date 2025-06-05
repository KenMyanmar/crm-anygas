
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const SignOutSection = () => {
  const { signOut } = useAuth();

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">Sign Out</h3>
            <p className="text-sm text-muted-foreground">Sign out of your account</p>
          </div>
          <Button variant="destructive" onClick={signOut}>
            Sign Out
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SignOutSection;

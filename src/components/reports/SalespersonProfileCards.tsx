
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Activity, MapPin, Target, TrendingUp, DollarSign } from 'lucide-react';
import { SalespersonProfile } from '@/hooks/usePerformanceAnalytics';
import { formatDate } from '@/lib/supabase';

interface SalespersonProfileCardsProps {
  profiles: SalespersonProfile[];
}

export const SalespersonProfileCards = ({ profiles }: SalespersonProfileCardsProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US').format(amount);
  };

  const getPerformanceColor = (conversionRate: number) => {
    if (conversionRate >= 30) return 'bg-green-100 text-green-800';
    if (conversionRate >= 20) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {profiles.slice(0, 9).map((profile) => (
        <Card key={profile.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{profile.name}</CardTitle>
              <Badge className={getPerformanceColor(profile.conversionRate)}>
                {profile.conversionRate.toFixed(1)}% CR
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{profile.email}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Activity className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-xs text-muted-foreground">Logins</p>
                  <p className="text-sm font-semibold">{profile.loginCount}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-purple-600" />
                <div>
                  <p className="text-xs text-muted-foreground">Plans</p>
                  <p className="text-sm font-semibold">{profile.visitPlansCreated}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-orange-600" />
                <div>
                  <p className="text-xs text-muted-foreground">Visits</p>
                  <p className="text-sm font-semibold">{profile.visitsCompleted}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Target className="h-4 w-4 text-indigo-600" />
                <div>
                  <p className="text-xs text-muted-foreground">Leads</p>
                  <p className="text-sm font-semibold">{profile.leadsGenerated}</p>
                </div>
              </div>
            </div>
            
            <div className="border-t pt-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-muted-foreground">Orders</span>
                </div>
                <span className="text-sm font-semibold">{profile.ordersCreated}</span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-green-700" />
                  <span className="text-sm text-muted-foreground">Revenue</span>
                </div>
                <span className="text-sm font-semibold">{formatCurrency(profile.revenue)} K</span>
              </div>
            </div>
            
            {profile.lastLogin && (
              <div className="text-xs text-muted-foreground">
                Last login: {formatDate(profile.lastLogin)}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

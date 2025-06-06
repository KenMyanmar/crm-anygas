
import { Card, CardContent } from '@/components/ui/card';
import { Users, TrendingUp, DollarSign, Clock } from 'lucide-react';

interface LeadMetricsCardsProps {
  totalLeads: number;
  conversionRate: number;
  avgDealValue: number;
  pipelineVelocity: number;
}

export const LeadMetricsCards = ({
  totalLeads,
  conversionRate,
  avgDealValue,
  pipelineVelocity
}: LeadMetricsCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-3">
            <Users className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-sm text-muted-foreground">Total Leads</p>
              <p className="text-2xl font-bold">{totalLeads}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-3">
            <TrendingUp className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-sm text-muted-foreground">Conversion Rate</p>
              <p className="text-2xl font-bold">{conversionRate.toFixed(1)}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-3">
            <DollarSign className="h-8 w-8 text-purple-600" />
            <div>
              <p className="text-sm text-muted-foreground">Avg Deal Value</p>
              <p className="text-2xl font-bold">{avgDealValue > 0 ? `$${avgDealValue}` : 'TBD'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-3">
            <Clock className="h-8 w-8 text-orange-600" />
            <div>
              <p className="text-sm text-muted-foreground">Pipeline Velocity</p>
              <p className="text-2xl font-bold">{pipelineVelocity > 0 ? `${pipelineVelocity}d` : 'TBD'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

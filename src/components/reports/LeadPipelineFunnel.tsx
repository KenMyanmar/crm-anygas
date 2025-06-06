
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, FunnelChart, Funnel, Cell, Tooltip, LabelList } from 'recharts';

interface LeadPipelineFunnelProps {
  conversionFunnel: Array<{ stage: string; count: number; conversionRate: number }>;
}

export const LeadPipelineFunnel = ({ conversionFunnel }: LeadPipelineFunnelProps) => {
  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#d0743c'];

  const funnelData = conversionFunnel.map((item, index) => ({
    name: item.stage,
    value: item.count,
    fill: colors[index % colors.length]
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lead Pipeline Funnel</CardTitle>
        <CardDescription>Conversion rates through each pipeline stage</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <FunnelChart>
              <Tooltip />
              <Funnel
                dataKey="value"
                data={funnelData}
                isAnimationActive
              >
                <LabelList position="center" fill="#fff" stroke="none" />
                {funnelData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Funnel>
            </FunnelChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-4">
          {conversionFunnel.map((item, index) => (
            <div key={item.stage} className="text-center">
              <div 
                className="w-4 h-4 rounded mx-auto mb-1" 
                style={{ backgroundColor: colors[index % colors.length] }}
              />
              <p className="text-sm font-medium">{item.stage}</p>
              <p className="text-xs text-muted-foreground">{item.count} leads</p>
              <p className="text-xs text-green-600">{item.conversionRate.toFixed(1)}%</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

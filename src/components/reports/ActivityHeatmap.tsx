
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { ActivityPattern } from '@/hooks/usePerformanceAnalytics';

interface ActivityHeatmapProps {
  activityPatterns: ActivityPattern[];
}

export const ActivityHeatmap = ({ activityPatterns }: ActivityHeatmapProps) => {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' });
  };

  const chartData = activityPatterns.map(pattern => ({
    ...pattern,
    date: formatDate(pattern.date)
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Activity Patterns</CardTitle>
        <CardDescription>Track login frequency and daily activities over time</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                fontSize={12}
                tickLine={false}
              />
              <YAxis fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #ccc',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="logins" 
                stroke="#3b82f6" 
                strokeWidth={2}
                name="Logins"
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="visitPlans" 
                stroke="#8b5cf6" 
                strokeWidth={2}
                name="Visit Plans"
                dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="visitsCompleted" 
                stroke="#f59e0b" 
                strokeWidth={2}
                name="Visits Completed"
                dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="leadsCreated" 
                stroke="#10b981" 
                strokeWidth={2}
                name="Leads Created"
                dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="ordersCreated" 
                stroke="#ef4444" 
                strokeWidth={2}
                name="Orders Created"
                dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

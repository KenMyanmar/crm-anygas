
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { VisitEfficiency } from '@/hooks/usePerformanceAnalytics';

interface VisitEfficiencyChartsProps {
  visitEfficiency: VisitEfficiency[];
}

export const VisitEfficiencyCharts = ({ visitEfficiency }: VisitEfficiencyChartsProps) => {
  const chartData = visitEfficiency.map(efficiency => ({
    name: efficiency.salespersonName.split(' ')[0], // First name only for better display
    planned: efficiency.plannedVisits,
    completed: efficiency.completedVisits,
    completionRate: efficiency.completionRate,
    leads: efficiency.leadsFromVisits,
    orders: efficiency.ordersFromVisits
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Visit Completion Rates</CardTitle>
          <CardDescription>Planned vs completed visits by salesperson</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  fontSize={12}
                  angle={-45}
                  textAnchor="end"
                  height={80}
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
                <Bar 
                  dataKey="planned" 
                  fill="#94a3b8" 
                  name="Planned Visits"
                  radius={[2, 2, 0, 0]}
                />
                <Bar 
                  dataKey="completed" 
                  fill="#3b82f6" 
                  name="Completed Visits"
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Visit Conversion Results</CardTitle>
          <CardDescription>Leads and orders generated from visits</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  fontSize={12}
                  angle={-45}
                  textAnchor="end"
                  height={80}
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
                <Bar 
                  dataKey="leads" 
                  fill="#10b981" 
                  name="Leads Generated"
                  radius={[2, 2, 0, 0]}
                />
                <Bar 
                  dataKey="orders" 
                  fill="#f59e0b" 
                  name="Orders Created"
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

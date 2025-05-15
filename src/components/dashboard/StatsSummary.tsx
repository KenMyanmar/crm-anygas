
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

interface StatusCount {
  status: string;
  count: number;
}

interface StatsSummaryProps {
  statusCounts: StatusCount[];
}

const getStatusColor = (status: string): string => {
  switch(status) {
    case 'NEW':
      return '#3b82f6'; // blue-500
    case 'CONTACTED':
      return '#8b5cf6'; // purple-500
    case 'NEEDS_FOLLOW_UP':
      return '#f59e0b'; // amber-500
    case 'TRIAL':
      return '#f97316'; // orange-500
    case 'NEGOTIATION':
      return '#14b8a6'; // teal-500
    case 'WON':
      return '#22c55e'; // green-500
    case 'LOST':
      return '#ef4444'; // red-500
    case 'ON_HOLD':
      return '#6b7280'; // gray-500
    default:
      return '#9ca3af'; // gray-400
  }
};

const formatStatus = (status: string): string => {
  return status.toLowerCase().replace('_', ' ');
};

const StatsSummary = ({ statusCounts }: StatsSummaryProps) => {
  // Calculate total leads
  const totalLeads = statusCounts.reduce((sum, item) => sum + item.count, 0);
  
  // Transform data for the chart
  const chartData = statusCounts.map(item => ({
    name: formatStatus(item.status),
    value: item.count,
    status: item.status
  }));
  
  // Create a card for each status with count and percentage
  const statusCards = statusCounts.map(item => {
    const percentage = Math.round((item.count / totalLeads) * 100) || 0;
    const statusColor = getStatusColor(item.status);
    
    return (
      <div key={item.status} className="bg-white rounded-lg border p-3 shadow-sm">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full`} style={{backgroundColor: statusColor}}></div>
          <h3 className="text-sm font-medium capitalize">{formatStatus(item.status)}</h3>
        </div>
        <div className="mt-1.5 flex items-baseline">
          <p className="text-2xl font-semibold">{item.count}</p>
          <p className="ml-2 text-xs text-muted-foreground">({percentage}%)</p>
        </div>
      </div>
    );
  });
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-8">
        <Card>
          <CardContent className="pt-6">
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 0,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis 
                    dataKey="name"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={{ stroke: '#e5e7eb' }}
                  />
                  <YAxis 
                    allowDecimals={false}
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip 
                    cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white shadow-md rounded p-3 border">
                            <p className="capitalize font-medium">{data.name}</p>
                            <p className="text-sm">
                              Count: <span className="font-medium">{data.value}</span>
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={getStatusColor(entry.status)} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="lg:col-span-4">
        <div className="grid gap-3 auto-rows-fr h-full">
          {statusCards}
        </div>
      </div>
    </div>
  );
};

export default StatsSummary;

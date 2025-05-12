
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: number | string;
  description?: string;
  icon?: ReactNode;
  iconColor?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const StatCard = ({ title, value, description, icon, iconColor, trend }: StatCardProps) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          {icon && (
            <div className={`rounded-md p-1.5 ${iconColor || 'text-foreground'}`}>
              {icon}
            </div>
          )}
        </div>
        <div className="text-3xl font-bold">{value}</div>
        {description && (
          <CardDescription className="mt-2">{description}</CardDescription>
        )}
        {trend && (
          <div className="flex items-center mt-2">
            <div
              className={`mr-1 ${
                trend.isPositive ? 'text-green-500' : 'text-red-500'
              }`}
            >
              {trend.isPositive ? '↑' : '↓'}
            </div>
            <div
              className={`text-sm ${
                trend.isPositive ? 'text-green-500' : 'text-red-500'
              }`}
            >
              {trend.value}%
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StatCard;

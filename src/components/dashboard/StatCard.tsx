
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: ReactNode;
  footer?: ReactNode;
  className?: string;
}

const StatCard = ({ 
  title, 
  value, 
  description, 
  icon, 
  footer,
  className = ""
}: StatCardProps) => {
  return (
    <Card className={`stats-card ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && <CardDescription>{description}</CardDescription>}
      </CardContent>
      {footer && <CardFooter className="pt-1">{footer}</CardFooter>}
    </Card>
  );
};

export default StatCard;

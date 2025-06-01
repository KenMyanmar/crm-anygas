
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DashboardLayout from '@/components/layouts/DashboardLayout';

const NewCallPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const restaurantId = searchParams.get('restaurantId');

  const handleCancel = () => {
    if (restaurantId) {
      navigate(`/restaurants/${restaurantId}`);
    } else {
      navigate('/leads/meetings');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={handleCancel}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Log New Call</h1>
            <p className="text-muted-foreground">
              Record a call with a restaurant
            </p>
          </div>
        </div>

        {/* Placeholder for future call form */}
        <Card className="max-w-4xl">
          <CardHeader>
            <CardTitle>Call Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="py-8 text-center text-muted-foreground">
              <p>Call logging form will be implemented here.</p>
              {restaurantId && (
                <p className="mt-2">Restaurant ID: {restaurantId}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default NewCallPage;

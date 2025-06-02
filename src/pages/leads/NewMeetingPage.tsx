import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import MeetingForm from '@/components/leads/MeetingForm';

const NewMeetingPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const restaurantId = searchParams.get('restaurantId');

  const handleMeetingCreated = () => {
    navigate('/leads/meetings');
  };

  const handleCancel = () => {
    if (restaurantId) {
      navigate(`/restaurants/${restaurantId}`);
    } else {
      navigate('/leads/meetings');
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" onClick={handleCancel}>
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Schedule New Meeting</h1>
          <p className="text-muted-foreground">
            Create a new meeting with a restaurant
          </p>
        </div>
      </div>

      {/* Form */}
      <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle>Meeting Details</CardTitle>
        </CardHeader>
        <CardContent>
          <MeetingForm 
            onComplete={handleMeetingCreated}
            initialData={restaurantId ? { restaurant_id: restaurantId } : undefined}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default NewMeetingPage;

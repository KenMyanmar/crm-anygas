import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const CallDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/leads/meetings')}>
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Meetings
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Call Details</h1>
          <p className="text-muted-foreground">
            Call ID: {id}
          </p>
        </div>
      </div>

      {/* Placeholder for future call details */}
      <Card>
        <CardHeader>
          <CardTitle>Call Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center text-muted-foreground">
            <p>Call details will be implemented here.</p>
            <p className="mt-2">Call ID: {id}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CallDetailPage;


import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUcoCollectionPlans } from '@/hooks/useUcoCollectionPlans';
import { useAuth } from '@/context/AuthContext';
import { Truck, Plus, Calendar, MapPin, Users, Search, Filter } from 'lucide-react';
import { format } from 'date-fns';

const UcoCollectionDashboard = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { plans, isLoading } = useUcoCollectionPlans();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [townshipFilter, setTownshipFilter] = useState('all');

  const handleCreatePlan = () => {
    navigate('/uco/planner/new');
  };

  const handlePlanClick = (planId: string) => {
    navigate(`/uco/plans/${planId}`);
  };

  const filteredPlans = plans?.filter(plan => {
    const matchesSearch = plan.plan_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plan.township.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTownship = townshipFilter === 'all' || plan.township === townshipFilter;
    return matchesSearch && matchesTownship;
  }) || [];

  const uniqueTownships = [...new Set(plans?.map(plan => plan.township) || [])];

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-64"></div>
          <div className="grid gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">UCO Collection Plans</h1>
          <p className="text-muted-foreground">
            Manage and track your Used Cooking Oil collection operations
          </p>
        </div>
        <Button onClick={handleCreatePlan} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>New Collection Plan</span>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search plans..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={townshipFilter} onValueChange={setTownshipFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by township" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Townships</SelectItem>
                {uniqueTownships.map(township => (
                  <SelectItem key={township} value={township}>{township}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Plans Grid */}
      <div className="grid gap-4">
        {filteredPlans.length > 0 ? (
          filteredPlans.map((plan) => (
            <Card 
              key={plan.id} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handlePlanClick(plan.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <Truck className="h-5 w-5 text-blue-600" />
                      <h3 className="text-lg font-semibold">{plan.plan_name}</h3>
                      <Badge variant="outline">
                        {new Date(plan.plan_date).toLocaleDateString()}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                      <span className="flex items-center space-x-1">
                        <MapPin className="h-4 w-4" />
                        <span>{plan.township}</span>
                      </span>
                      {plan.driver_name && (
                        <span className="flex items-center space-x-1">
                          <Users className="h-4 w-4" />
                          <span>{plan.driver_name}</span>
                        </span>
                      )}
                      <span className="flex items-center space-x-1">
                        <Truck className="h-4 w-4" />
                        <span>{plan.truck_capacity_kg}kg capacity</span>
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <p className="text-sm font-medium">Created</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(plan.created_at), 'MMM dd, yyyy')}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm">
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Truck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Collection Plans Found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || townshipFilter !== 'all' 
                  ? 'Try adjusting your search filters'
                  : 'Create your first UCO collection plan to get started'
                }
              </p>
              {!searchTerm && townshipFilter === 'all' && (
                <Button onClick={handleCreatePlan}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Plan
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default UcoCollectionDashboard;

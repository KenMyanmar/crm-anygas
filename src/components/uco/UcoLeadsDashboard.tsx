
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Building2, 
  MapPin, 
  Calendar, 
  TrendingUp, 
  Search,
  Filter,
  Eye,
  Edit,
  Route
} from 'lucide-react';
import { useRestaurants } from '@/hooks/useRestaurants';

const UcoLeadsDashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [volumeFilter, setVolumeFilter] = useState('all');
  const { restaurants, isLoading } = useRestaurants();
  const navigate = useNavigate();

  // Filter for UCO-related restaurants
  const ucoLeads = restaurants?.filter(restaurant => {
    const matchesSearch = restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         restaurant.township?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || restaurant.uco_supplier_status === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  const handleRestaurantClick = (restaurantId: string) => {
    navigate(`/restaurants/${restaurantId}`);
  };

  const handleEditRestaurant = (restaurantId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/restaurants/${restaurantId}/edit`);
  };

  const handleViewRestaurant = (restaurantId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/restaurants/${restaurantId}`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active_supplier':
        return <Badge className="bg-green-100 text-green-800">Active Supplier</Badge>;
      case 'potential_supplier':
        return <Badge className="bg-yellow-100 text-yellow-800">Potential</Badge>;
      case 'inactive_supplier':
        return <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>;
      case 'not_assessed':
      default:
        return <Badge variant="outline">Not Assessed</Badge>;
    }
  };

  const getVolumeBadge = (volume: number | null) => {
    if (!volume || volume === 0) return <Badge variant="outline">Unknown</Badge>;
    if (volume >= 50) return <Badge className="bg-green-100 text-green-800">High (50+ L)</Badge>;
    if (volume >= 20) return <Badge className="bg-blue-100 text-blue-800">Medium (20-50 L)</Badge>;
    return <Badge className="bg-orange-100 text-orange-800">Low (&lt;20 L)</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="h-4 w-4" />
            <span>UCO Leads Management</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search Restaurants</label>
              <Input
                placeholder="Search by name or township..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">UCO Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active_supplier">Active Suppliers</SelectItem>
                  <SelectItem value="potential_supplier">Potential Suppliers</SelectItem>
                  <SelectItem value="inactive_supplier">Inactive Suppliers</SelectItem>
                  <SelectItem value="not_assessed">Not Assessed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Volume Category</label>
              <Select value={volumeFilter} onValueChange={setVolumeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Volumes</SelectItem>
                  <SelectItem value="high">High Volume (50+ L)</SelectItem>
                  <SelectItem value="medium">Medium Volume (20-50 L)</SelectItem>
                  <SelectItem value="low">Low Volume (&lt;20 L)</SelectItem>
                  <SelectItem value="unknown">Unknown Volume</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* UCO Leads Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Building2 className="h-4 w-4" />
              <span>UCO Collection Prospects</span>
              <Badge variant="outline">{ucoLeads.length} leads</Badge>
            </div>
            <Button size="sm" variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Advanced Filters
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p>Loading UCO leads...</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Restaurant</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>UCO Status</TableHead>
                    <TableHead>Est. Volume</TableHead>
                    <TableHead>Last Collection</TableHead>
                    <TableHead>Collection Route</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ucoLeads.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No UCO leads found. Start by discovering new restaurants or updating existing ones.
                      </TableCell>
                    </TableRow>
                  ) : (
                    ucoLeads.map((restaurant) => (
                      <TableRow key={restaurant.id} className="hover:bg-muted/50 cursor-pointer">
                        <TableCell onClick={() => handleRestaurantClick(restaurant.id)}>
                          <div className="hover:text-blue-600 transition-colors">
                            <p className="font-medium">{restaurant.name}</p>
                            <p className="text-sm text-muted-foreground">{restaurant.contact_person}</p>
                          </div>
                        </TableCell>
                        <TableCell onClick={() => handleRestaurantClick(restaurant.id)}>
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">{restaurant.township}</span>
                          </div>
                        </TableCell>
                        <TableCell onClick={() => handleRestaurantClick(restaurant.id)}>
                          {getStatusBadge(restaurant.uco_supplier_status || 'not_assessed')}
                        </TableCell>
                        <TableCell onClick={() => handleRestaurantClick(restaurant.id)}>
                          {getVolumeBadge(restaurant.avg_uco_volume_kg)}
                        </TableCell>
                        <TableCell onClick={() => handleRestaurantClick(restaurant.id)}>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">
                              {restaurant.last_uco_collection_date 
                                ? new Date(restaurant.last_uco_collection_date).toLocaleDateString()
                                : 'Never'
                              }
                            </span>
                          </div>
                        </TableCell>
                        <TableCell onClick={() => handleRestaurantClick(restaurant.id)}>
                          <Badge variant="outline" className="text-xs">
                            <Route className="h-3 w-3 mr-1" />
                            Route TBD
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-1">
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={(e) => handleViewRestaurant(restaurant.id, e)}
                              title="View restaurant details"
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={(e) => handleEditRestaurant(restaurant.id, e)}
                              title="Edit restaurant"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <p className="font-medium">Collection Planning</p>
            <p className="text-xs text-muted-foreground">Plan optimal collection routes</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-4 text-center">
            <Route className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <p className="font-medium">Route Optimization</p>
            <p className="text-xs text-muted-foreground">Optimize existing routes</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-4 text-center">
            <Building2 className="h-8 w-8 mx-auto mb-2 text-purple-600" />
            <p className="font-medium">Lead Scoring</p>
            <p className="text-xs text-muted-foreground">Analyze lead potential</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UcoLeadsDashboard;


import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Trash2, Eye, RefreshCw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { findDuplicateRestaurants, removeDuplicateRestaurant } from '@/utils/duplicateUtils';

interface DuplicateGroup {
  id: string;
  restaurants: any[];
  confidence: 'high' | 'medium' | 'low';
  reason: string;
}

const DuplicateManager = () => {
  const [duplicateGroups, setDuplicateGroups] = useState<DuplicateGroup[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<DuplicateGroup | null>(null);

  const scanForDuplicates = async () => {
    setIsLoading(true);
    try {
      const duplicates = await findDuplicateRestaurants();
      setDuplicateGroups(duplicates);
      
      toast({
        title: "Scan Complete",
        description: `Found ${duplicates.length} potential duplicate groups`,
      });
    } catch (error: any) {
      toast({
        title: "Scan Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveDuplicate = async (keepId: string, removeIds: string[]) => {
    try {
      await removeDuplicateRestaurant(keepId, removeIds);
      
      // Refresh the list
      await scanForDuplicates();
      
      toast({
        title: "Duplicates Removed",
        description: `Removed ${removeIds.length} duplicate restaurant(s)`,
      });
    } catch (error: any) {
      toast({
        title: "Removal Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    scanForDuplicates();
  }, []);

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Copy className="h-5 w-5" />
            Duplicate Restaurant Manager
          </CardTitle>
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground">
              Automatically detect and remove duplicate restaurant entries
            </p>
            <Button onClick={scanForDuplicates} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Scanning...' : 'Refresh Scan'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {duplicateGroups.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {isLoading ? 'Scanning for duplicates...' : 'No duplicates found'}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground mb-4">
                Found {duplicateGroups.length} potential duplicate groups
              </div>
              
              {duplicateGroups.map((group) => (
                <Card key={group.id} className="border-l-4 border-l-yellow-500">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Badge variant={getConfidenceColor(group.confidence)}>
                          {group.confidence} confidence
                        </Badge>
                        <span className="text-sm text-muted-foreground">{group.reason}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedGroup(group)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              <Trash2 className="h-4 w-4 mr-1" />
                              Remove Duplicates
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remove Duplicate Restaurants</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will keep the most complete record and remove {group.restaurants.length - 1} duplicate(s). 
                                All orders, leads, and visits will be transferred to the kept record.
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => {
                                  const keepId = group.restaurants[0].id;
                                  const removeIds = group.restaurants.slice(1).map(r => r.id);
                                  handleRemoveDuplicate(keepId, removeIds);
                                }}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Remove Duplicates
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                    
                    <div className="grid gap-2">
                      {group.restaurants.map((restaurant, index) => (
                        <div key={restaurant.id} className="flex items-center justify-between p-2 bg-muted rounded">
                          <div>
                            <span className="font-medium">{restaurant.name}</span>
                            {restaurant.township && (
                              <span className="text-sm text-muted-foreground ml-2">
                                - {restaurant.township}
                              </span>
                            )}
                            {index === 0 && (
                              <Badge variant="outline" className="ml-2">Will Keep</Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {restaurant.phone || 'No phone'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedGroup && (
        <Card>
          <CardHeader>
            <CardTitle>Duplicate Group Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Confidence:</strong> {selectedGroup.confidence}
                </div>
                <div>
                  <strong>Reason:</strong> {selectedGroup.reason}
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">Restaurant Details:</h4>
                {selectedGroup.restaurants.map((restaurant, index) => (
                  <div key={restaurant.id} className="p-3 border rounded">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div><strong>Name:</strong> {restaurant.name}</div>
                      <div><strong>Township:</strong> {restaurant.township || 'N/A'}</div>
                      <div><strong>Phone:</strong> {restaurant.phone || 'N/A'}</div>
                      <div><strong>Contact:</strong> {restaurant.contact_person || 'N/A'}</div>
                      <div className="col-span-2">
                        <strong>Address:</strong> {restaurant.address || 'N/A'}
                      </div>
                    </div>
                    {index === 0 && (
                      <Badge variant="outline" className="mt-2">
                        Will be kept (most complete record)
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
              
              <Button onClick={() => setSelectedGroup(null)} variant="outline">
                Close Details
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DuplicateManager;

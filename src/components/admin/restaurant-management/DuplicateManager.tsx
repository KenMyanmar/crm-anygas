
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Copy, Trash2, Eye, RefreshCw, Zap, AlertTriangle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { findDuplicateRestaurants, removeAllExactDuplicates, removeDuplicateRestaurant, DuplicateGroup, DuplicateStats } from '@/utils/duplicateUtils';

const DuplicateManager = () => {
  const [duplicateGroups, setDuplicateGroups] = useState<DuplicateGroup[]>([]);
  const [stats, setStats] = useState<DuplicateStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processProgress, setProcessProgress] = useState(0);
  const [processMessage, setProcessMessage] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<DuplicateGroup | null>(null);

  const scanForDuplicates = async () => {
    setIsLoading(true);
    try {
      const result = await findDuplicateRestaurants();
      setDuplicateGroups(result.groups);
      setStats(result.stats);
      
      toast({
        title: "Scan Complete",
        description: `Found ${result.stats.exactDuplicates} exact duplicates and ${result.stats.similarRestaurants} similar restaurants`,
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

  const handleRemoveAllExactDuplicates = async () => {
    setIsProcessing(true);
    setProcessProgress(0);
    setProcessMessage('Starting...');
    
    try {
      const result = await removeAllExactDuplicates((progress, message) => {
        setProcessProgress(progress);
        setProcessMessage(message);
      });
      
      if (result.success) {
        toast({
          title: "Bulk Removal Complete",
          description: result.message,
        });
        
        // Refresh the list
        await scanForDuplicates();
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      toast({
        title: "Bulk Removal Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setProcessProgress(0);
      setProcessMessage('');
    }
  };

  const handleRemoveIndividualDuplicate = async (keepId: string, removeIds: string[]) => {
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

  const exactGroups = duplicateGroups.filter(g => g.duplicateType === 'exact');
  const similarGroups = duplicateGroups.filter(g => g.duplicateType === 'similar');

  return (
    <div className="space-y-6">
      {/* Header Card with Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Copy className="h-5 w-5" />
            Smart Duplicate Restaurant Manager
          </CardTitle>
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground">
              Automatically detect and remove exact duplicates
            </p>
            <Button onClick={scanForDuplicates} disabled={isLoading || isProcessing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Scanning...' : 'Refresh Scan'}
            </Button>
          </div>
        </CardHeader>
        
        {stats && (
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{stats.exactDuplicates}</div>
                <div className="text-sm text-red-700">Exact Duplicates</div>
                <div className="text-xs text-muted-foreground">Auto-removable</div>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{stats.exactDuplicateGroups}</div>
                <div className="text-sm text-orange-700">Duplicate Groups</div>
                <div className="text-xs text-muted-foreground">Same name+township+phone</div>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{stats.similarRestaurants}</div>
                <div className="text-sm text-blue-700">Similar Names</div>
                <div className="text-xs text-muted-foreground">Likely chains</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{stats.totalRemovable}</div>
                <div className="text-sm text-green-700">Will Remove</div>
                <div className="text-xs text-muted-foreground">With auto-cleanup</div>
              </div>
            </div>

            {stats.exactDuplicates > 0 && (
              <div className="flex items-center gap-4">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" disabled={isProcessing}>
                      <Zap className="h-4 w-4 mr-2" />
                      Remove All {stats.exactDuplicates} Exact Duplicates
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Remove All Exact Duplicates</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will automatically remove {stats.exactDuplicates} duplicate restaurants that have:
                        <br />• Identical names
                        <br />• Identical townships  
                        <br />• Identical phone numbers
                        <br /><br />
                        The most complete record from each group will be kept.
                        All orders, leads, and visits will be transferred safely.
                        <br /><br />
                        <strong>This action cannot be undone.</strong>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleRemoveAllExactDuplicates}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Remove All Duplicates
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                {isProcessing && (
                  <div className="flex-1">
                    <div className="text-sm text-muted-foreground mb-1">{processMessage}</div>
                    <Progress value={processProgress} className="h-2" />
                  </div>
                )}
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Exact Duplicates Section */}
      {exactGroups.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Exact Duplicates ({exactGroups.length} groups)
            </CardTitle>
            <p className="text-muted-foreground">
              These restaurants have identical names, townships, and phone numbers
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {exactGroups.map((group) => (
              <Card key={group.id} className="border-l-4 border-l-red-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="destructive">Exact Match</Badge>
                      <span className="text-sm text-muted-foreground">{group.reason}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedGroup(group)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Details
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="h-4 w-4 mr-1" />
                            Remove {group.restaurants.length - 1} Duplicates
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remove Exact Duplicates</AlertDialogTitle>
                            <AlertDialogDescription>
                              Remove {group.restaurants.length - 1} duplicate(s) of "{group.restaurants[0].name}".
                              The most complete record will be kept and all data will be transferred.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => {
                                const keepId = group.restaurants[0].id;
                                const removeIds = group.restaurants.slice(1).map(r => r.id);
                                handleRemoveIndividualDuplicate(keepId, removeIds);
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
                          <span className="text-sm text-muted-foreground ml-2">
                            - {restaurant.township}
                          </span>
                          {index === 0 && (
                            <Badge variant="outline" className="ml-2">Will Keep</Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {restaurant.phone}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Similar Names Section */}
      {similarGroups.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-600">
              <Eye className="h-5 w-5" />
              Similar Names - Likely Chains ({similarGroups.length} groups)
            </CardTitle>
            <p className="text-muted-foreground">
              These restaurants have the same name and township but different phone numbers (likely legitimate chains)
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {similarGroups.map((group) => (
              <Card key={group.id} className="border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">Chain Restaurants</Badge>
                      <span className="text-sm text-muted-foreground">{group.reason}</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedGroup(group)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
                    </Button>
                  </div>
                  
                  <div className="grid gap-2">
                    {group.restaurants.map((restaurant) => (
                      <div key={restaurant.id} className="flex items-center justify-between p-2 bg-blue-50 rounded">
                        <div>
                          <span className="font-medium">{restaurant.name}</span>
                          <span className="text-sm text-muted-foreground ml-2">
                            - {restaurant.township}
                          </span>
                        </div>
                        <div className="text-sm font-medium text-blue-700">
                          {restaurant.phone || 'No phone'}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      )}

      {/* No Duplicates Found */}
      {!isLoading && duplicateGroups.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <div className="text-muted-foreground">
              No duplicates found! Your restaurant database is clean.
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detail Modal */}
      {selectedGroup && (
        <Card>
          <CardHeader>
            <CardTitle>Group Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Type:</strong> {selectedGroup.duplicateType === 'exact' ? 'Exact Duplicate' : 'Similar Names'}
                </div>
                <div>
                  <strong>Auto-removable:</strong> {selectedGroup.autoRemovable ? 'Yes' : 'No'}
                </div>
                <div className="col-span-2">
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
                    {selectedGroup.duplicateType === 'exact' && index === 0 && (
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

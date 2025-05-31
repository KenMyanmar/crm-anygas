
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, AlertTriangle, Shield } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { deleteAllRestaurants } from '@/utils/restaurantDeleteUtils';

const DeleteAllManager = () => {
  const [confirmText, setConfirmText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const CONFIRM_TEXT = 'DELETE ALL RESTAURANTS';

  const handleDeleteAll = async () => {
    if (confirmText !== CONFIRM_TEXT) {
      toast({
        title: "Confirmation Failed",
        description: `Please type "${CONFIRM_TEXT}" exactly`,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await deleteAllRestaurants();
      
      if (result.success) {
        toast({
          title: "Deletion Complete",
          description: `Deleted ${result.deletedCount} restaurants. Backup created.`,
        });
        setConfirmText('');
        setShowConfirmDialog(false);
      } else {
        toast({
          title: "Deletion Failed",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="h-5 w-5" />
            Delete All Restaurants
          </CardTitle>
          <div className="flex items-start gap-2 p-4 bg-destructive/10 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
            <div className="space-y-2">
              <p className="font-medium text-destructive">DANGER ZONE</p>
              <p className="text-sm text-muted-foreground">
                This action will permanently delete ALL restaurant records and their associated data.
                A backup will be created before deletion, but this action should only be used in extreme circumstances.
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-medium">What will be deleted:</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• All restaurant records</li>
              <li>• Associated orders and order items</li>
              <li>• All leads and meetings</li>
              <li>• Visit plans and tasks</li>
              <li>• Notes and call records</li>
              <li>• Voice notes and attachments</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium">Safety measures:</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Complete backup created before deletion</li>
              <li>• Audit log entry for tracking</li>
              <li>• Admin-only operation</li>
              <li>• Multiple confirmation required</li>
            </ul>
          </div>

          <div className="space-y-4 border-t pt-4">
            <div>
              <Label htmlFor="confirm-text">
                Type "{CONFIRM_TEXT}" to enable deletion
              </Label>
              <Input
                id="confirm-text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="Type the confirmation text exactly"
                className="mt-2"
              />
            </div>

            <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  disabled={confirmText !== CONFIRM_TEXT || isLoading}
                  className="w-full"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {isLoading ? 'Deleting...' : 'DELETE ALL RESTAURANTS'}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                    <Shield className="h-5 w-5" />
                    Final Confirmation Required
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    You are about to permanently delete ALL restaurant data in the system.
                    This includes all associated orders, leads, visits, and notes.
                    
                    <br /><br />
                    
                    A complete backup will be created, but this action is irreversible through the normal interface.
                    
                    <br /><br />
                    
                    <strong>Are you absolutely certain you want to proceed?</strong>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel - Keep Data Safe</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAll}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    YES - DELETE EVERYTHING
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeleteAllManager;

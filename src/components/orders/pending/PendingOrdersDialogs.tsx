
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface PendingOrder {
  id: string;
  order_number: string;
  order_date: string;
  total_amount_kyats: number;
  status: string;
  restaurant: {
    id: string;
    name: string;
    township: string;
  };
  created_by_user: {
    full_name: string;
  } | null;
}

interface PendingOrdersDialogsProps {
  selectedOrder: PendingOrder | null;
  showApproveDialog: boolean;
  showRejectDialog: boolean;
  showDeleteDialog: boolean;
  onApproveDialogChange: (open: boolean) => void;
  onRejectDialogChange: (open: boolean) => void;
  onDeleteDialogChange: (open: boolean) => void;
  onConfirmApprove: () => void;
  onConfirmReject: () => void;
  onConfirmDelete: () => void;
}

const PendingOrdersDialogs = ({
  selectedOrder,
  showApproveDialog,
  showRejectDialog,
  showDeleteDialog,
  onApproveDialogChange,
  onRejectDialogChange,
  onDeleteDialogChange,
  onConfirmApprove,
  onConfirmReject,
  onConfirmDelete
}: PendingOrdersDialogsProps) => {
  return (
    <>
      {/* Approve Dialog */}
      <AlertDialog open={showApproveDialog} onOpenChange={onApproveDialogChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve Order</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to approve order {selectedOrder?.order_number}? 
              This will move the order to confirmed status and allow it to proceed to delivery.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={onConfirmApprove}
              className="bg-green-500 hover:bg-green-600"
            >
              Yes, approve order
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Dialog */}
      <AlertDialog open={showRejectDialog} onOpenChange={onRejectDialogChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Order</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reject order {selectedOrder?.order_number}? 
              This will cancel the order and it cannot be easily undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={onConfirmReject}
              className="bg-red-500 hover:bg-red-600"
            >
              Yes, reject order
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={onDeleteDialogChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Order</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete order {selectedOrder?.order_number}? 
              This action cannot be undone and will remove all order data including items.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={onConfirmDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              Yes, delete permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default PendingOrdersDialogs;

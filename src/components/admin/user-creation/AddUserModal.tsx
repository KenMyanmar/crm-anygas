
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useUserCreation } from './hooks/useUserCreation';
import CreateUserForm from './CreateUserForm';
import UserCredentialsDialog from './UserCredentialsDialog';
import { AddUserModalProps } from '../types/userTypes';

const AddUserModal = ({ open, onOpenChange, onUserCreated }: AddUserModalProps) => {
  const { isProcessing, createdCredentials, handleSubmit, resetState } = useUserCreation(onUserCreated);

  const handleClose = () => {
    resetState();
    onOpenChange(false);
  };

  // Show success dialog if credentials are created
  if (createdCredentials) {
    return (
      <UserCredentialsDialog
        open={open}
        credentials={createdCredentials}
        onClose={handleClose}
      />
    );
  }

  // Main create user dialog
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
          <DialogDescription>
            Create a new user account with enhanced cleanup to prevent UUID collisions.
          </DialogDescription>
        </DialogHeader>
        <CreateUserForm
          onSubmit={handleSubmit}
          isProcessing={isProcessing}
          onCancel={handleClose}
        />
      </DialogContent>
    </Dialog>
  );
};

export default AddUserModal;

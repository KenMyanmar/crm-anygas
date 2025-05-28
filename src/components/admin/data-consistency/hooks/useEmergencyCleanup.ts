
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { completeNuclearCleanup } from '../../services/userCleanupService';

export const useEmergencyCleanup = () => {
  const [emergencyEmail, setEmergencyEmail] = useState('');
  const [isEmergencyCleanup, setIsEmergencyCleanup] = useState(false);
  const { toast } = useToast();

  const performEmergencyCleanup = async (email: string) => {
    console.log('=== EMERGENCY CLEANUP ===');
    console.log('Target email:', email);

    try {
      const cleanEmail = email.trim().toLowerCase();
      
      if (!cleanEmail) {
        throw new Error('Email is required');
      }

      await completeNuclearCleanup(cleanEmail);

      // Verification
      const { data: verifyAuth } = await (await import('../../services/supabaseAdmin')).adminClient.auth.admin.listUsers();
      const remainingAuth = verifyAuth.users.filter(user => 
        user.email?.toLowerCase() === cleanEmail
      );

      const { data: verifyProfiles } = await (await import('../../services/supabaseAdmin')).adminClient
        .from('users')
        .select('*')
        .ilike('email', cleanEmail);

      console.log('Cleanup results:', {
        remainingAuth: remainingAuth.length,
        remainingProfiles: verifyProfiles?.length || 0
      });

      if (remainingAuth.length === 0 && (!verifyProfiles || verifyProfiles.length === 0)) {
        toast({
          description: `Emergency cleanup successful for ${email}`,
        });
      } else {
        toast({
          title: "Partial cleanup",
          description: `Some records may still exist: ${remainingAuth.length} auth, ${verifyProfiles?.length || 0} profiles`,
          variant: "destructive",
        });
      }

    } catch (error: any) {
      console.error('Emergency cleanup failed:', error);
      toast({
        title: "Emergency cleanup failed",
        description: error.message || 'Failed to cleanup user data',
        variant: "destructive",
      });
    }
  };

  const handleEmergencyCleanup = async () => {
    if (!emergencyEmail.trim()) return;
    
    setIsEmergencyCleanup(true);
    try {
      await performEmergencyCleanup(emergencyEmail);
    } finally {
      setIsEmergencyCleanup(false);
      setEmergencyEmail('');
    }
  };

  return {
    emergencyEmail,
    setEmergencyEmail,
    isEmergencyCleanup,
    handleEmergencyCleanup
  };
};

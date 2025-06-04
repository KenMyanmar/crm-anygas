
import { supabase } from '@/lib/supabase';

export const getUserRole = async (): Promise<string> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return 'anonymous';

    const { data, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (error || !data) {
      console.error('Error fetching user role:', error);
      return 'salesperson'; // Default fallback
    }

    return data.role;
  } catch (error) {
    console.error('Error getting user role:', error);
    return 'salesperson';
  }
};

export const canApproveOrders = (role: string): boolean => {
  return ['admin', 'manager'].includes(role);
};

export const canManageOrders = (role: string): boolean => {
  return ['admin', 'manager'].includes(role);
};

export const canViewAllData = (role: string): boolean => {
  return ['admin', 'manager'].includes(role);
};

export const canManageUsers = (role: string): boolean => {
  return role === 'admin';
};

// Adding the missing functions that components are trying to import
export const hasAdminAccess = (role: string | undefined): boolean => {
  return role === 'admin';
};

export const isAdminOrManager = (role: string | undefined): boolean => {
  return ['admin', 'manager'].includes(role || '');
};

// New function for deleting delivered orders - admin only
export const canDeleteDeliveredOrders = (role: string | undefined): boolean => {
  return role === 'admin';
};

// New function for deleting pending orders - admin only  
export const canDeletePendingOrders = (role: string | undefined): boolean => {
  return role === 'admin';
};

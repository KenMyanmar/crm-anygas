
import { supabase } from '@/lib/supabase';

export const checkUserRole = async (userId: string): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error checking user role:', error);
      return null;
    }

    return data?.role || null;
  } catch (error) {
    console.error('Error in checkUserRole:', error);
    return null;
  }
};

export const canApproveOrders = (role: string | null): boolean => {
  return role === 'admin' || role === 'manager';
};

export const canManageUsers = (role: string | null): boolean => {
  return role === 'admin';
};

export const isAdminOrManager = (role: string | null): boolean => {
  return role === 'admin' || role === 'manager';
};

export const hasAdminAccess = (role: string | null): boolean => {
  return isAdminOrManager(role);
};

export const getUserRole = async (): Promise<string | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    
    return await checkUserRole(user.id);
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
};

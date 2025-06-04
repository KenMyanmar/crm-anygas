
import { supabase } from '@/lib/supabase';

export const getUserRole = async (): Promise<string> => {
  try {
    console.log('📋 getUserRole: Fetching current user...');
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.log('⚠️ getUserRole: No authenticated user found, returning "anonymous"');
      return 'anonymous';
    }
    
    console.log(`✅ getUserRole: Found authenticated user with ID: ${user.id}`);
    
    const { data, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (error || !data) {
      console.error('❌ getUserRole: Error fetching user role:', error);
      console.log('⚠️ getUserRole: Falling back to default role "salesperson"');
      return 'salesperson'; // Default fallback
    }

    console.log(`🔑 getUserRole: Successfully retrieved role: "${data.role}" for user: ${user.id}`);
    return data.role;
  } catch (error) {
    console.error('❌ getUserRole: Unexpected error:', error);
    console.log('⚠️ getUserRole: Falling back to default role "salesperson" after error');
    return 'salesperson';
  }
};

export const canApproveOrders = (role: string): boolean => {
  const result = ['admin', 'manager'].includes(role);
  console.log(`🔐 canApproveOrders check for role "${role}": ${result}`);
  return result;
};

export const canManageOrders = (role: string): boolean => {
  const result = ['admin', 'manager'].includes(role);
  console.log(`🔐 canManageOrders check for role "${role}": ${result}`);
  return result;
};

export const canViewAllData = (role: string): boolean => {
  const result = ['admin', 'manager'].includes(role);
  console.log(`🔐 canViewAllData check for role "${role}": ${result}`);
  return result;
};

export const canManageUsers = (role: string): boolean => {
  const result = role === 'admin';
  console.log(`🔐 canManageUsers check for role "${role}": ${result}`);
  return result;
};

// Adding the missing functions that components are trying to import
export const hasAdminAccess = (role: string | undefined): boolean => {
  const result = role === 'admin';
  console.log(`🔐 hasAdminAccess check for role "${role}": ${result}`);
  return result;
};

export const isAdminOrManager = (role: string | undefined): boolean => {
  const result = ['admin', 'manager'].includes(role || '');
  console.log(`🔐 isAdminOrManager check for role "${role}": ${result}`);
  return result;
};

// New function for deleting delivered orders - admin only
export const canDeleteDeliveredOrders = (role: string | undefined): boolean => {
  const result = role === 'admin';
  console.log(`🔐 canDeleteDeliveredOrders check for role "${role}": ${result}`);
  console.log(`🔍 canDeleteDeliveredOrders details:`, {
    role,
    expectedResult: role === 'admin',
    isStringComparison: typeof role === 'string',
    actualResult: result
  });
  return result;
};

// New function for deleting pending orders - admin only  
export const canDeletePendingOrders = (role: string | undefined): boolean => {
  const result = role === 'admin';
  console.log(`🔐 canDeletePendingOrders check for role "${role}": ${result}`);
  return result;
};

export type UserRole = 'admin' | 'manager' | 'salesperson' | 'staff';

export type LeadStatus = 'CONTACT_STAGE' | 'MEETING_STAGE' | 'PRESENTATION_NEGOTIATION' | 'CLOSED_WON' | 'CLOSED_LOST';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  profile_pic_url?: string;
  must_reset_pw?: boolean;
}

export interface Restaurant {
  id: string;
  name: string;
  township?: string;
  address?: string;
  maps_link?: string;
  contact_person?: string;
  phone?: string;
  phone_secondary?: string;
  remarks?: string;
  created_at: string;
  updated_at: string;
  created_by_user_id?: string;
  salesperson_id?: string;
}

export interface Lead {
  id: string;
  restaurant_id: string;
  status: LeadStatus;
  lost_reason?: string;
  next_action_description?: string;
  next_action_date?: string;
  assigned_to_user_id?: string;
  created_at: string;
  updated_at: string;
  created_by_user_id?: string;
  restaurant?: Restaurant;
  assigned_user?: User;
}

export interface Product {
  id: string;
  name: string;
  cylinder_size_kg: number;
  brand: string;
  default_price_kyats: number;
  is_active: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  restaurant_id: string;
  lead_id?: string;
  order_date: string;
  delivery_date_scheduled?: string;
  delivery_date_actual?: string;
  status: 'PENDING_CONFIRMATION' | 'CONFIRMED' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';
  total_amount_kyats: number;
  notes?: string;
  created_by_user_id: string;
  created_at: string;
  updated_at: string;
  order_number: string;
  restaurant?: Restaurant;
  lead?: Lead;
  created_by_user?: User;
  order_items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price_kyats: number;
  sub_total_kyats: number;
  created_at: string;
  product_name: string;
  product?: Product;
}

export interface CallLog {
  id: string;
  lead_id?: string;
  restaurant_id?: string;
  logged_by_user_id: string;
  call_timestamp: string;
  call_type: 'OUTBOUND' | 'INBOUND';
  call_outcome?: string;
  notes?: string;
  created_at: string;
  lead?: Lead;
  restaurant?: Restaurant;
  logged_by_user?: User;
}

export interface ActivityLog {
  id: string;
  user_id?: string;
  target_id?: string;
  target_type?: 'LEAD' | 'ORDER' | 'RESTAURANT' | 'USER' | 'CALL_LOG' | 'SYSTEM';
  activity_message: string;
  created_at: string;
  user?: User;
}

export interface UserNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  created_at: string;
}

export interface DashboardData {
  lead_summary: Array<{
    status: LeadStatus;
    count: number;
  }>;
  upcoming_actions: Array<{
    id: string;
    restaurant_name: string;
    next_action_description: string;
    next_action_date: string;
    status: LeadStatus;
  }>;
  recent_activity: ActivityLog[];
  notifications: UserNotification[];
}

export interface Meeting {
  id: string;
  lead_id: string;
  scheduled_by_user_id: string;
  meeting_date: string;
  meeting_time: string;
  location?: string;
  agenda?: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED';
  notes?: string;
  created_at: string;
  updated_at: string;
  lead?: Lead;
  scheduled_by_user?: User;
}

// Legacy status mapping utility (for backward compatibility)
export const legacyStatusToNew = (legacyStatus: string): LeadStatus => {
  switch (legacyStatus) {
    case 'NEW':
    case 'CONTACTED':
      return 'CONTACT_STAGE';
    case 'NEEDS_FOLLOW_UP':
    case 'TRIAL':
      return 'MEETING_STAGE';
    case 'NEGOTIATION':
      return 'PRESENTATION_NEGOTIATION';
    case 'WON':
      return 'CLOSED_WON';
    case 'LOST':
    case 'ON_HOLD':
      return 'CLOSED_LOST';
    default:
      return 'CONTACT_STAGE';
  }
};

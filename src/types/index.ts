
export type UserRole = 'admin' | 'salesperson' | 'staff';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface Restaurant {
  id: string;
  name: string;
  township?: string;
  address?: string;
  maps_link?: string;
  contact_person_name?: string;
  phone_primary: string;
  phone_secondary?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  created_by_user_id?: string;
}

export type LeadStatus = 'NEW' | 'CONTACTED' | 'NEEDS_FOLLOW_UP' | 'TRIAL' | 'NEGOTIATION' | 'WON' | 'LOST' | 'ON_HOLD';

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
  restaurant?: Restaurant; // Join field, not in DB schema
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

export type OrderStatus = 'PENDING_CONFIRMATION' | 'CONFIRMED' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';

export interface Order {
  id: string;
  restaurant_id: string;
  lead_id?: string;
  order_date: string;
  delivery_date_scheduled?: string;
  delivery_date_actual?: string;
  status: OrderStatus;
  total_amount_kyats: number;
  notes?: string;
  created_by_user_id: string;
  created_at: string;
  updated_at: string;
  restaurant?: Restaurant; // Join field, not in DB schema
  items?: OrderItem[]; // Related items, not in DB schema
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price_kyats: number;
  sub_total_kyats: number;
  created_at: string;
  product?: Product; // Join field, not in DB schema
}

export type CallType = 'OUTBOUND' | 'INBOUND';

export interface CallLog {
  id: string;
  lead_id?: string;
  restaurant_id?: string;
  logged_by_user_id: string;
  call_timestamp: string;
  call_type: CallType;
  call_outcome?: string;
  notes?: string;
  created_at: string;
  restaurant?: Restaurant; // Join field, not in DB schema
  lead?: Lead; // Join field, not in DB schema
}

export type ActivityTargetType = 'LEAD' | 'ORDER' | 'RESTAURANT' | 'USER' | 'CALL_LOG' | 'SYSTEM';

export interface ActivityLog {
  id: string;
  user_id?: string;
  target_id?: string;
  target_type?: ActivityTargetType;
  activity_message: string;
  created_at: string;
  user?: User; // Join field, not in DB schema
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
  leadSummary: {
    status: LeadStatus;
    count: number;
  }[];
  upcomingActions: {
    id: string;
    restaurant_name: string;
    next_action_description: string;
    next_action_date: string;
    status: LeadStatus;
  }[];
  recentActivity: ActivityLog[];
  notifications: UserNotification[];
}

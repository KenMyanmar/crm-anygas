
export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  event_type: 'meeting' | 'visit' | 'uco_collection' | 'follow_up' | 'task' | 'reminder' | 'other';
  start_datetime: string;
  end_datetime?: string;
  all_day?: boolean;
  location?: string;
  created_by_user_id: string;
  assigned_to_user_id?: string;
  restaurant_id?: string;
  lead_id?: string;
  order_id?: string;
  visit_task_id?: string;
  meeting_id?: string;
  uco_collection_item_id?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'rescheduled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Reminder {
  id: string;
  calendar_event_id: string;
  user_id: string;
  reminder_type: 'email' | 'in_app' | 'push' | 'sms';
  trigger_minutes_before: number;
  triggered_at?: string;
  status: 'pending' | 'sent' | 'failed';
  message?: string;
  created_at: string;
}

export interface UserNotificationPreferences {
  id: string;
  user_id: string;
  email_enabled: boolean;
  in_app_enabled: boolean;
  push_enabled: boolean;
  default_reminder_minutes: number;
  meeting_reminder_minutes: number;
  visit_reminder_minutes: number;
  task_reminder_minutes: number;
  uco_reminder_minutes: number;
  created_at: string;
  updated_at: string;
}

export interface EnhancedTask {
  id: string;
  title: string;
  description?: string;
  task_type: 'lead_followup' | 'meeting_prep' | 'uco_collection' | 'order_followup' | 'customer_satisfaction' | 'admin' | 'other';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date?: string;
  estimated_duration_minutes?: number;
  created_by_user_id: string;
  assigned_to_user_id: string;
  restaurant_id?: string;
  lead_id?: string;
  order_id?: string;
  calendar_event_id?: string;
  parent_task_id?: string;
  completion_notes?: string;
  completed_at?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export interface RecurringPattern {
  id: string;
  calendar_event_id: string;
  pattern_type: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval_value: number;
  days_of_week?: number[];
  day_of_month?: number;
  month_of_year?: number;
  end_date?: string;
  max_occurrences?: number;
  created_at: string;
}

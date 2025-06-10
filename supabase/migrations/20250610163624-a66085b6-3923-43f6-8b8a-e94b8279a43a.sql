
-- Create calendar_events table to centralize all activities
CREATE TABLE public.calendar_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT NOT NULL CHECK (event_type IN ('meeting', 'visit', 'uco_collection', 'follow_up', 'task', 'reminder', 'other')),
  start_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  end_datetime TIMESTAMP WITH TIME ZONE,
  all_day BOOLEAN DEFAULT false,
  location TEXT,
  created_by_user_id UUID NOT NULL,
  assigned_to_user_id UUID,
  restaurant_id UUID,
  lead_id UUID,
  order_id UUID,
  visit_task_id UUID,
  meeting_id UUID,
  uco_collection_item_id UUID,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled', 'rescheduled')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create reminders table for automated reminders
CREATE TABLE public.reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  calendar_event_id UUID NOT NULL REFERENCES calendar_events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  reminder_type TEXT NOT NULL CHECK (reminder_type IN ('email', 'in_app', 'push', 'sms')),
  trigger_minutes_before INTEGER NOT NULL DEFAULT 60,
  triggered_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create recurring_patterns table for repeated events
CREATE TABLE public.recurring_patterns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  calendar_event_id UUID NOT NULL REFERENCES calendar_events(id) ON DELETE CASCADE,
  pattern_type TEXT NOT NULL CHECK (pattern_type IN ('daily', 'weekly', 'monthly', 'yearly')),
  interval_value INTEGER DEFAULT 1,
  days_of_week JSONB, -- [0,1,2,3,4,5,6] for Sun-Sat
  day_of_month INTEGER,
  month_of_year INTEGER,
  end_date DATE,
  max_occurrences INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_notification_preferences table
CREATE TABLE public.user_notification_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  email_enabled BOOLEAN DEFAULT true,
  in_app_enabled BOOLEAN DEFAULT true,
  push_enabled BOOLEAN DEFAULT true,
  default_reminder_minutes INTEGER DEFAULT 60,
  meeting_reminder_minutes INTEGER DEFAULT 30,
  visit_reminder_minutes INTEGER DEFAULT 60,
  task_reminder_minutes INTEGER DEFAULT 120,
  uco_reminder_minutes INTEGER DEFAULT 30,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create enhanced_tasks table
CREATE TABLE public.enhanced_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  task_type TEXT NOT NULL CHECK (task_type IN ('lead_followup', 'meeting_prep', 'uco_collection', 'order_followup', 'customer_satisfaction', 'admin', 'other')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  due_date TIMESTAMP WITH TIME ZONE,
  estimated_duration_minutes INTEGER,
  created_by_user_id UUID NOT NULL,
  assigned_to_user_id UUID NOT NULL,
  restaurant_id UUID,
  lead_id UUID,
  order_id UUID,
  calendar_event_id UUID REFERENCES calendar_events(id),
  parent_task_id UUID REFERENCES enhanced_tasks(id),
  completion_notes TEXT,
  completed_at TIMESTAMP WITH TIME ZONE,
  tags JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recurring_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enhanced_tasks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for calendar_events
CREATE POLICY "Users can view events they created or are assigned to" ON public.calendar_events
  FOR SELECT USING (
    created_by_user_id = auth.uid() OR 
    assigned_to_user_id = auth.uid() OR
    auth.uid() IN (
      SELECT id FROM users WHERE role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Users can create calendar events" ON public.calendar_events
  FOR INSERT WITH CHECK (created_by_user_id = auth.uid());

CREATE POLICY "Users can update their own events or assigned events" ON public.calendar_events
  FOR UPDATE USING (
    created_by_user_id = auth.uid() OR 
    assigned_to_user_id = auth.uid() OR
    auth.uid() IN (
      SELECT id FROM users WHERE role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Users can delete their own events" ON public.calendar_events
  FOR DELETE USING (created_by_user_id = auth.uid());

-- Create RLS policies for reminders
CREATE POLICY "Users can view their own reminders" ON public.reminders
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create reminders for their events" ON public.reminders
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND
    calendar_event_id IN (
      SELECT id FROM calendar_events WHERE 
      created_by_user_id = auth.uid() OR assigned_to_user_id = auth.uid()
    )
  );

-- Create RLS policies for recurring_patterns
CREATE POLICY "Users can view recurring patterns for their events" ON public.recurring_patterns
  FOR SELECT USING (
    calendar_event_id IN (
      SELECT id FROM calendar_events WHERE 
      created_by_user_id = auth.uid() OR assigned_to_user_id = auth.uid()
    )
  );

-- Create RLS policies for user_notification_preferences (FIXED - unique policy names)
CREATE POLICY "Users can view their own notification preferences" ON public.user_notification_preferences
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own notification preferences" ON public.user_notification_preferences
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own notification preferences" ON public.user_notification_preferences
  FOR UPDATE USING (user_id = auth.uid());

-- Create RLS policies for enhanced_tasks
CREATE POLICY "Users can view tasks they created or are assigned to" ON public.enhanced_tasks
  FOR SELECT USING (
    created_by_user_id = auth.uid() OR 
    assigned_to_user_id = auth.uid() OR
    auth.uid() IN (
      SELECT id FROM users WHERE role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Users can create tasks" ON public.enhanced_tasks
  FOR INSERT WITH CHECK (created_by_user_id = auth.uid());

CREATE POLICY "Users can update their own tasks or assigned tasks" ON public.enhanced_tasks
  FOR UPDATE USING (
    created_by_user_id = auth.uid() OR 
    assigned_to_user_id = auth.uid() OR
    auth.uid() IN (
      SELECT id FROM users WHERE role IN ('admin', 'manager')
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_calendar_events_user_date ON calendar_events(assigned_to_user_id, start_datetime);
CREATE INDEX idx_calendar_events_restaurant ON calendar_events(restaurant_id);
CREATE INDEX idx_reminders_trigger ON reminders(trigger_minutes_before, status);
CREATE INDEX idx_enhanced_tasks_assigned ON enhanced_tasks(assigned_to_user_id, status);
CREATE INDEX idx_enhanced_tasks_due_date ON enhanced_tasks(due_date, status);

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_calendar_events_updated_at BEFORE UPDATE ON calendar_events 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_notification_preferences_updated_at BEFORE UPDATE ON user_notification_preferences 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_enhanced_tasks_updated_at BEFORE UPDATE ON enhanced_tasks 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

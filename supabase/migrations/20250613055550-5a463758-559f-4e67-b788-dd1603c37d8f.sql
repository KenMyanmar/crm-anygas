
-- First, let's ensure we have the necessary database structure for automated follow-up notifications
-- This will enhance the existing system without affecting current operations

-- Create a table to track follow-up task escalations and completions
CREATE TABLE IF NOT EXISTS follow_up_escalations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES enhanced_tasks(id) ON DELETE CASCADE,
  escalated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  escalated_to_user_id UUID NOT NULL,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by_user_id UUID,
  escalation_reason TEXT DEFAULT 'overdue_followup',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for the escalations table
ALTER TABLE follow_up_escalations ENABLE ROW LEVEL SECURITY;

-- Create policies for follow_up_escalations
CREATE POLICY "Users can view escalations assigned to them" 
  ON follow_up_escalations 
  FOR SELECT 
  USING (escalated_to_user_id = auth.uid() OR resolved_by_user_id = auth.uid());

CREATE POLICY "Users can update escalations assigned to them" 
  ON follow_up_escalations 
  FOR UPDATE 
  USING (escalated_to_user_id = auth.uid());

-- Create an index for better performance on task lookups
CREATE INDEX IF NOT EXISTS idx_follow_up_escalations_task_id ON follow_up_escalations(task_id);
CREATE INDEX IF NOT EXISTS idx_follow_up_escalations_escalated_to ON follow_up_escalations(escalated_to_user_id);

-- Add a function to get managers for escalation
CREATE OR REPLACE FUNCTION get_manager_user_ids()
RETURNS TABLE(user_id UUID)
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT id FROM users WHERE role IN ('admin', 'manager') AND is_active = true;
$$;

-- Add a function to check if a task is overdue and needs escalation
CREATE OR REPLACE FUNCTION check_overdue_tasks()
RETURNS TABLE(
  task_id UUID,
  restaurant_name TEXT,
  assigned_user_name TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  hours_overdue NUMERIC
)
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT 
    et.id as task_id,
    r.name as restaurant_name,
    u.full_name as assigned_user_name,
    et.due_date,
    EXTRACT(EPOCH FROM (NOW() - et.due_date)) / 3600 as hours_overdue
  FROM enhanced_tasks et
  JOIN restaurants r ON et.restaurant_id = r.id
  JOIN users u ON et.assigned_to_user_id = u.id
  WHERE et.task_type = 'lead_followup'
    AND et.status = 'pending'
    AND et.due_date < NOW()
    AND NOT EXISTS (
      SELECT 1 FROM follow_up_escalations fe 
      WHERE fe.task_id = et.id AND fe.resolved_at IS NULL
    );
$$;

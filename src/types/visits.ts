export interface VisitPlan {
  id: string;
  plan_date: string;
  title: string;
  remarks?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  team_visible?: boolean;
  estimated_total_duration_minutes?: number;
  creator?: {
    id: string;
    full_name: string;
    role: string;
  };
}

export interface VisitTask {
  id: string;
  plan_id: string;
  restaurant_id: string;
  salesperson_uid: string;
  status: 'PLANNED' | 'VISITED' | 'RESCHEDULED' | 'CANCELED';
  visit_time?: string;
  notes?: string;
  visit_sequence?: number;
  estimated_duration_minutes?: number;
  priority_level?: 'HIGH' | 'MEDIUM' | 'LOW';
  created_at: string;
  updated_at: string;
  restaurant?: {
    id: string;
    name: string;
    township?: string;
    contact_person?: string;
    phone?: string;
    address?: string;
  };
  lead_status?: 'CONTACT_STAGE' | 'MEETING_STAGE' | 'PRESENTATION_NEGOTIATION' | 'CLOSED_WON' | 'CLOSED_LOST';
  next_action_date?: string;
  lead_assigned_to?: string;
  lead_assigned_user_name?: string;
}

export interface TaskOutcome {
  id: string;
  task_id: string;
  lead_status?: 'CONTACT_STAGE' | 'MEETING_STAGE' | 'PRESENTATION_NEGOTIATION' | 'CLOSED_WON' | 'CLOSED_LOST';
  order_id?: string;
  next_action?: string;
  next_action_date?: string;
  created_by: string;
  created_at: string;
}

export interface Note {
  id: string;
  target_type: 'lead' | 'order' | 'visit' | 'meeting' | 'restaurant' | 'generic';
  target_id: string;
  author_uid: string;
  body: string;
  created_at: string;
  updated_at: string;
  author?: {
    full_name: string;
  };
}

export interface VoiceNote {
  id: string;
  restaurant_id: string;
  linked_type: 'lead' | 'order' | 'visit' | 'meeting' | 'generic';
  linked_id?: string;
  file_url: string;
  duration_sec?: number;
  transcript?: string;
  created_by: string;
  created_at: string;
}

export interface RestaurantWithLead {
  id: string;
  name: string;
  township?: string;
  address?: string;
  contact_person?: string;
  phone?: string;
  lead_status?: 'CONTACT_STAGE' | 'MEETING_STAGE' | 'PRESENTATION_NEGOTIATION' | 'CLOSED_WON' | 'CLOSED_LOST';
  assigned_user?: string;
  next_action_date?: string;
  last_visit_date?: string;
}

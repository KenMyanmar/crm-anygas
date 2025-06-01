
export interface OrderStatusHistory {
  id: string;
  order_id: string;
  old_status: string | null;
  new_status: string;
  changed_by_user_id: string;
  change_reason: string | null;
  changed_at: string;
  changed_by_user?: {
    full_name: string;
  };
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_name: string;
  quantity: number;
  unit_price_kyats: number;
  sub_total_kyats: number;
  created_at: string;
}

export interface Order {
  id: string;
  order_number: string;
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
  restaurant?: {
    id: string;
    name: string;
    township?: string;
    contact_person?: string;
    phone?: string;
  };
  order_items?: OrderItem[];
  status_history?: OrderStatusHistory[];
}

export interface VisitComment {
  id: string;
  visit_task_id: string;
  author_user_id: string;
  comment_text: string;
  parent_comment_id?: string;
  created_at: string;
  updated_at: string;
  author?: {
    full_name: string;
  };
  replies?: VisitComment[];
}

export interface RestaurantTimelineItem {
  id: string;
  type: 'ORDER' | 'LEAD' | 'VISIT' | 'MEETING';
  title: string;
  description: string;
  created_at: string;
  created_by_name?: string;
  status: string;
  metadata: Record<string, any>;
}

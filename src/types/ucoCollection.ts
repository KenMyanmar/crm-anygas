
export interface UcoCollectionPlan {
  id: string;
  plan_name: string;
  townships: string[];
  plan_date: string;
  driver_name?: string;
  truck_capacity_kg: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface UcoCollectionItem {
  id: string;
  plan_id: string;
  restaurant_id: string;
  route_sequence: number;
  uco_status: 'have_uco' | 'no_uco_reuse_staff' | 'no_uco_not_ready' | 'shop_closed' | 'not_assessed';
  collection_priority: 'confirmed' | 'high' | 'medium' | 'low' | 'skip';
  expected_volume_kg?: number;
  actual_volume_kg?: number;
  price_per_kg?: number;
  quality_score?: number;
  competitor_notes?: string;
  driver_notes?: string;
  visit_time?: string;
  completed_at?: string;
  restaurant?: {
    name: string;
    township: string;
    address?: string;
    contact_person?: string;
    phone?: string;
  };
}


export type UcoStatus = 'not_assessed' | 'have_uco' | 'no_uco_reuse_staff' | 'no_uco_not_ready' | 'shop_closed';
export type CollectionPriority = 'skip' | 'low' | 'medium' | 'high' | 'confirmed';

export interface UcoCollectionItem {
  id: string;
  restaurant: {
    name: string;
    township: string;
    address?: string;
    contact_person?: string;
    phone?: string;
  };
  uco_status: UcoStatus;
  collection_priority: CollectionPriority;
  expected_volume_kg?: number;
  route_sequence?: number;
}

export interface StatusFormData {
  uco_status: UcoStatus;
  actual_volume_kg: string;
  price_per_kg: string;
  quality_score: string;
  driver_notes: string;
}


export interface GoogleSheetsImportData {
  restaurant_name: string;
  township: string;
  uco_status: string;
  collection_priority: string;
  expected_volume_kg?: number;
  route_sequence?: number;
  notes?: string;
}

export interface ImportParams {
  sheetsUrl: string;
  planName: string;
  township: string;
}

export interface ImportResult {
  plan: any;
  importedCount: number;
}

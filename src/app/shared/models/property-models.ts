export type PropertyState =
  | 'NEW'
  | 'STAGE2_IN_PROGRESS'
  | 'STAGE2_COMPLETE'
  | 'STAGE3_IN_PROGRESS'
  | 'STAGE3_COMPLETE';

export interface PropertyImage {
  id: number;
  source_url: string;
  url: string;
  caption: string;
  order: number;
  created_at: string;
  updated_at: string;
}

export interface Property {
  uuid: string;
  property_list: string;
  property_list_title: string;
  state: PropertyState;
  state_display: string;

  // Basic details
  title: string;
  address_line_1: string;
  address_line_2: string;
  city: string;
  postcode: string;

  // Location
  latitude: number | null;
  longitude: number | null;

  // Characteristics
  price: number;
  bedrooms: number;
  bathrooms: number;
  square_area: number | null;
  garden: boolean;
  parking: boolean;
  furnished_status: string;

  // Additional details
  council_tax_band: string;
  epc_rating: string;
  lease_length: number | null;
  floor_level: number | null;
  child_suitable: boolean;
  completion_date: string | null;

  // External refs
  external_id: string;
  external_url: string;

  // Deduplication
  normalized_address: string;
  uprn: string;

  // Stage 3 results
  overall_rating: number | null;
  rating_breakdown: Record<string, any> | null;
  disqualified: boolean;
  disqualification_reason: string;

  // Images
  images: PropertyImage[];
  primary_image: PropertyImage | null;

  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface PropertyDetail extends Property {
  context_data: any[];
  available_transitions: string[];
}

export interface CreatePropertyDto {
  property_list: string;
  title: string;
  address_line_1: string;
  address_line_2?: string;
  city?: string;
  postcode: string;
  latitude?: number | null;
  longitude?: number | null;
  price: number;
  bedrooms: number;
  bathrooms: number;
  square_area?: number | null;
  garden?: boolean;
  parking?: boolean;
  furnished_status?: string;
  council_tax_band?: string;
  epc_rating?: string;
  lease_length?: number | null;
  floor_level?: number | null;
  child_suitable?: boolean;
  completion_date?: string | null;
  external_id?: string;
  external_url?: string;
}

export interface UpdatePropertyDto {
  title?: string;
  address_line_1?: string;
  address_line_2?: string;
  city?: string;
  postcode?: string;
  latitude?: number | null;
  longitude?: number | null;
  price?: number;
  bedrooms?: number;
  bathrooms?: number;
  square_area?: number | null;
  garden?: boolean;
  parking?: boolean;
  furnished_status?: string;
  council_tax_band?: string;
  epc_rating?: string;
  lease_length?: number | null;
  floor_level?: number | null;
  child_suitable?: boolean;
  completion_date?: string | null;
  external_id?: string;
  external_url?: string;
}

export interface PropertyStateTransition {
  action: 'run_stage2' | 'run_stage3' | 'rerun_services';
  status: string;
  state: PropertyState;
  message: string;
}

export interface CreateFromInputRequest {
  input_data: string;
  input_type: 'url' | 'text';
  property_list_uuid?: string;
}

export interface CreateFromInputResponse {
  success: boolean;
  property_data?: Partial<CreatePropertyDto>;
  property?: Property;
  created?: boolean;
  updated?: boolean;
  message: string;
}

// Search criteria for bulk property creation
export interface SearchCriteria {
  area: string;
  bedrooms_min?: number;
  bedrooms_max?: number;
  price_min?: number;
  price_max?: number;
  radius?: number;
  property_types?: string;
  max_days_since_added?: number;
}

export interface CreateFromSearchRequest {
  search_criteria: SearchCriteria;
  max_properties?: number;
}

export type TaskStatus = 'QUEUED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';

export interface PropertyListTask {
  uuid: string;
  property_list: string;
  task_type: string;
  status: TaskStatus;
  celery_task_id: string | null;
  total_items: number;
  completed_items: number;
  failed_items: number;
  progress_percentage: number;
  errors: string[];
  metadata: Record<string, any>;
  websocket_url: string;
  created_at: string;
  updated_at: string;
}

export interface CreateFromSearchResponse {
  uuid: string;
  property_list_uuid: string;
  task_type: string;
  status: TaskStatus;
  websocket_url: string;
  property_list: string;
  celery_task_id: string | null;
  total_items: number;
  completed_items: number;
  failed_items: number;
  progress_percentage: number;
  errors: string[];
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface ScrapeProgressEvent {
  uuid: string;
  status: TaskStatus;
  completed_items: number;
  total_items: number;
  failed_items: number;
  progress_percentage: number;
  errors: string[];
}

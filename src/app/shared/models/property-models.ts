export interface CriterionScoreBreakdown {
  normalized_score: number;
  weight: number;
  weighted_score: number;
  raw_value?: string | number | boolean;
}

export type RatingBreakdown = Record<string, CriterionScoreBreakdown>;

export type PropertyState =
  | 'NEW'
  | 'STAGE2_IN_PROGRESS'
  | 'STAGE2_COMPLETE'
  | 'STAGE3_IN_PROGRESS'
  | 'STAGE3_COMPLETE';

export interface KeyFeature {
  order: number;
  description: string;
}

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
  property_lists: Record<string, string>; // { uuid: title }
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
  summary: string | null;
  price: number;
  price_frequency: string | null;
  currency_code: string | null;
  property_type: string | null;
  description: string | null;
  bedrooms: number;
  bathrooms: number;
  square_area: number | null;
  garden: boolean;
  parking: boolean;
  furnished_status: string;

  // Listing metadata
  let_available_date: string | null;
  first_visible_date: string | null;
  key_features: KeyFeature[];
  added_or_reduced: string | null;
  display_size: string | null;
  listing_update_reason: string | null;
  listing_update_date: string | null;

  // Additional details
  council_tax_band: string;
  epc_rating: string;
  deposit: string;
  lease_length: number | null;
  floor_level: number | null;
  child_suitable: boolean;
  completion_date: string | null;

  // External refs
  external_id: string;
  external_url: string;
  is_enriched: boolean;
  enriched_at: string | null;

  // Deduplication
  normalized_address: string;
  uprn: string;

  // Stage 3 results
  overall_rating: number | null;
  rating_breakdown: RatingBreakdown | null;
  disqualified: boolean;
  disqualification_reason: string | null;

  // Images
  images: PropertyImage[];
  primary_image: PropertyImage | null;

  // Favorites
  is_favorited: boolean;

  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface PropertyDetail extends Property {
  context_data: any[];
  available_transitions: string[];
}

export interface CreatePropertyDto {
  property_lists_input: string[]; // Array of PropertyList UUIDs
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
  summary?: string | null;
  title?: string;
  address_line_1?: string;
  address_line_2?: string;
  city?: string;
  postcode?: string;
  latitude?: number | null;
  longitude?: number | null;
  price?: number;
  price_frequency?: string | null;
  description?: string | null;
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
  input_type: 'url' | 'text' | 'html';
  property_list_uuid?: string;
  source?: 'rightmove' | 'zoopla';
}

export interface CreateFromInputResponse {
  success: boolean;
  property?: Property;
  created: boolean | number;
  updated?: number;
  failed?: number;
  total?: number;
  message?: string;
  source?: string;
}

export const SEARCH_CRITERIA_PRICES = [
  100, 150, 200, 250, 300, 350, 400, 450, 500, 600, 700, 800, 900, 1000, 1250, 1500, 1750, 2000,
  2500, 3000, 3500, 4000, 4500, 5000, 5500, 6000, 6500, 7000, 8000, 9000, 10000, 12500, 15000,
  17500, 20000, 25000,
];

export const SEARCH_CRITERIA_BEDROOMS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export const SEARCH_CRITERIA_RADII: { value: number; label: string }[] = [
  { value: 0, label: 'This area only' },
  { value: 0.25, label: 'Within 1/4 mile' },
  { value: 0.5, label: 'Within 1/2 mile' },
  { value: 1.0, label: 'Within 1 mile' },
  { value: 3.0, label: 'Within 3 miles' },
  { value: 5.0, label: 'Within 5 miles' },
  { value: 10.0, label: 'Within 10 miles' },
  { value: 15.0, label: 'Within 15 miles' },
  { value: 20, label: 'Within 20 miles' },
  { value: 30.0, label: 'Within 30 miles' },
  { value: 40.0, label: 'Within 40 miles' },
];

export const SEARCH_CRITERIA_DAYS_SINCE_ADDED: { value: number | null; label: string }[] = [
  { value: null, label: 'Anytime' },
  { value: 1, label: 'Last 24 hours' },
  { value: 3, label: 'Last 3 days' },
  { value: 7, label: 'Last 7 days' },
  { value: 14, label: 'Last 14 days' },
];

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
  tasks: PropertyListTask[];
}

export interface EnrichPropertyResponse {
  success: boolean;
  property: PropertyDetail;
}

export interface BulkEnrichRequest {
  property_uuids: string[];
}

export interface ScrapeProgressEvent {
  task_uuid?: string;
  source?: 'rightmove' | 'zoopla';
  status: TaskStatus;
  completed_items: number;
  total_items: number;
  failed_items: number;
  progress_percentage: number;
  errors: string[];
  message?: string;
}

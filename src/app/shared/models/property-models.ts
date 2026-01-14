export type PropertyState =
  | 'NEW'
  | 'STAGE2_IN_PROGRESS'
  | 'STAGE2_COMPLETE'
  | 'STAGE3_IN_PROGRESS'
  | 'STAGE3_COMPLETE';

export interface Property {
  id: number;
  uuid: string;
  property_list: number;
  property_list_uuid: string;
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

  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface PropertyDetail extends Property {
  context_data: any[];
  available_transitions: string[];
}

export interface CreatePropertyDto {
  property_list: number;
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

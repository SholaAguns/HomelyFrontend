export interface AdminProperty {
  uuid: string;
  title: string;
  state: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  postcode: string;
  latitude?: number;
  longitude?: number;
  price: number;
  bedrooms?: number;
  bathrooms?: number;
  square_area?: number;
  garden: boolean;
  parking: boolean;
  furnished_status?: string;
  council_tax_band?: string;
  epc_rating?: string;
  external_url?: string;
  overall_rating?: number;
  disqualified: boolean;
  lists_count: number;
  created_at: string;
  updated_at: string;
}

export interface AdminPropertyList {
  uuid: string;
  title: string;
  state: string;
  owner: number;
  owner_username: string;
  properties_count: number;
  created_at: string;
  updated_at: string;
}

export interface AdminPropertyListTask {
  uuid: string;
  property_list: number;
  list_title: string;
  list_uuid: string;
  task_type: string;
  status: string;
  total_items: number;
  completed_items: number;
  failed_items: number;
  progress_percentage: number;
  created_at: string;
  completed_at?: string;
}

export interface AdminContextData {
  id: number;
  uuid: string;
  property: number;
  property_title: string;
  property_uuid: string;
  service_name: string;
  status: string;
  error_message?: string;
  retry_count: number;
  created_at: string;
  last_attempt_at?: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface QueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  ordering?: string;
  [key: string]: any;
}

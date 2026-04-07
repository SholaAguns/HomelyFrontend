export type ServiceName =
  | 'crime'
  | 'schools'
  | 'broadband'
  | 'mobile'
  | 'poi'
  | 'council_tax'
  | 'saved_locations';
export type ServiceStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETE' | 'FAILED';

export interface ContextData {
  id: string;
  property_id: string;
  service_name: ServiceName;
  status: ServiceStatus;
  data: unknown;
  error_message: string | null;
  started_at: string | null;
  completed_at: string | null;
  cached: boolean;
}

export interface ServiceProgress {
  total: number;
  complete: number;
  in_progress: number;
  failed: number;
  pending: number;
}

export interface RatingCompleteData {
  property_id: string;
  property_state: string;
  overall_rating: number | null;
  rating_breakdown: Record<
    string,
    {
      raw_value: string | number | boolean;
      normalized_score: number;
      weighted_score: number;
      weight: number;
    }
  > | null;
  disqualified: boolean;
  disqualification_reason: string | null;
  message: string;
}

export interface WebSocketServiceUpdate {
  type: 'service_update' | 'stage2_complete' | 'rating_complete';
  service?: string;
  status?: string;
  property_id: string;
  data?: unknown;
  progress?: ServiceProgress;
}

// Report Data Types
export interface School {
  name: string;
  distance_miles: number;
  pupil_count?: number | null;
  type: string;
  ofsted_url?: string;
}

export interface SchoolStatistics {
  nursery_count?: number;
  primary_count?: number;
  secondary_count?: number;
  all_through_count?: number;
  closest_nursery_km?: number;
  closest_primary_km?: number;
  closest_secondary_km?: number;
}

export interface SchoolsReportData {
  statistics: SchoolStatistics;
  nursery_schools?: School[];
  primary_schools?: School[];
  secondary_schools?: School[];
  all_through_schools?: School[];
  note?: string;
}

export interface CrimeCategory {
  category: string;
  count: number;
}

export interface MonthlyBreakdown {
  month: string;
  crime_count: number | null;
  status: 'success' | 'failed';
  error?: string;
}

export interface CrimeReportData {
  total_crimes: number;
  period: string;
  crime_rating: string;
  top_categories: CrimeCategory[];
  data_source: string;
  postcode_sector: string;
  monthly_breakdown?: MonthlyBreakdown[];
}

export interface FullFibreData {
  availability_pct: number;
  take_up_pct: number;
}

export interface BroadbandReportData {
  max_download_mbps: number;
  max_upload_mbps: number;
  full_fibre?: FullFibreData;
  data_source: string;
  granularity: string;
}

export interface CoverageByNetwork {
  all_4_networks: number;
  three_networks: number;
  two_networks: number;
  one_network: number;
  no_coverage: number;
}

export interface CoverageScores {
  four_g_coverage: number;
  five_g_coverage: number;
  overall_coverage: number;
}

export interface ProviderCoverage {
  voice_outdoor: number;
  voice_indoor: number;
  data_outdoor: number;
  data_indoor: number;
}

export interface MobileProviders {
  ee: ProviderCoverage;
  three: ProviderCoverage;
  o2: ProviderCoverage;
  vodafone: ProviderCoverage;
}

export interface MobileCoverageReportData {
  scores: CoverageScores;
  four_g_coverage: {
    indoor: CoverageByNetwork;
    outdoor: CoverageByNetwork;
  };
  five_g_coverage_high_confidence?: {
    outdoor: CoverageByNetwork;
  };
  data_source: string;
  granularity: string;
  laua_name?: string;
  // Optional provider-specific data (only present when from API source)
  providers?: MobileProviders;
}

export interface Place {
  place_id: string;
  name: string;
  address?: string;
  latitude: number;
  longitude: number;
  distance_km: number;
  straight_distance_km?: number;
  walking_distance_km?: number;
  walking_time_min?: number;
  driving_distance_km?: number;
  driving_time_min?: number;
  website_url?: string;
  phone_number?: string;
  google_maps_url: string;
  rating?: number;
  user_ratings_total?: number;
}

export interface PoiReportData {
  total_places: number;
  categories?: string[];
  by_category?: Record<string, Place[]>;
  data_source: string;
  search_radius_km: number;
}

export interface CouncilTaxReportData {
  band: string | null;
  band_range: string | null;
  local_authority: string | null;
  address?: string | null;
  is_exact_match: boolean;
  country: string;
  retrieved_at: string | null;
}

export interface SavedLocationDistance {
  location_id: number;
  location_uuid: string;
  location_name: string;
  address: string;
  postcode: string;
  latitude: number;
  longitude: number;
  distance_km: number;
  distance_miles: number;
}

export interface SavedLocationReportData {
  distances: SavedLocationDistance[];
  total_locations: number;
  closest_location: SavedLocationDistance | null;
}

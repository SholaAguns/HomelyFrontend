export type ServiceName = 'crime' | 'schools' | 'broadband' | 'mobile' | 'poi';
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

export interface WebSocketServiceUpdate {
  type: 'service_update' | 'stage2_complete';
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
  pupil_count: number;
  type: string;
  ofsted_url?: string;
}

export interface SchoolStatistics {
  primary_count: number;
  secondary_count: number;
  closest_primary_km?: number;
  closest_secondary_km?: number;
}

export interface SchoolsReportData {
  statistics: SchoolStatistics;
  primary_schools?: School[];
  secondary_schools?: School[];
  note?: string;
}

export interface CrimeCategory {
  category: string;
  count: number;
}

export interface CrimeReportData {
  total_crimes: number;
  period: string;
  crime_rating: string;
  top_categories: CrimeCategory[];
  data_source: string;
  postcode_sector: string;
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
  '3_networks': number;
  '2_networks': number;
  '1_network': number;
  no_coverage: number;
}

export interface CoverageScores {
  '4g_coverage': number;
  '5g_coverage': number;
  overall_coverage: number;
}

export interface MobileCoverageReportData {
  scores: CoverageScores;
  '4g_coverage': {
    indoor: CoverageByNetwork;
    outdoor: CoverageByNetwork;
  };
  '5g_coverage_high_confidence'?: {
    outdoor: CoverageByNetwork;
  };
  data_source: string;
  granularity: string;
  laua_name?: string;
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

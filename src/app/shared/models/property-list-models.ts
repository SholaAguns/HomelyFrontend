import { Property, SearchCriteria } from './property-models';

export type PoiType =
  | 'restaurant'
  | 'supermarket'
  | 'hospital'
  | 'school'
  | 'gym'
  | 'park'
  | 'pharmacy'
  | 'bank'
  | 'pub'
  | 'cafe'
  | 'train_station'
  | 'bus_station'
  | 'shopping_mall'
  | 'dentist'
  | 'doctor';

export const POI_TYPE_LABELS: Record<PoiType, string> = {
  restaurant: 'Restaurant',
  supermarket: 'Supermarket',
  hospital: 'Hospital',
  school: 'School',
  gym: 'Gym',
  park: 'Park',
  pharmacy: 'Pharmacy',
  bank: 'Bank',
  pub: 'Pub',
  cafe: 'Cafe',
  train_station: 'Train Station',
  bus_station: 'Bus Station',
  shopping_mall: 'Shopping Mall',
  dentist: 'Dentist',
  doctor: 'Doctor',
};

export interface ContextOptions {
  uuid: string;
  property_list_uuid: string;
  enable_crime: boolean;
  enable_schools: boolean;
  enable_broadband: boolean;
  enable_mobile: boolean;
  enable_poi: boolean;
  poi_types: PoiType[];
  poi_search_radius_meters: number;
  created_at: string;
  updated_at: string;
}

export interface UpdateContextOptionsDto {
  enable_crime?: boolean;
  enable_schools?: boolean;
  enable_broadband?: boolean;
  enable_mobile?: boolean;
  enable_poi?: boolean;
  poi_types?: PoiType[];
  poi_search_radius_meters?: number;
}

export type PropertyListState = 'DRAFT' | 'ACTIVE';

export interface PropertyList {
  uuid: string;
  owner: string;
  title: string;
  state: PropertyListState;
  rating_criteria: string | null;
  rating_criteria_source: string | null;
  search_criteria: SearchCriteria | null;
  viewers: string[];
  contributors: string[];
  properties_count: number;
  status_summary: PropertyListStatusSummary;
  created_at: string;
  updated_at: string;
}

export interface PropertyListStatusSummary {
  total: number;
  new: number;
  stage2_in_progress: number;
  stage2_complete: number;
  stage3_in_progress: number;
  stage3_complete: number;
}

export interface PropertyListDetail extends PropertyList {
  properties: Property[];
}

export interface CreatePropertyListDto {
  title: string;
  rating_criteria?: string | null;
  viewers?: string[];
  contributors?: string[];
}

export interface UpdatePropertyListDto {
  title?: string;
  rating_criteria?: string | null;
  viewers?: string[];
  contributors?: string[];
}

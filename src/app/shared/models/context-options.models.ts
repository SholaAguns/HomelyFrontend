export type PoiType =
  | 'restaurant'
  | 'supermarket'
  | 'hospital'
  | 'school'
  | 'gym'
  | 'park'
  | 'bank'
  | 'pharmacy'
  | 'church'
  | 'mosque'
  | 'temple'
  | 'pub'
  | 'cafe'
  | 'bus_station'
  | 'train_station'
  | 'shopping'
  | 'library'
  | 'dentist'
  | 'petrol_station';

export const POI_TYPE_LABELS: Record<PoiType, string> = {
  restaurant: 'Restaurant',
  supermarket: 'Supermarket',
  hospital: 'Hospital',
  school: 'School',
  gym: 'Gym',
  park: 'Park',
  pharmacy: 'Pharmacy',
  petrol_station: 'Petrol Station',
  bank: 'Bank',
  mosque: 'Mosque',
  church: 'Church',
  temple: 'Temple',
  pub: 'Pub',
  cafe: 'Cafe',
  bus_station: 'Bus Station',
  train_station: 'Train Station',
  shopping: 'Shopping Mall',
  dentist: 'Dentist',
  library: 'Library',
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

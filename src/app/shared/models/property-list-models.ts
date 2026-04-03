import { Property, SearchCriteria } from './property-models';

export type PropertyListState = 'DRAFT' | 'ACTIVE';

export interface PropertyList {
  uuid: string;
  owner: string;
  project?: string;
  project_title?: string;
  title: string;
  state?: PropertyListState;
  rating_criteria?: string | null;
  rating_criteria_source?: string | null;
  search_criteria: SearchCriteria | null;
  viewers?: string[];
  contributors?: string[];
  properties_count: number;
  status_summary: PropertyListStatusSummary;
  average_price?: number | null;
  highest_price?: number | null;
  lowest_price?: number | null;
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
  project_uuid?: string;
  search_criteria?: SearchCriteria;
  title?: string;
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

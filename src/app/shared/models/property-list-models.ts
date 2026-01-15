import { Property } from './property-models';

export type PropertyListState = 'DRAFT' | 'ACTIVE';

export interface PropertyList {
  uuid: string;
  owner: string;
  title: string;
  state: PropertyListState;
  rating_criteria: string | null;
  rating_criteria_source: string | null;
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

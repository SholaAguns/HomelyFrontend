import { Property } from './property-models';

export type PropertyListState = 'DRAFT' | 'ACTIVE';

export interface PropertyList {
  id: number;
  uuid: string;
  owner: string;
  title: string;
  state: PropertyListState;
  rating_criteria: number | null;
  rating_criteria_source: number | null;
  viewers: number[];
  contributors: number[];
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
  rating_criteria?: number | null;
  viewers?: number[];
  contributors?: number[];
}

export interface UpdatePropertyListDto {
  title?: string;
  rating_criteria?: number | null;
  viewers?: number[];
  contributors?: number[];
}

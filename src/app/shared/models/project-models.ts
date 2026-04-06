import { ContextOptions, UpdateContextOptionsDto } from './context-options.models';

export interface Project {
  uuid: string;
  owner: string;
  title: string;
  description: string;
  viewers: string[];
  contributors: string[];
  rating_criteria: string | null;
  rating_criteria_source: string | null;
  context_options: ContextOptions | null;
  property_lists_count: number;
  created_at: string;
  updated_at: string;
}

export interface ProjectDetail extends Project {
  property_lists: any[];
}

export interface ProjectStats {
  total_properties: number;
  avg_price: number | null;
  min_price: number | null;
  max_price: number | null;
  property_lists_count: number;
  by_area: AreaBreakdown[];
  price_distribution: PriceDistribution[];
  property_types: PropertyTypeDistribution[];
}

export interface AreaBreakdown {
  name: string;
  list_count: number;
  property_count: number;
  avg_price: number;
}

export interface PriceDistribution {
  range: string;
  count: number;
}

export interface PropertyTypeDistribution {
  type: string;
  count: number;
}

export interface CreateProjectDto {
  title: string;
  description?: string;
  viewers?: string[];
  contributors?: string[];
}

export interface UpdateProjectDto {
  title?: string;
  description?: string;
  viewers?: string[];
  contributors?: string[];
  rating_criteria?: string | null;
}

export type CreateContextOptionsDto = UpdateContextOptionsDto;

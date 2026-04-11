export type CriterionSource = 'property' | 'context_report';

export interface Criterion {
  id?: number;
  name: string;
  source: CriterionSource;
  saved_location_uuid?: string;
  poi_category?: string;
  field_name?: string;
  enabled: boolean;
  weight: number;
  is_dealbreaker: boolean;
  dealbreaker_threshold?: Record<string, number | string | boolean> | null;
  created_at?: string;
  updated_at?: string;
}

export interface RatingCriteria {
  uuid: string;
  name: string;
  owner: string;
  criteria: Criterion[];
  criteria_count: number;
  created_at: string;
  updated_at: string;
}

export interface CreateRatingCriteriaDto {
  name: string;
  criteria: Omit<Criterion, 'id' | 'created_at' | 'updated_at'>[];
}

export type UpdateRatingCriteriaDto = CreateRatingCriteriaDto;

// Weight display labels
export const WEIGHT_LABELS: Record<number, string> = {
  0.25: 'Not Important',
  0.5: 'Nice to Have',
  1.0: 'Important',
  1.5: 'Very Important',
};

export const WEIGHT_VALUES = [0.25, 0.5, 1.0, 1.5];

// Criterion source labels
export const CRITERION_SOURCE_LABELS: Record<CriterionSource, string> = {
  property: 'Property Field',
  context_report: 'Context Report',
};

export type CriterionSource = 'property' | 'context' | 'calculated';
export type ScoringStrategy = 'min_max' | 'inverted' | 'ordinal' | 'boolean' | 'threshold';

export interface Criterion {
  id?: number;
  name: string;
  source: CriterionSource;
  field_name?: string;
  service_name?: string;
  data_path?: string;
  scoring_strategy: ScoringStrategy;
  ordinal_mapping?: Record<string, number> | null;
  thresholds?: Record<string, number> | null;
  boolean_true_is_better?: boolean;
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
  0.0: 'Not Important',
  0.5: 'Nice to Have',
  1.0: 'Important',
  1.5: 'Very Important',
};

export const WEIGHT_VALUES = [0.0, 0.5, 1.0, 1.5];

// Scoring strategy labels
export const SCORING_STRATEGY_LABELS: Record<ScoringStrategy, string> = {
  min_max: 'Min-Max (Higher Better)',
  inverted: 'Inverted (Lower Better)',
  ordinal: 'Ordinal Mapping',
  boolean: 'Boolean',
  threshold: 'Threshold-Based',
};

// Criterion source labels
export const CRITERION_SOURCE_LABELS: Record<CriterionSource, string> = {
  property: 'Property Field',
  context: 'Context Data',
  calculated: 'Calculated Value',
};

import {
  RatingCriteria,
  CreateRatingCriteriaDto,
  UpdateRatingCriteriaDto,
  Criterion,
} from '../../models/rating-criteria.models';

export const mockCriterion1: Criterion = {
  id: 1,
  name: 'Price',
  source: 'property',
  field_name: 'price',
  enabled: true,
  weight: 1.0,
  created_at: '2024-01-01T10:00:00Z',
  updated_at: '2024-01-01T10:00:00Z',
};

export const mockCriterion2: Criterion = {
  id: 2,
  name: 'Crime Rating',
  source: 'context_report',
  field_name: 'crime',
  enabled: true,
  weight: 1.5,
  created_at: '2024-01-01T10:00:00Z',
  updated_at: '2024-01-01T10:00:00Z',
};

export const mockCriterion3: Criterion = {
  id: 3,
  name: 'Distance to Supermarket',
  source: 'context_report',
  field_name: 'poi',
  poi_category: 'supermarket',
  enabled: true,
  weight: 0.5,
  created_at: '2024-01-01T10:00:00Z',
  updated_at: '2024-01-01T10:00:00Z',
};

export const mockRatingCriteria: RatingCriteria = {
  uuid: 'test-criteria-uuid-1',
  name: 'City Living Criteria',
  owner: 'testuser',
  criteria: [mockCriterion1, mockCriterion2],
  criteria_count: 2,
  created_at: '2024-01-01T10:00:00Z',
  updated_at: '2024-01-01T10:00:00Z',
};

export const mockRatingCriteria2: RatingCriteria = {
  uuid: 'test-criteria-uuid-2',
  name: 'Family Home Criteria',
  owner: 'testuser',
  criteria: [mockCriterion1, mockCriterion3],
  criteria_count: 2,
  created_at: '2024-01-02T10:00:00Z',
  updated_at: '2024-01-02T10:00:00Z',
};

export const mockCreateRatingCriteriaDto: CreateRatingCriteriaDto = {
  name: 'New Criteria',
  criteria: [
    {
      name: 'Price',
      source: 'property',
      field_name: 'price',
      enabled: true,
      weight: 1.0,
    },
  ],
};

export const mockUpdateRatingCriteriaDto: UpdateRatingCriteriaDto = {
  name: 'Updated Criteria',
  criteria: [
    {
      name: 'Price',
      source: 'property',
      field_name: 'price',
      enabled: true,
      weight: 1.5,
    },
  ],
};

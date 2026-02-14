import {
  PropertyList,
  PropertyListDetail,
  CreatePropertyListDto,
  UpdatePropertyListDto,
  PropertyListStatusSummary,
} from '../../models/property-list-models';
import { mockSearchCriteria } from './property-models.mock';

export const mockStatusSummary: PropertyListStatusSummary = {
  total: 5,
  new: 2,
  stage2_in_progress: 1,
  stage2_complete: 1,
  stage3_in_progress: 0,
  stage3_complete: 1,
};

export const mockPropertyList: PropertyList = {
  uuid: 'test-uuid-1',
  owner: 'owner-uuid',
  title: 'Test Property List',
  state: 'DRAFT',
  rating_criteria: 'Location, Price, Size',
  rating_criteria_source: null,
  search_criteria: mockSearchCriteria,
  viewers: [],
  contributors: [],
  properties_count: 5,
  status_summary: mockStatusSummary,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

export const mockActivePropertyList: PropertyList = {
  ...mockPropertyList,
  uuid: 'test-uuid-2',
  title: 'Active Property List',
  state: 'ACTIVE',
};

export const mockPropertyListDetail: PropertyListDetail = {
  ...mockPropertyList,
  properties: [],
};

export const mockCreatePropertyListDto: CreatePropertyListDto = {
  title: 'New Property List',
  rating_criteria: 'Location, Price',
  viewers: [],
  contributors: [],
};

export const mockUpdatePropertyListDto: UpdatePropertyListDto = {
  title: 'Updated Property List',
  rating_criteria: 'Location, Price, Size, Condition',
};

export const mockActivateResponse = {
  status: 'success',
  state: 'ACTIVE',
};

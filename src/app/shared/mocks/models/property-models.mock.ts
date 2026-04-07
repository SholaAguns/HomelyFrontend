import {
  Property,
  PropertyDetail,
  CreatePropertyDto,
  UpdatePropertyDto,
  PropertyStateTransition,
  CreateFromInputRequest,
  CreateFromInputResponse,
  SearchCriteria,
  CreateFromSearchRequest,
  CreateFromSearchResponse,
  PropertyListTask,
  ScrapeProgressEvent,
  PropertyImage,
} from '../../models/property-models';

export const mockPropertyImage: PropertyImage = {
  id: 121,
  source_url: 'https:mock-url.jpg',
  url: 'http://test-urls.pg',
  caption: 'test-caption',
  order: 1,
  created_at: '2024-01-15T10:00:00Z',
  updated_at: '2024-01-15T10:00:00Z',
};

export const mockProperty: Property = {
  uuid: 'property-uuid-1',
  property_lists: { 'list-uuid-1': 'My Property List' },
  state: 'NEW',
  state_display: 'New',
  title: '2 Bedroom Flat',
  address_line_1: '123 Main Street',
  address_line_2: 'Apartment 4B',
  city: 'London',
  postcode: 'SW1A 1AA',
  latitude: 51.5074,
  longitude: -0.1278,
  price: 450000,
  bedrooms: 2,
  bathrooms: 1,
  square_area: 850,
  garden: false,
  parking: true,
  furnished_status: 'UNFURNISHED',
  council_tax_band: 'D',
  epc_rating: 'C',
  lease_length: 99,
  floor_level: 2,
  child_suitable: true,
  completion_date: '2024-06-01',
  external_id: 'rightmove-123456',
  external_url: 'https://www.rightmove.co.uk/properties/123456',
  normalized_address: '123 main street apartment 4b london sw1a 1aa',
  uprn: 'uprn-12345',
  overall_rating: null,
  rating_breakdown: null,
  disqualified: false,
  disqualification_reason: '',
  created_at: '2024-01-15T10:00:00Z',
  updated_at: '2024-01-15T10:00:00Z',
  images: [mockPropertyImage],
  primary_image: mockPropertyImage,
};

export const mockPropertyStage2Complete: Property = {
  ...mockProperty,
  uuid: 'property-uuid-2',
  state: 'STAGE2_COMPLETE',
  state_display: 'Stage 2 Complete',
  title: '3 Bedroom House',
  bedrooms: 3,
  price: 650000,
};

export const mockPropertyStage3Complete: Property = {
  ...mockProperty,
  uuid: 'property-uuid-3',
  state: 'STAGE3_COMPLETE',
  state_display: 'Stage 3 Complete',
  overall_rating: 85,
  rating_breakdown: {
    Price: { normalized_score: 85, weight: 1.5, weighted_score: 127.5, raw_value: 850000 },
    Bedrooms: { normalized_score: 80, weight: 1.0, weighted_score: 80, raw_value: 4 },
    'Distance to Work': { normalized_score: 90, weight: 1.5, weighted_score: 135, raw_value: 2.5 },
  },
  title: '4 Bedroom House',
  bedrooms: 4,
  price: 850000,
};

export const mockPropertyDetail: PropertyDetail = {
  ...mockProperty,
  context_data: [],
  available_transitions: ['run_stage2'],
};

export const mockCreatePropertyDto: CreatePropertyDto = {
  property_lists_input: ['list-uuid-1'],
  title: '2 Bedroom Flat',
  address_line_1: '123 Main Street',
  address_line_2: 'Apartment 4B',
  city: 'London',
  postcode: 'SW1A 1AA',
  latitude: 51.5074,
  longitude: -0.1278,
  price: 450000,
  bedrooms: 2,
  bathrooms: 1,
  square_area: 850,
  garden: false,
  parking: true,
  furnished_status: 'UNFURNISHED',
  council_tax_band: 'D',
  epc_rating: 'C',
  lease_length: 99,
  floor_level: 2,
  child_suitable: true,
  completion_date: '2024-06-01',
  external_id: 'rightmove-123456',
  external_url: 'https://www.rightmove.co.uk/properties/123456',
};

export const mockUpdatePropertyDto: UpdatePropertyDto = {
  title: 'Updated 2 Bedroom Flat',
  price: 475000,
};

export const mockPropertyStateTransition: PropertyStateTransition = {
  action: 'run_stage2',
  status: 'success',
  state: 'STAGE2_IN_PROGRESS',
  message: 'Stage 2 processing started',
};

export const mockCreateFromInputRequest: CreateFromInputRequest = {
  input_data: 'https://www.rightmove.co.uk/properties/123456',
  input_type: 'url',
  property_list_uuid: 'list-uuid-1',
};

export const mockCreateFromInputResponse: CreateFromInputResponse = {
  success: true,
  property: mockProperty,
  created: true,
  message: 'Property extracted successfully',
};

export const mockCreateFromInputResponseWithProperty: CreateFromInputResponse = {
  success: true,
  property: mockProperty,
  created: true,
  message: 'Property created successfully',
};

export const mockSearchCriteria: SearchCriteria = {
  area: 'Manchester',
  bedrooms_min: 2,
  bedrooms_max: 4,
  price_min: 1000,
  price_max: 2000,
  radius: 5,
  property_types: 'flat,house',
  max_days_since_added: 7,
};

export const mockCreateFromSearchRequest: CreateFromSearchRequest = {
  search_criteria: mockSearchCriteria,
  max_properties: 100,
};

export const mockPropertyListTask: PropertyListTask = {
  uuid: 'task-uuid-1',
  property_list: 'list-uuid-1',
  task_type: 'SCRAPE_SEARCH',
  status: 'IN_PROGRESS',
  celery_task_id: 'celery-task-123',
  total_items: 50,
  completed_items: 25,
  failed_items: 2,
  progress_percentage: 50,
  errors: ['Failed to scrape property 123', 'Timeout on property 456'],
  metadata: { search_criteria: mockSearchCriteria },
  websocket_url: 'ws://localhost:8000/ws/property_list.list-uuid-1',
  created_at: '2024-01-15T10:00:00Z',
  updated_at: '2024-01-15T10:30:00Z',
};

export const mockPropertyListTaskQueued: PropertyListTask = {
  ...mockPropertyListTask,
  uuid: 'task-uuid-2',
  status: 'QUEUED',
  completed_items: 0,
  progress_percentage: 0,
  errors: [],
};

export const mockPropertyListTaskCompleted: PropertyListTask = {
  ...mockPropertyListTask,
  uuid: 'task-uuid-3',
  status: 'COMPLETED',
  completed_items: 50,
  failed_items: 3,
  progress_percentage: 100,
};

export const mockPropertyListTaskFailed: PropertyListTask = {
  ...mockPropertyListTask,
  uuid: 'task-uuid-4',
  status: 'FAILED',
  errors: ['Failed to connect to Rightmove', 'API rate limit exceeded'],
};

export const mockCreateFromSearchResponse: CreateFromSearchResponse = {
  uuid: 'task-uuid-1',
  property_list_uuid: 'list-uuid-1',
  task_type: 'SCRAPE_SEARCH',
  status: 'QUEUED',
  websocket_url: 'ws://localhost:8000/ws/property_list.list-uuid-1',
  property_list: 'list-uuid-1',
  celery_task_id: 'celery-task-123',
  total_items: 0,
  completed_items: 0,
  failed_items: 0,
  progress_percentage: 0,
  errors: [],
  metadata: { search_criteria: mockSearchCriteria },
  created_at: '2024-01-15T10:00:00Z',
  updated_at: '2024-01-15T10:00:00Z',
};

export const mockScrapeProgressEvent: ScrapeProgressEvent = {
  uuid: 'task-uuid-1',
  status: 'IN_PROGRESS',
  completed_items: 25,
  total_items: 50,
  failed_items: 2,
  progress_percentage: 50,
  errors: ['Failed to scrape property 123'],
};

export const mockScrapeProgressEventCompleted: ScrapeProgressEvent = {
  ...mockScrapeProgressEvent,
  status: 'COMPLETED',
  completed_items: 50,
  progress_percentage: 100,
};

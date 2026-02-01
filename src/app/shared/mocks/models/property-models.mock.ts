import {
  Property,
  PropertyDetail,
  CreatePropertyDto,
  UpdatePropertyDto,
  PropertyStateTransition,
  CreateFromInputRequest,
  CreateFromInputResponse,
} from '../../models/property-models';

export const mockProperty: Property = {
  uuid: 'property-uuid-1',
  property_list: 'list-uuid-1',
  property_list_title: 'My Property List',
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
  overall_rating: 8.5,
  rating_breakdown: { location: 9, price: 8, schools: 8 },
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
  property_list: 'list-uuid-1',
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
  property_data: mockCreatePropertyDto,
  created: true,
  message: 'Property extracted successfully',
};

export const mockCreateFromInputResponseWithProperty: CreateFromInputResponse = {
  success: true,
  property: mockProperty,
  created: true,
  message: 'Property created successfully',
};

import {
  SavedLocation,
  CreateSavedLocationDto,
  UpdateSavedLocationDto,
} from '../../models/saved-location-models';

export const mockSavedLocation: SavedLocation = {
  uuid: 'test-location-uuid-1',
  user: 'testuser',
  name: 'Home',
  postcode: 'SW1A 1AA',
  address_line_1: '10 Downing Street',
  address_line_2: undefined,
  city: 'London',
  latitude: 51.503396,
  longitude: -0.127764,
  created_at: '2024-01-01T10:00:00Z',
  updated_at: '2024-01-01T10:00:00Z',
};

export const mockSavedLocation2: SavedLocation = {
  uuid: 'test-location-uuid-2',
  user: 'testuser',
  name: 'Office',
  postcode: 'EC1A 1BB',
  address_line_1: '1 Example Street',
  address_line_2: 'Floor 3',
  city: 'London',
  latitude: 51.517037,
  longitude: -0.09289,
  created_at: '2024-01-02T10:00:00Z',
  updated_at: '2024-01-02T10:00:00Z',
};

export const mockCreateSavedLocationDto: CreateSavedLocationDto = {
  name: 'New Location',
  postcode: 'M1 1AA',
  address_line_1: '123 Main Road',
  address_line_2: 'Flat 4',
  city: 'Manchester',
};

export const mockUpdateSavedLocationDto: UpdateSavedLocationDto = {
  name: 'Updated Home',
  city: 'Westminster',
};

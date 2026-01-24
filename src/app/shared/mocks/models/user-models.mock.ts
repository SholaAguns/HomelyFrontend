import { User, UserProfile } from '../../models/user-models';

export const mockUserProfile: UserProfile = {
  uuid: 'mock-uuid-123',
  bio: 'Test user bio',
  phone_number: '+1234567890',
  avatar: 'https://example.com/avatar.jpg',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z'
};

export const mockUser: User = {
  email: 'test@example.com',
  firstName: 'John',
  lastName: 'Doe',
  date_joined: '2024-01-01T00:00:00Z',
  profile: mockUserProfile
};

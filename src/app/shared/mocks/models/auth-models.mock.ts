import {
  LoginCredentials,
  LoginResponse,
  RegisterData,
  RegisterResponse,
} from '../../models/auth-models';
import { mockUser } from './user-models.mock';

export const mockLoginCredentials: LoginCredentials = {
  email: 'test@example.com',
  password: 'password123',
};

export const mockRegisterData: RegisterData = {
  email: 'test@example.com',
  password: 'password123',
  password2: 'password123',
  firstName: 'John',
  lastName: 'Doe',
};

export const mockLoginResponse: LoginResponse = {
  user: mockUser,
  access: 'mock-access-token',
  refresh: 'mock-refresh-token',
};

export const mockRegisterResponse: RegisterResponse = {
  access: 'mock-access-token',
  refresh: 'mock-refresh-token',
};

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
  first_name: 'John',
  last_name: 'Doe',
};

export const mockLoginResponse: LoginResponse = {
  user: mockUser,
};

export const mockRegisterResponse: RegisterResponse = {
  user: mockUser,
};

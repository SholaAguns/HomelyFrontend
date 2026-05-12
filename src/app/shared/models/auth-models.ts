import { User } from './user-models';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  first_name: string;
  last_name: string;
  password2: string;
}

export interface LoginResponse {
  user: User;
}

export interface RegisterResponse {
  user: User;
}

export type ProjectRole = 'owner' | 'contributor' | 'viewer' | null;

export interface ProjectRoleResponse {
  role: ProjectRole;
}

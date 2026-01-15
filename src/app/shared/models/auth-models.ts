import {User} from './user-models';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  firstName: string;
  lastName: string;
}


export interface LoginResponse {
  user: User;
  access: string;
  refresh: string;
}

export interface LogoutRequest {
  refresh: string;
}

export interface LogoutResponse {
  message: string;
}

export interface RegisterResponse {
  access: string;
  refresh: string;
}

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
  accessToken: string;
  refreshToken: string;
}

export interface LogoutRequest {
  refreshToken: string;
}

export interface LogoutResponse {
  message: string;
}

export interface RegisterResponse {
  accessToken: string;
  refreshToken: string;
}

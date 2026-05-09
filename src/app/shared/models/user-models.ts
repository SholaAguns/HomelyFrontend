export interface UserProfile {
  uuid: string;
  bio: string;
  phone_number: string;
  avatar: string;
  created_at: string;
  updated_at: string;
}

export interface EditUserProfileRequest {
  uuid: string;
  bio: string;
  phone_number: string;
  avatar: string;
}

export interface UpdateAccountDetailsRequest {
  first_name?: string;
  last_name?: string;
  email?: string;
  bio?: string;
  phone_number?: string;
}

export interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
}

export interface User {
  email: string;
  first_name: string;
  last_name: string;
  date_joined: string;
  profile: UserProfile;
}

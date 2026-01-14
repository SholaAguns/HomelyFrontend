export interface UserProfile{
  uuid: string;
  bio: string;
  phone_number: string;
  avatar: string;
  created_at: string;
  updated_at: string;
}

export interface EditUserProfileRequest{
  uuid: string;
  bio: string;
  phone_number: string;
  avatar: string;
}

export interface User {
  email: string;
  firstName: string;
  lastName: string;
  date_joined: string;
  profile: UserProfile;
}

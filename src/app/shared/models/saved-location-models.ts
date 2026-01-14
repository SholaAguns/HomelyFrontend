export interface SavedLocation {
  id: number;
  uuid: string;
  user: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  created_at: string;
  updated_at: string;
}

export interface CreateSavedLocationDto {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

export interface UpdateSavedLocationDto {
  name?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
}

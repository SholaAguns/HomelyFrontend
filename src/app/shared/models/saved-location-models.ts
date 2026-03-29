export interface SavedLocation {
  uuid: string;
  user: string;
  name: string;
  postcode: string;
  address_line_1: string;
  address_line_2?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  created_at: string;
  updated_at: string;
}

export interface CreateSavedLocationDto {
  name: string;
  postcode: string;
  address_line_1: string;
  address_line_2?: string;
  city?: string;
}

export interface UpdateSavedLocationDto {
  name?: string;
  postcode?: string;
  address_line_1?: string;
  address_line_2?: string;
  city?: string;
}

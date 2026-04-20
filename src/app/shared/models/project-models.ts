import { ContextOptions, UpdateContextOptionsDto } from './context-options.models';
import { PropertyList } from './property-list-models';

export interface Project {
  uuid: string;
  owner: string;
  title: string;
  description: string;
  viewers: string[];
  contributors: string[];
  rating_criteria: string | null;
  rating_criteria_name?: string;
  rating_criteria_source: string | null;
  rating_criteria_source_name?: string;
  context_options: ContextOptions | null;
  property_lists_count: number;
  created_at: string;
  updated_at: string;
}

export interface ProjectDetail extends Project {
  property_lists: PropertyList[];
}

export interface ProjectStats {
  total_properties: number;
  avg_price: number | null;
  min_price: number | null;
  max_price: number | null;
  property_lists_count: number;
  by_area: AreaBreakdown[];
  price_distribution: PriceDistribution[];
  property_types: PropertyTypeDistribution[];
}

export interface AreaBreakdown {
  name: string;
  list_count: number;
  property_count: number;
  avg_price: number;
}

export interface PriceDistribution {
  range: string;
  count: number;
}

export interface PropertyTypeDistribution {
  type: string;
  count: number;
}

export interface CreateProjectDto {
  title: string;
  description?: string;
}

export interface UpdateProjectDto {
  title?: string;
  description?: string;
  rating_criteria?: string | null;
}

export type CreateContextOptionsDto = UpdateContextOptionsDto;

export interface ProjectMember {
  email: string;
  first_name: string;
  last_name: string;
}

export interface ProjectMembers {
  owner: ProjectMember;
  viewers: ProjectMember[];
  contributors: ProjectMember[];
}

export interface ProjectInvitation {
  uuid: string;
  invited_email: string;
  role: 'viewer' | 'contributor';
  status: 'pending' | 'accepted' | 'declined' | 'revoked';
  invited_by_email: string;
  invited_by_name: string;
  project_title: string;
  invite_url: string | null;
  expires_at: string;
  created_at: string;
  accepted_at: string | null;
}

export interface InvitePreview {
  project_uuid: string;
  project_title: string;
  invited_by_name: string;
  invited_by_email: string;
  role: 'viewer' | 'contributor';
  expires_at: string;
}

export interface CreateInviteDto {
  email: string;
  role: 'viewer' | 'contributor';
}

export interface AcceptInviteResponse {
  project_uuid: string;
  role: 'viewer' | 'contributor';
}

export interface UserSearchResult {
  email: string;
  first_name: string;
  last_name: string;
}

export interface AppNotification {
  uuid: string;
  notification_type: 'invite_received' | 'invite_accepted' | 'invite_declined' | 'member_removed';
  title: string;
  message: string;
  related_object_uuid: string | null;
  related_object_type: string;
  is_read: boolean;
  created_at: string;
  actor_email: string | null;
  actor_name: string | null;
}

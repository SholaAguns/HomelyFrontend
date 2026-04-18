import {
  UserSearchResult,
  ProjectMember,
  ProjectMembers,
  ProjectInvitation,
  InvitePreview,
  AppNotification,
  AcceptInviteResponse,
} from '../../models/project-models';

export const mockUserSearchResult: UserSearchResult = {
  email: 'alice@example.com',
  first_name: 'Alice',
  last_name: 'Smith',
};

export const mockUserSearchResult2: UserSearchResult = {
  email: 'bob@example.com',
  first_name: 'Bob',
  last_name: 'Jones',
};

export const mockProjectMemberOwner: ProjectMember = {
  email: 'owner@example.com',
  first_name: 'Owner',
  last_name: 'User',
};

export const mockProjectMemberViewer: ProjectMember = {
  email: 'viewer@example.com',
  first_name: 'Viewer',
  last_name: 'User',
};

export const mockProjectMemberContributor: ProjectMember = {
  email: 'contributor@example.com',
  first_name: 'Contributor',
  last_name: 'User',
};

export const mockProjectMembers: ProjectMembers = {
  owner: mockProjectMemberOwner,
  viewers: [mockProjectMemberViewer],
  contributors: [mockProjectMemberContributor],
};

export const mockProjectInvitation: ProjectInvitation = {
  uuid: 'invite-uuid-1',
  email: 'alice@example.com',
  role: 'viewer',
  status: 'pending',
  invited_by_email: 'owner@example.com',
  invited_by_name: 'Owner User',
  project_title: 'Test Project',
  invite_url: 'http://localhost:4200/accept-invite?token=test-token',
  expires_at: '2026-04-23T00:00:00Z',
  created_at: '2026-04-16T00:00:00Z',
  accepted_at: null,
};

export const mockInvitePreview: InvitePreview = {
  project_uuid: 'project-uuid-1',
  project_title: 'Test Project',
  invited_by_name: 'Owner User',
  invited_by_email: 'owner@example.com',
  role: 'viewer',
  expires_at: '2026-04-23T00:00:00Z',
};

export const mockAcceptInviteResponse: AcceptInviteResponse = {
  project_uuid: 'project-uuid-1',
  role: 'viewer',
};

export const mockAppNotification: AppNotification = {
  uuid: 'notif-uuid-1',
  notification_type: 'invite_received',
  title: 'Project invitation',
  message: 'Owner User invited you to Test Project',
  related_object_uuid: 'project-uuid-1',
  related_object_type: 'project',
  is_read: false,
  created_at: '2026-04-16T00:00:00Z',
  actor_email: 'owner@example.com',
  actor_name: 'Owner User',
};

export const mockAppNotificationRead: AppNotification = {
  ...mockAppNotification,
  uuid: 'notif-uuid-2',
  is_read: true,
};

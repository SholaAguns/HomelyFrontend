import { vi } from 'vitest';

export function createSharingServiceMock() {
  return {
    getMembers: vi.fn(),
    getInvitations: vi.fn(),
    createInvite: vi.fn(),
    revokeInvite: vi.fn(),
    removeMember: vi.fn(),
    previewInvite: vi.fn(),
    acceptInvite: vi.fn(),
    declineInvite: vi.fn(),
    searchUsers: vi.fn(),
  };
}

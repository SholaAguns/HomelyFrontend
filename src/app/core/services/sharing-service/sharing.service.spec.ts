import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { firstValueFrom, of } from 'rxjs';
import { SharingService } from './sharing.service';
import { ApiService } from '../api-service/api.service';
import { createApiServiceMock } from '../../../shared/mocks/api-service.mock';
import {
  mockProjectMembers,
  mockProjectInvitation,
  mockInvitePreview,
  mockAcceptInviteResponse,
  mockUserSearchResult,
  mockUserSearchResult2,
} from '../../../shared/mocks/models/project-sharing-models.mock';

describe('SharingService', () => {
  let service: SharingService;
  let apiMock: ReturnType<typeof createApiServiceMock>;

  const PROJECT_UUID = 'project-uuid-1';

  beforeEach(() => {
    apiMock = createApiServiceMock();
    TestBed.configureTestingModule({
      providers: [SharingService, { provide: ApiService, useValue: apiMock }],
    });
    service = TestBed.inject(SharingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getMembers', () => {
    it('should GET project members', async () => {
      apiMock.get.mockReturnValue(of(mockProjectMembers));
      const result = await firstValueFrom(service.getMembers(PROJECT_UUID));
      expect(result).toEqual(mockProjectMembers);
      expect(apiMock.get).toHaveBeenCalledWith(`property/projects/${PROJECT_UUID}/members/`);
    });
  });

  describe('getInvitations', () => {
    it('should GET pending invitations', async () => {
      apiMock.get.mockReturnValue(of([mockProjectInvitation]));
      const result = await firstValueFrom(service.getInvitations(PROJECT_UUID));
      expect(result).toEqual([mockProjectInvitation]);
      expect(apiMock.get).toHaveBeenCalledWith(`property/projects/${PROJECT_UUID}/invitations/`);
    });
  });

  describe('createInvite', () => {
    it('should POST invite and return invitation', async () => {
      apiMock.post.mockReturnValue(of(mockProjectInvitation));
      const dto = { email: 'alice@example.com', role: 'viewer' as const };
      const result = await firstValueFrom(service.createInvite(PROJECT_UUID, dto));
      expect(result).toEqual(mockProjectInvitation);
      expect(apiMock.post).toHaveBeenCalledWith(`property/projects/${PROJECT_UUID}/invite/`, dto);
    });
  });

  describe('revokeInvite', () => {
    it('should DELETE invitation by uuid', async () => {
      apiMock.delete.mockReturnValue(of(undefined));
      await firstValueFrom(service.revokeInvite(PROJECT_UUID, 'invite-uuid-1'));
      expect(apiMock.delete).toHaveBeenCalledWith(
        `property/projects/${PROJECT_UUID}/invitations/invite-uuid-1/`
      );
    });
  });

  describe('removeMember', () => {
    it('should DELETE member by email with encoding', async () => {
      apiMock.delete.mockReturnValue(of(undefined));
      await firstValueFrom(service.removeMember(PROJECT_UUID, 'viewer@example.com'));
      expect(apiMock.delete).toHaveBeenCalledWith(
        `property/projects/${PROJECT_UUID}/members/viewer%40example.com/`
      );
    });
  });

  describe('previewInvite', () => {
    it('should GET invite preview with encoded token', async () => {
      apiMock.get.mockReturnValue(of(mockInvitePreview));
      const result = await firstValueFrom(service.previewInvite('test-token'));
      expect(result).toEqual(mockInvitePreview);
      expect(apiMock.get).toHaveBeenCalledWith(
        'property/projects/preview-invite/?token=test-token'
      );
    });
  });

  describe('acceptInvite', () => {
    it('should POST accept with token', async () => {
      apiMock.post.mockReturnValue(of(mockAcceptInviteResponse));
      const result = await firstValueFrom(service.acceptInvite('test-token'));
      expect(result).toEqual(mockAcceptInviteResponse);
      expect(apiMock.post).toHaveBeenCalledWith('property/projects/accept-invite/', {
        token: 'test-token',
      });
    });
  });

  describe('declineInvite', () => {
    it('should POST decline with token', async () => {
      apiMock.post.mockReturnValue(of(undefined));
      await firstValueFrom(service.declineInvite('test-token'));
      expect(apiMock.post).toHaveBeenCalledWith('property/projects/decline-invite/', {
        token: 'test-token',
      });
    });
  });

  describe('searchUsers', () => {
    it('should GET users matching query', async () => {
      apiMock.get.mockReturnValue(of([mockUserSearchResult, mockUserSearchResult2]));
      const result = await firstValueFrom(service.searchUsers('ali'));
      expect(result).toEqual([mockUserSearchResult, mockUserSearchResult2]);
      expect(apiMock.get).toHaveBeenCalledWith('accounts/users/search/?q=ali');
    });

    it('should encode the query string', async () => {
      apiMock.get.mockReturnValue(of([]));
      await firstValueFrom(service.searchUsers('first last'));
      expect(apiMock.get).toHaveBeenCalledWith('accounts/users/search/?q=first%20last');
    });
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { of, throwError } from 'rxjs';
import { ProjectSettingsComponent } from './project-settings.component';
import { ProjectStore } from '../../store/project.store';
import { ActivatedRoute, Router } from '@angular/router';
import { signal } from '@angular/core';
import { Project } from '../../../../shared/models/project-models';
import { ContextOptions } from '../../../../shared/models/context-options.models';
import { SharingService } from '../../../../core/services/sharing-service/sharing.service';
import { NotificationService } from '../../../../core/services/notification-service/notification.service';
import { SavedLocationService } from '../../../../core/services/saved-location.service';
import { RatingCriteriaStore } from '../../store/rating-criteria.store';
import { createSharingServiceMock } from '../../../../shared/mocks/sharing-service.mock';
import {
  mockProjectMembers,
  mockProjectInvitation,
  mockUserSearchResult,
} from '../../../../shared/mocks/models/project-sharing-models.mock';

describe('ProjectSettingsComponent', () => {
  let component: ProjectSettingsComponent;
  let fixture: ComponentFixture<ProjectSettingsComponent>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockProjectStore: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockRouter: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockRoute: any;
  let mockSharingService: ReturnType<typeof createSharingServiceMock>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockNotificationService: any;

  const mockProject: Project = {
    uuid: 'test-uuid',
    owner: 'test-owner',
    title: 'Test Project',
    description: 'Test Description',
    viewers: [],
    contributors: [],
    rating_criteria: 'Test criteria',
    rating_criteria_source: null,
    context_options: null,
    property_lists_count: 0,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  };

  const mockContextOptions: ContextOptions = {
    uuid: 'context-uuid',
    project: 'test-uuid',
    enable_crime: true,
    enable_schools: true,
    school_types: ['primary'],
    enable_broadband: true,
    enable_mobile: false,
    enable_council_tax: true,
    enable_poi: true,
    poi_types: ['restaurant', 'supermarket'],
    poi_search_radius_meters: 1000,
    enable_saved_locations: false,
    saved_location_uuids: [],
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  };

  beforeEach(async () => {
    mockSharingService = createSharingServiceMock();
    mockSharingService.getMembers.mockReturnValue(of(mockProjectMembers));
    mockSharingService.getInvitations.mockReturnValue(of([]));

    mockProjectStore = {
      selectedDetail: signal({ ...mockProject, context_options: mockContextOptions }),
      loading: signal(false),
      update: vi.fn(),
      setContextOptions: vi.fn(),
      delete: vi.fn(),
      loadDetail: vi.fn(),
      error: signal(null),
    };

    mockRouter = { navigate: vi.fn() };

    mockRoute = {
      snapshot: { paramMap: { get: vi.fn().mockReturnValue('test-uuid') } },
    };

    mockNotificationService = { success: vi.fn(), error: vi.fn(), info: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [ProjectSettingsComponent],
      providers: [
        { provide: ProjectStore, useValue: mockProjectStore },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockRoute },
        { provide: SharingService, useValue: mockSharingService },
        { provide: NotificationService, useValue: mockNotificationService },
        { provide: SavedLocationService, useValue: { getAll: vi.fn().mockReturnValue(of([])) } },
        { provide: RatingCriteriaStore, useValue: { loadAll: vi.fn(), allCriteria: signal([]) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectSettingsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load project detail on init', () => {
    component.ngOnInit();
    expect(mockProjectStore.loadDetail).toHaveBeenCalledWith('test-uuid');
  });

  it('should initialise title and description from project', async () => {
    vi.useFakeTimers();
    component.ngOnInit();
    vi.advanceTimersByTime(600);
    expect(component.title()).toBe('Test Project');
    expect(component.description()).toBe('Test Description');
    vi.useRealTimers();
  });

  it('should initialise context options from project', async () => {
    vi.useFakeTimers();
    component.ngOnInit();
    vi.advanceTimersByTime(600);
    expect(component.enableCrime()).toBe(true);
    expect(component.enableSchools()).toBe(true);
    expect(component.schoolTypes()).toEqual(['primary']);
    expect(component.enablePoi()).toBe(true);
    expect(component.poiTypes()).toEqual(['restaurant', 'supermarket']);
    vi.useRealTimers();
  });

  it('should call update on saveProjectDetails', () => {
    component.projectUuid = 'test-uuid';
    component.title.set('Updated Title');
    component.description.set('Updated Description');
    component.saveProjectDetails();
    expect(mockProjectStore.update).toHaveBeenCalledWith({
      uuid: 'test-uuid',
      data: { title: 'Updated Title', description: 'Updated Description' },
    });
  });

  it('should call setContextOptions on saveContextOptions', () => {
    component.projectUuid = 'test-uuid';
    component.enableCrime.set(true);
    component.enableSchools.set(false);
    component.saveContextOptions();
    expect(mockProjectStore.setContextOptions).toHaveBeenCalledWith(
      expect.objectContaining({
        uuid: 'test-uuid',
        data: expect.objectContaining({ enable_crime: true, enable_schools: false }),
      })
    );
  });

  it('should call update on saveRatingCriteria', () => {
    component.projectUuid = 'test-uuid';
    component.ratingCriteria.set('New criteria');
    component.saveRatingCriteria();
    expect(mockProjectStore.update).toHaveBeenCalledWith({
      uuid: 'test-uuid',
      data: { rating_criteria: 'New criteria' },
    });
  });

  it('should toggle school type', () => {
    component.schoolTypes.set(['primary']);
    component.toggleSchoolType('secondary');
    expect(component.schoolTypes()).toContain('secondary');
    component.toggleSchoolType('primary');
    expect(component.schoolTypes()).not.toContain('primary');
  });

  it('should toggle POI type', () => {
    component.poiTypes.set(['restaurant']);
    component.togglePoiType('supermarket');
    expect(component.poiTypes()).toContain('supermarket');
    component.togglePoiType('restaurant');
    expect(component.poiTypes()).not.toContain('restaurant');
  });

  it('should open and close delete modal', () => {
    component.openDeleteModal();
    expect(component.showDeleteModal()).toBe(true);
    component.closeDeleteModal();
    expect(component.showDeleteModal()).toBe(false);
  });

  it('should delete project when confirmation matches', () => {
    vi.useFakeTimers();
    mockProjectStore.loading.set(false);
    component.projectUuid = 'test-uuid';
    component.deleteConfirmation.set('delete');
    component.confirmDelete();
    expect(mockProjectStore.delete).toHaveBeenCalledWith('test-uuid');
    vi.advanceTimersByTime(200);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/projects']);
    vi.useRealTimers();
  });

  it('should not delete when confirmation does not match', () => {
    component.projectUuid = 'test-uuid';
    component.deleteConfirmation.set('wrong');
    component.confirmDelete();
    expect(mockProjectStore.delete).not.toHaveBeenCalled();
  });

  it('should navigate back to project', () => {
    component.projectUuid = 'test-uuid';
    component.navigateBack();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/projects', 'test-uuid']);
  });

  describe('sharing — loadMembers', () => {
    it('should load members on init', () => {
      component.projectUuid = 'test-uuid';
      component.loadMembers();
      expect(mockSharingService.getMembers).toHaveBeenCalledWith('test-uuid');
      expect(component.members()).toEqual(mockProjectMembers);
    });
  });

  describe('sharing — loadInvitations', () => {
    it('should load pending invitations', () => {
      mockSharingService.getInvitations.mockReturnValue(of([mockProjectInvitation]));
      component.projectUuid = 'test-uuid';
      component.loadInvitations();
      expect(component.pendingInvitations()).toEqual([mockProjectInvitation]);
    });
  });

  describe('sharing — selectSearchResult', () => {
    it('should set selectedUser and clear results', () => {
      component.userSearchResults.set([mockUserSearchResult]);
      component.selectSearchResult(mockUserSearchResult);
      expect(component.selectedUser()).toEqual(mockUserSearchResult);
      expect(component.userSearchResults()).toHaveLength(0);
    });
  });

  describe('sharing — addMemberDirect', () => {
    it('should send invite and reload members on success', async () => {
      mockSharingService.createInvite.mockReturnValue(of(mockProjectInvitation));
      component.projectUuid = 'test-uuid';
      component.selectedUser.set(mockUserSearchResult);
      component.newMemberRole.set('viewer');
      component.addMemberDirect();
      await new Promise((r) => setTimeout(r, 10));
      expect(mockSharingService.createInvite).toHaveBeenCalledWith('test-uuid', {
        invited_email: mockUserSearchResult.email,
        role: 'viewer',
      });
      expect(mockNotificationService.success).toHaveBeenCalled();
      expect(component.selectedUser()).toBeNull();
    });

    it('should show error notification on failure', async () => {
      mockSharingService.createInvite.mockReturnValue(
        throwError(() => ({ error: { detail: 'Already a member' } }))
      );
      component.projectUuid = 'test-uuid';
      component.selectedUser.set(mockUserSearchResult);
      component.addMemberDirect();
      await new Promise((r) => setTimeout(r, 10));
      expect(mockNotificationService.error).toHaveBeenCalledWith('Already a member');
    });

    it('should do nothing when no user selected', () => {
      component.selectedUser.set(null);
      component.addMemberDirect();
      expect(mockSharingService.createInvite).not.toHaveBeenCalled();
    });
  });

  describe('sharing — removeMember', () => {
    it('should remove member and reload members', async () => {
      mockSharingService.removeMember.mockReturnValue(of(undefined));
      component.projectUuid = 'test-uuid';
      component.removeMember('viewer@example.com');
      await new Promise((r) => setTimeout(r, 10));
      expect(mockSharingService.removeMember).toHaveBeenCalledWith(
        'test-uuid',
        'viewer@example.com'
      );
      expect(mockNotificationService.success).toHaveBeenCalled();
    });

    it('should show error on remove failure', async () => {
      mockSharingService.removeMember.mockReturnValue(throwError(() => ({ error: {} })));
      component.projectUuid = 'test-uuid';
      component.removeMember('viewer@example.com');
      await new Promise((r) => setTimeout(r, 10));
      expect(mockNotificationService.error).toHaveBeenCalled();
    });
  });

  describe('sharing — sendInvite', () => {
    it('should create invite, set URL and reload invitations', async () => {
      mockSharingService.createInvite.mockReturnValue(of(mockProjectInvitation));
      component.projectUuid = 'test-uuid';
      component.inviteEmail.set('alice@example.com');
      component.inviteRole.set('viewer');
      component.sendInvite();
      await new Promise((r) => setTimeout(r, 10));
      expect(mockSharingService.createInvite).toHaveBeenCalledWith('test-uuid', {
        invited_email: 'alice@example.com',
        role: 'viewer',
      });
      expect(component.lastInviteUrl()).toBe(mockProjectInvitation.invite_url);
      expect(component.sendingInvite()).toBe(false);
    });

    it('should do nothing when email is empty', () => {
      component.inviteEmail.set('  ');
      component.sendInvite();
      expect(mockSharingService.createInvite).not.toHaveBeenCalled();
    });

    it('should show error and reset sending state on failure', async () => {
      mockSharingService.createInvite.mockReturnValue(throwError(() => ({ error: {} })));
      component.projectUuid = 'test-uuid';
      component.inviteEmail.set('alice@example.com');
      component.sendInvite();
      await new Promise((r) => setTimeout(r, 10));
      expect(mockNotificationService.error).toHaveBeenCalled();
      expect(component.sendingInvite()).toBe(false);
    });
  });

  describe('sharing — revokeInvitation', () => {
    it('should revoke invite and reload invitations', async () => {
      mockSharingService.revokeInvite.mockReturnValue(of(undefined));
      component.projectUuid = 'test-uuid';
      component.revokeInvitation('invite-uuid-1');
      await new Promise((r) => setTimeout(r, 10));
      expect(mockSharingService.revokeInvite).toHaveBeenCalledWith('test-uuid', 'invite-uuid-1');
      expect(mockNotificationService.success).toHaveBeenCalled();
    });
  });

  describe('sharing — formatInviteDate', () => {
    it('should return a formatted date string', () => {
      const result = component.formatInviteDate('2026-04-23T00:00:00Z');
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });
  });
});

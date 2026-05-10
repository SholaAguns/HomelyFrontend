import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { signal } from '@angular/core';
import { of, throwError } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjectDetailComponent } from './project-detail.component';
import { ProjectStore } from '../../store/project.store';
import { PropertyListStore } from '../../../property-lists/store/property-list.store';
import { AuthService } from '../../../../core/services/auth-service/auth.service';
import { FavoritesService } from '../../../../core/services/favorites-service/favorites.service';
import { NotificationService } from '../../../../core/services/notification-service/notification.service';
import { SharingService } from '../../../../core/services/sharing-service/sharing.service';
import { createNotificationServiceMock } from '../../../../shared/mocks/notification-service.mock';
import { createSharingServiceMock } from '../../../../shared/mocks/sharing-service.mock';
import { ProjectDetail } from '../../../../shared/models/project-models';

const mockProjectDetail: ProjectDetail = {
  uuid: 'project-uuid-1',
  title: 'Test Project',
  description: 'A test project',
  owner: 'owner@example.com',
  viewers: [],
  contributors: [],
  rating_criteria: '',
  rating_criteria_source: null,
  context_options: null,
  property_lists: [],
  property_lists_count: 0,
  created_at: '2024-01-01',
  updated_at: '2024-01-01',
};

function createProjectStoreMock(detail: ProjectDetail | null = mockProjectDetail) {
  return {
    selectedDetail: signal(detail),
    loading: signal(false),
    loadDetail: vi.fn(),
    loadStats: vi.fn(),
  };
}

function createListStoreMock() {
  return {
    loading: signal(false),
    count: signal(0),
    all: signal([]),
    load: vi.fn(),
  };
}

function createAuthServiceMock(role: 'owner' | 'contributor' | 'viewer' | null = 'contributor') {
  return {
    getCurrentUser: vi.fn().mockReturnValue(of({})),
    getUserRole: vi.fn().mockReturnValue(of({ role })),
    canEdit: vi
      .fn()
      .mockImplementation(
        (_uuid: string, r: string | null) => r === 'owner' || r === 'contributor'
      ),
    isOwner: vi.fn().mockImplementation((_uuid: string, r: string | null) => r === 'owner'),
    canView: vi.fn().mockImplementation((_uuid: string, r: string | null) => r !== null),
  };
}

function createFavoritesServiceMock() {
  return {
    getProjectFavorites: vi.fn().mockReturnValue(of([])),
    addFavorite: vi.fn().mockReturnValue(of({})),
    removeFavorite: vi.fn().mockReturnValue(of({})),
  };
}

const PROJECT_UUID = 'project-uuid-1';

describe('ProjectDetailComponent', () => {
  let component: ProjectDetailComponent;
  let fixture: ComponentFixture<ProjectDetailComponent>;
  let projectStoreMock: ReturnType<typeof createProjectStoreMock>;
  let listStoreMock: ReturnType<typeof createListStoreMock>;
  let authServiceMock: ReturnType<typeof createAuthServiceMock>;
  let favoritesServiceMock: ReturnType<typeof createFavoritesServiceMock>;
  let notificationServiceMock: ReturnType<typeof createNotificationServiceMock>;
  let sharingServiceMock: ReturnType<typeof createSharingServiceMock>;
  let routerMock: { navigate: ReturnType<typeof vi.fn> };

  async function setupComponent(role: 'owner' | 'contributor' | 'viewer' | null = 'contributor') {
    projectStoreMock = createProjectStoreMock();
    listStoreMock = createListStoreMock();
    authServiceMock = createAuthServiceMock(role);
    favoritesServiceMock = createFavoritesServiceMock();
    notificationServiceMock = createNotificationServiceMock();
    sharingServiceMock = createSharingServiceMock();
    sharingServiceMock.leaveProject.mockReturnValue(of(undefined));
    routerMock = { navigate: vi.fn() };

    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [ProjectDetailComponent],
      providers: [
        { provide: ProjectStore, useValue: projectStoreMock },
        { provide: PropertyListStore, useValue: listStoreMock },
        { provide: AuthService, useValue: authServiceMock },
        { provide: FavoritesService, useValue: favoritesServiceMock },
        { provide: NotificationService, useValue: notificationServiceMock },
        { provide: SharingService, useValue: sharingServiceMock },
        { provide: Router, useValue: routerMock },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: vi.fn().mockReturnValue(PROJECT_UUID) } } },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await new Promise((r) => setTimeout(r, 0));
  }

  beforeEach(async () => {
    await setupComponent('contributor');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should read uuid from route and load project data', () => {
      expect(component.projectUuid).toBe(PROJECT_UUID);
      expect(projectStoreMock.loadDetail).toHaveBeenCalledWith(PROJECT_UUID);
      expect(projectStoreMock.loadStats).toHaveBeenCalledWith(PROJECT_UUID);
      expect(listStoreMock.load).toHaveBeenCalledWith(PROJECT_UUID);
    });

    it('should set userRole from getUserRole response', async () => {
      expect(authServiceMock.getUserRole).toHaveBeenCalledWith(PROJECT_UUID);
      expect(component.userRole()).toBe('contributor');
    });
  });

  describe('role-based visibility — contributor', () => {
    it('canEdit should be true for contributor', () => {
      expect(component.canEdit()).toBe(true);
    });

    it('isOwner should be false for contributor', () => {
      expect(component.isOwner()).toBe(false);
    });

    it('canLeave should be true for contributor', () => {
      expect(component.canLeave()).toBe(true);
    });
  });

  describe('role-based visibility — owner', () => {
    beforeEach(async () => {
      await setupComponent('owner');
    });

    it('canEdit should be true for owner', () => {
      expect(component.canEdit()).toBe(true);
    });

    it('isOwner should be true for owner', () => {
      expect(component.isOwner()).toBe(true);
    });

    it('canLeave should be false for owner', () => {
      expect(component.canLeave()).toBe(false);
    });
  });

  describe('role-based visibility — viewer', () => {
    beforeEach(async () => {
      await setupComponent('viewer');
    });

    it('canEdit should be false for viewer', () => {
      expect(component.canEdit()).toBe(false);
    });

    it('isOwner should be false for viewer', () => {
      expect(component.isOwner()).toBe(false);
    });

    it('canLeave should be true for viewer', () => {
      expect(component.canLeave()).toBe(true);
    });
  });

  describe('actions menu', () => {
    it('should toggle showActionsMenu on set', () => {
      expect(component.showActionsMenu()).toBe(false);
      component.showActionsMenu.set(true);
      expect(component.showActionsMenu()).toBe(true);
    });

    it('should open leave modal and close actions menu', () => {
      component.showActionsMenu.set(true);
      component.showActionsMenu.set(false);
      component.showLeaveModal.set(true);
      expect(component.showActionsMenu()).toBe(false);
      expect(component.showLeaveModal()).toBe(true);
    });
  });

  describe('confirmLeaveProject', () => {
    it('should call leaveProject and navigate to /projects on success', async () => {
      component.confirmLeaveProject();
      await new Promise((r) => setTimeout(r, 0));

      expect(sharingServiceMock.leaveProject).toHaveBeenCalledWith(PROJECT_UUID);
      expect(notificationServiceMock.success).toHaveBeenCalledWith('You have left the project');
      expect(routerMock.navigate).toHaveBeenCalledWith(['/projects']);
    });

    it('should set leavingProject true while in flight', () => {
      sharingServiceMock.leaveProject.mockReturnValue(of(undefined));
      component.confirmLeaveProject();
      // synchronously, leavingProject is set true before subscribe resolves
      expect(component.leavingProject()).toBe(true);
    });

    it('should show error and reset state when leaveProject fails', async () => {
      sharingServiceMock.leaveProject.mockReturnValue(throwError(() => new Error()));
      component.showLeaveModal.set(true);
      component.confirmLeaveProject();
      await new Promise((r) => setTimeout(r, 0));

      expect(notificationServiceMock.error).toHaveBeenCalledWith('Failed to leave project');
      expect(component.leavingProject()).toBe(false);
      expect(component.showLeaveModal()).toBe(false);
    });

    it('should not navigate on failure', async () => {
      sharingServiceMock.leaveProject.mockReturnValue(throwError(() => new Error()));
      component.confirmLeaveProject();
      await new Promise((r) => setTimeout(r, 0));

      expect(routerMock.navigate).not.toHaveBeenCalled();
    });
  });

  describe('navigation', () => {
    it('should navigate to settings', () => {
      component.navigateToSettings();
      expect(routerMock.navigate).toHaveBeenCalledWith(['/projects', PROJECT_UUID, 'settings']);
    });

    it('should navigate to create list', () => {
      component.navigateToCreateList();
      expect(routerMock.navigate).toHaveBeenCalledWith(['/projects', PROJECT_UUID, 'lists', 'new']);
    });

    it('should navigate to dashboard', () => {
      component.navigateToDashboard();
      expect(routerMock.navigate).toHaveBeenCalledWith(['/projects', PROJECT_UUID, 'dashboard']);
    });
  });
});

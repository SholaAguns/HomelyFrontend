import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { of, throwError } from 'rxjs';
import { signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AcceptInviteComponent } from './accept-invite.component';
import { AuthStore } from '../../../core/stores/auth-store/auth.store';
import { SharingService } from '../../../core/services/sharing-service/sharing.service';
import { NotificationService } from '../../../core/services/notification-service/notification.service';
import { createSharingServiceMock } from '../../../shared/mocks/sharing-service.mock';
import {
  mockInvitePreview,
  mockAcceptInviteResponse,
} from '../../../shared/mocks/models/project-sharing-models.mock';

describe('AcceptInviteComponent', () => {
  let component: AcceptInviteComponent;
  let fixture: ComponentFixture<AcceptInviteComponent>;
  let sharingMock: ReturnType<typeof createSharingServiceMock>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let routerMock: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let routeMock: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let authStoreMock: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let notificationMock: any;

  function buildRoute(token: string) {
    return {
      snapshot: { queryParamMap: { get: vi.fn().mockReturnValue(token) } },
    };
  }

  beforeEach(async () => {
    sharingMock = createSharingServiceMock();
    routerMock = { navigate: vi.fn() };
    notificationMock = { success: vi.fn(), error: vi.fn(), info: vi.fn() };
    authStoreMock = { isAuthenticated: signal(true) };
    routeMock = buildRoute('test-token');
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [AcceptInviteComponent],
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: routeMock },
        { provide: AuthStore, useValue: authStoreMock },
        { provide: SharingService, useValue: sharingMock },
        { provide: NotificationService, useValue: notificationMock },
      ],
    }).compileComponents();
  });

  function create() {
    fixture = TestBed.createComponent(AcceptInviteComponent);
    component = fixture.componentInstance;
  }

  describe('when token is missing', () => {
    beforeEach(async () => {
      routeMock.snapshot.queryParamMap.get.mockReturnValue('');
      await TestBed.overrideProvider(ActivatedRoute, { useValue: routeMock });
      create();
      component.ngOnInit();
    });

    it('should show error state', () => {
      expect(component.errorCode()).toBe('missing_token');
      expect(component.loading()).toBe(false);
    });
  });

  describe('when unauthenticated', () => {
    beforeEach(async () => {
      authStoreMock = { isAuthenticated: signal(false) };
      await TestBed.overrideProvider(AuthStore, { useValue: authStoreMock });
      create();
      component.ngOnInit();
    });

    it('should store token in localStorage and redirect to login', () => {
      expect(localStorage.getItem('pending_invite_token')).toBe('test-token');
      expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
    });
  });

  describe('when authenticated and token is valid', () => {
    beforeEach(async () => {
      sharingMock.previewInvite.mockReturnValue(of(mockInvitePreview));
      create();
      component.ngOnInit();
      await new Promise((r) => setTimeout(r, 10));
    });

    it('should display invite preview', () => {
      expect(component.preview()).toEqual(mockInvitePreview);
      expect(component.loading()).toBe(false);
      expect(component.errorCode()).toBeNull();
    });
  });

  describe('when preview returns error', () => {
    beforeEach(async () => {
      sharingMock.previewInvite.mockReturnValue(
        throwError(() => ({ error: { error: 'invitation_already_used' } }))
      );
      create();
      component.ngOnInit();
      await new Promise((r) => setTimeout(r, 10));
    });

    it('should show invitation_already_used error', () => {
      expect(component.errorCode()).toBe('invitation_already_used');
      expect(component.loading()).toBe(false);
    });
  });

  describe('when preview returns unknown error', () => {
    beforeEach(async () => {
      sharingMock.previewInvite.mockReturnValue(throwError(() => ({ error: {} })));
      create();
      component.ngOnInit();
      await new Promise((r) => setTimeout(r, 10));
    });

    it('should show generic expired error', () => {
      expect(component.errorCode()).toBeTruthy();
      expect(component.loading()).toBe(false);
    });
  });

  describe('accept', () => {
    beforeEach(async () => {
      sharingMock.previewInvite.mockReturnValue(of(mockInvitePreview));
      create();
      component.ngOnInit();
      await new Promise((r) => setTimeout(r, 10));
    });

    it('should call acceptInvite and navigate to project', async () => {
      sharingMock.acceptInvite.mockReturnValue(of(mockAcceptInviteResponse));
      component.accept();
      await new Promise((r) => setTimeout(r, 10));
      expect(sharingMock.acceptInvite).toHaveBeenCalledWith('test-token');
      expect(notificationMock.success).toHaveBeenCalled();
      expect(routerMock.navigate).toHaveBeenCalledWith([
        '/projects',
        mockAcceptInviteResponse.project_uuid,
      ]);
    });

    it('should show email_mismatch error notification on 403', async () => {
      sharingMock.acceptInvite.mockReturnValue(
        throwError(() => ({ error: { error: 'email_mismatch' } }))
      );
      component.accept();
      await new Promise((r) => setTimeout(r, 10));
      expect(notificationMock.error).toHaveBeenCalledWith(
        expect.stringContaining('different email')
      );
      expect(component.acting()).toBe(false);
    });

    it('should show generic error on unknown failure', async () => {
      sharingMock.acceptInvite.mockReturnValue(throwError(() => ({ error: {} })));
      component.accept();
      await new Promise((r) => setTimeout(r, 10));
      expect(notificationMock.error).toHaveBeenCalled();
    });
  });

  describe('decline', () => {
    beforeEach(async () => {
      sharingMock.previewInvite.mockReturnValue(of(mockInvitePreview));
      create();
      component.ngOnInit();
      await new Promise((r) => setTimeout(r, 10));
    });

    it('should call declineInvite and navigate to projects', async () => {
      sharingMock.declineInvite.mockReturnValue(of(undefined));
      component.decline();
      await new Promise((r) => setTimeout(r, 10));
      expect(sharingMock.declineInvite).toHaveBeenCalledWith('test-token');
      expect(notificationMock.info).toHaveBeenCalled();
      expect(routerMock.navigate).toHaveBeenCalledWith(['/projects']);
    });

    it('should show error on decline failure', async () => {
      sharingMock.declineInvite.mockReturnValue(throwError(() => ({})));
      component.decline();
      await new Promise((r) => setTimeout(r, 10));
      expect(notificationMock.error).toHaveBeenCalled();
      expect(component.acting()).toBe(false);
    });
  });

  describe('formatDate', () => {
    it('should return a formatted date string', () => {
      create();
      const result = component.formatDate('2026-04-23T00:00:00Z');
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });
  });
});

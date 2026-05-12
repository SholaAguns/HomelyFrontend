import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Router } from '@angular/router';
import { AuthStore } from './auth.store';
import { AuthService } from '../../services/auth-service/auth.service';
import { NotificationService } from '../../services/notification-service/notification.service';
import { NotificationStore } from '../notification-store/notification.store';
import { of, throwError } from 'rxjs';
import {
  mockLoginCredentials,
  mockLoginResponse,
  mockRegisterData,
  mockRegisterResponse,
} from '../../../shared/mocks/models/auth-models.mock';
import { createRouterMock } from '../../../shared/mocks/router.mock';
import { createNotificationStoreMock } from '../../../shared/mocks/notification-store.mock';

describe('AuthStore', () => {
  let service: InstanceType<typeof AuthStore>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let routerMock: any;
  let authServiceMock: {
    login: ReturnType<typeof vi.fn>;
    register: ReturnType<typeof vi.fn>;
    logout: ReturnType<typeof vi.fn>;
    getCurrentUser: ReturnType<typeof vi.fn>;
  };
  let notificationServiceMock: {
    success: ReturnType<typeof vi.fn>;
    error: ReturnType<typeof vi.fn>;
    info: ReturnType<typeof vi.fn>;
  };
  let notificationStoreMock: ReturnType<typeof createNotificationStoreMock>;

  beforeEach(() => {
    routerMock = createRouterMock();
    localStorage.clear();

    authServiceMock = {
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      getCurrentUser: vi.fn(),
    };

    notificationServiceMock = {
      success: vi.fn(),
      error: vi.fn(),
      info: vi.fn(),
    };

    notificationStoreMock = createNotificationStoreMock();

    TestBed.configureTestingModule({
      providers: [
        AuthStore,
        { provide: Router, useValue: routerMock },
        { provide: AuthService, useValue: authServiceMock },
        { provide: NotificationService, useValue: notificationServiceMock },
        { provide: NotificationStore, useValue: notificationStoreMock },
      ],
    });

    service = TestBed.inject(AuthStore);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created with initial state', () => {
    expect(service).toBeTruthy();
    expect(service.user()).toBeNull();
    expect(service.loading()).toBe(false);
    expect(service.error()).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
  });

  describe('login', () => {
    it('should update user state on successful login', async () => {
      authServiceMock.login.mockReturnValue(of(mockLoginResponse));

      service.login(mockLoginCredentials);
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(service.user()).toEqual(mockLoginResponse.user);
      expect(service.loading()).toBe(false);
      expect(service.isAuthenticated()).toBe(true);
      expect(notificationServiceMock.success).toHaveBeenCalledWith('Login successful');
    });

    it('should connect notification store on successful login', async () => {
      authServiceMock.login.mockReturnValue(of(mockLoginResponse));
      service.login(mockLoginCredentials);
      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(notificationStoreMock.connect).toHaveBeenCalled();
    });

    it('should redirect to pending invite when token in localStorage', async () => {
      localStorage.setItem('pending_invite_token', 'abc-invite');
      authServiceMock.login.mockReturnValue(of(mockLoginResponse));
      service.login(mockLoginCredentials);
      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(routerMock.navigate).toHaveBeenCalledWith(['/accept-invite'], {
        queryParams: { token: 'abc-invite' },
      });
      expect(localStorage.getItem('pending_invite_token')).toBeNull();
    });

    it('should navigate to home when no pending invite', async () => {
      authServiceMock.login.mockReturnValue(of(mockLoginResponse));
      service.login(mockLoginCredentials);
      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(routerMock.navigate).toHaveBeenCalledWith(['/']);
    });

    it('should handle login error', async () => {
      const error = new Error('Invalid credentials');
      authServiceMock.login.mockReturnValue(throwError(() => error));
      service.login(mockLoginCredentials);
      await new Promise((resolve) => setTimeout(resolve, 200));
      expect(service.error()).toBe('Invalid credentials');
      expect(service.loading()).toBe(false);
      expect(service.isAuthenticated()).toBe(false);
      expect(notificationServiceMock.error).toHaveBeenCalledWith('Login failed. Please try again.');
    });
  });

  describe('register', () => {
    it('should update user state on successful registration', async () => {
      authServiceMock.register.mockReturnValue(of(mockRegisterResponse));
      service.register(mockRegisterData);
      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(service.user()).toEqual(mockRegisterResponse.user);
      expect(service.loading()).toBe(false);
      expect(notificationServiceMock.success).toHaveBeenCalledWith('Registration successful');
    });

    it('should connect notification store on successful registration', async () => {
      authServiceMock.register.mockReturnValue(of(mockRegisterResponse));
      service.register(mockRegisterData);
      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(notificationStoreMock.connect).toHaveBeenCalled();
    });

    it('should redirect to pending invite after registration', async () => {
      localStorage.setItem('pending_invite_token', 'reg-invite');
      authServiceMock.register.mockReturnValue(of(mockRegisterResponse));
      service.register(mockRegisterData);
      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(routerMock.navigate).toHaveBeenCalledWith(['/accept-invite'], {
        queryParams: { token: 'reg-invite' },
      });
      expect(localStorage.getItem('pending_invite_token')).toBeNull();
    });

    it('should handle registration error', async () => {
      const error = new Error('Email already exists');
      authServiceMock.register.mockReturnValue(throwError(() => error));
      service.register(mockRegisterData);
      await new Promise((resolve) => setTimeout(resolve, 200));
      expect(service.error()).toBe('Email already exists');
      expect(notificationServiceMock.error).toHaveBeenCalledWith(
        'Registration failed. Please try again.'
      );
    });
  });

  describe('logout', () => {
    it('should reset state on logout', async () => {
      authServiceMock.logout.mockReturnValue(of(void 0));
      service.logout();
      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(service.user()).toBeNull();
      expect(notificationServiceMock.info).toHaveBeenCalledWith('Logged out successfully');
    });

    it('should disconnect notification store on logout', async () => {
      authServiceMock.logout.mockReturnValue(of(void 0));
      service.logout();
      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(notificationStoreMock.disconnect).toHaveBeenCalled();
    });
  });

  describe('initialize', () => {
    it('should load user and connect notifications when cookie session is active', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
      };
      authServiceMock.getCurrentUser.mockReturnValue(of(mockUser));

      service.initialize();
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(service.user()).toEqual(mockUser);
      expect(service.loading()).toBe(false);
      expect(notificationStoreMock.connect).toHaveBeenCalled();
    });

    it('should reset state when no active session', async () => {
      authServiceMock.getCurrentUser.mockReturnValue(throwError(() => ({ status: 401 })));
      service.initialize();
      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(service.user()).toBeNull();
      expect(service.isAuthenticated()).toBe(false);
    });
  });
});

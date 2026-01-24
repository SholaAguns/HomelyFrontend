import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthStore } from './auth.store';
import { AuthService } from '../../services/auth-service/auth.service';
import { NotificationService } from '../../services/notification-service/notification.service';
import { of, throwError } from 'rxjs';
import { mockLoginCredentials, mockLoginResponse, mockRegisterData, mockRegisterResponse } from '../../../shared/mocks/models/auth-models.mock';

describe('AuthStore', () => {
  let service: InstanceType<typeof AuthStore>;
  let authServiceMock: {
    login: ReturnType<typeof vi.fn>;
    register: ReturnType<typeof vi.fn>;
    logout: ReturnType<typeof vi.fn>;
    getAccessToken: ReturnType<typeof vi.fn>;
    getRefreshToken: ReturnType<typeof vi.fn>;
    removeToken: ReturnType<typeof vi.fn>;
  };
  let notificationServiceMock: {
    success: ReturnType<typeof vi.fn>;
    error: ReturnType<typeof vi.fn>;
    info: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    authServiceMock = {
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      getAccessToken: vi.fn(),
      getRefreshToken: vi.fn(),
      removeToken: vi.fn()
    };

    notificationServiceMock = {
      success: vi.fn(),
      error: vi.fn(),
      info: vi.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        AuthStore,
        { provide: AuthService, useValue: authServiceMock },
        { provide: NotificationService, useValue: notificationServiceMock }
      ]
    });

    service = TestBed.inject(AuthStore);
  });

  it('should be created with initial state', () => {
    expect(service).toBeTruthy();
    expect(service.user()).toBeNull();
    expect(service.accessToken()).toBeNull();
    expect(service.refreshToken()).toBeNull();
    expect(service.loading()).toBe(false);
    expect(service.error()).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
  });

  describe('login', () => {
    it('should update state on successful login', async () => {
      authServiceMock.login.mockReturnValue(of(mockLoginResponse));

      service.login(mockLoginCredentials);

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(service.user()).toEqual(mockLoginResponse.user);
      expect(service.accessToken()).toBe(mockLoginResponse.access);
      expect(service.refreshToken()).toBe(mockLoginResponse.refresh);
      expect(service.loading()).toBe(false);
      expect(service.isAuthenticated()).toBe(true);
      expect(notificationServiceMock.success).toHaveBeenCalledWith('Login successful');
    });

    it('should handle login error', async () => {
      const error = new Error('Invalid credentials');
      authServiceMock.login.mockReturnValue(throwError(() => error));

      service.login(mockLoginCredentials);

      await new Promise(resolve => setTimeout(resolve, 200));

      expect(service.error()).toBe('Invalid credentials');
      expect(service.loading()).toBe(false);
      expect(service.isAuthenticated()).toBe(false);
      expect(notificationServiceMock.error).toHaveBeenCalledWith('Login failed: Invalid credentials');
    });
  });

  describe('register', () => {
    it('should update state on successful registration', async () => {
      authServiceMock.register.mockReturnValue(of(mockRegisterResponse));

      service.register(mockRegisterData);

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(service.user()).toBeNull();
      expect(service.accessToken()).toBe(mockRegisterResponse.access);
      expect(service.refreshToken()).toBe(mockRegisterResponse.refresh);
      expect(service.loading()).toBe(false);
      expect(notificationServiceMock.success).toHaveBeenCalledWith('Registration successful');
    });

    it('should handle registration error', async () => {
      const error = new Error('Email already exists');
      authServiceMock.register.mockReturnValue(throwError(() => error));

      service.register(mockRegisterData);

      await new Promise(resolve => setTimeout(resolve, 200));

      expect(service.error()).toBe('Email already exists');
      expect(service.loading()).toBe(false);
      expect(notificationServiceMock.error).toHaveBeenCalledWith('Registration failed: Email already exists');
    });
  });

  describe('logout', () => {
    it('should reset state on logout', async () => {
      authServiceMock.logout.mockReturnValue(of(void 0));

      service.logout();

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(service.user()).toBeNull();
      expect(service.accessToken()).toBeNull();
      expect(service.refreshToken()).toBeNull();
      expect(authServiceMock.removeToken).toHaveBeenCalledWith('access_token');
      expect(authServiceMock.removeToken).toHaveBeenCalledWith('refresh_token');
      expect(notificationServiceMock.info).toHaveBeenCalledWith('Logged out successfully');
    });
  });

  describe('initializeFromStorage', () => {
    it('should load tokens from storage', () => {
      authServiceMock.getAccessToken.mockReturnValue('serviced-access-token');
      authServiceMock.getRefreshToken.mockReturnValue('serviced-refresh-token');

      service.initializeFromStorage();

      expect(service.accessToken()).toBe('serviced-access-token');
      expect(service.refreshToken()).toBe('serviced-refresh-token');
    });

    it('should not update state when no tokens in storage', () => {
      authServiceMock.getAccessToken.mockReturnValue(null);
      authServiceMock.getRefreshToken.mockReturnValue(null);

      service.initializeFromStorage();

      expect(service.accessToken()).toBeNull();
      expect(service.refreshToken()).toBeNull();
    });
  });
});

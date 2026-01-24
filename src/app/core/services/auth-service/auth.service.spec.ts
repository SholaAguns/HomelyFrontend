import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AuthService } from './auth.service';
import { ApiService } from '../api-service/api.service';
import { of } from 'rxjs';
import { firstValueFrom } from 'rxjs';
import { mockLoginCredentials, mockLoginResponse, mockRegisterData, mockRegisterResponse } from '../../../shared/mocks/models/auth-models.mock';

describe('AuthService', () => {
  let service: AuthService;
  let apiServiceMock: {
    get: ReturnType<typeof vi.fn>;
    post: ReturnType<typeof vi.fn>;
    put: ReturnType<typeof vi.fn>;
    patch: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    apiServiceMock = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: ApiService, useValue: apiServiceMock }
      ]
    });

    service = TestBed.inject(AuthService);
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('login', () => {
    it('should call API and store tokens on login', async () => {
      apiServiceMock.post.mockReturnValue(of(mockLoginResponse));

      const response = await firstValueFrom(service.login(mockLoginCredentials));

      expect(response).toEqual(mockLoginResponse);
      expect(apiServiceMock.post).toHaveBeenCalledWith('accounts/login/', mockLoginCredentials);
      expect(localStorage.getItem('access_token')).toBe(mockLoginResponse.access);
      expect(localStorage.getItem('refresh_token')).toBe(mockLoginResponse.refresh);
    });
  });

  describe('register', () => {
    it('should call API and store tokens on register', async () => {
      apiServiceMock.post.mockReturnValue(of(mockRegisterResponse));

      const response = await firstValueFrom(service.register(mockRegisterData));

      expect(response).toEqual(mockRegisterResponse);
      expect(apiServiceMock.post).toHaveBeenCalledWith('accounts/register/', mockRegisterData);
      expect(localStorage.getItem('access_token')).toBe(mockRegisterResponse.access);
      expect(localStorage.getItem('refresh_token')).toBe(mockRegisterResponse.refresh);
    });
  });

  describe('logout', () => {
    it('should call API with refresh token on logout when authenticated', async () => {
      localStorage.setItem('access_token', 'test-token');
      localStorage.setItem('refresh_token', 'test-refresh');
      apiServiceMock.post.mockReturnValue(of(void 0));

      await firstValueFrom(service.logout());

      expect(apiServiceMock.post).toHaveBeenCalledWith('accounts/logout/', { refresh: 'test-refresh' });
    });

    it('should return empty observable when not authenticated', async () => {
      await firstValueFrom(service.logout());

      expect(apiServiceMock.post).not.toHaveBeenCalled();
    });
  });

  describe('refreshToken', () => {
    it('should call API and update tokens on refreshToken', async () => {
      localStorage.setItem('refresh_token', 'old-refresh');
      apiServiceMock.post.mockReturnValue(of(mockRegisterResponse));

      const response = await firstValueFrom(service.refreshToken());

      expect(response).toEqual(mockRegisterResponse);
      expect(apiServiceMock.post).toHaveBeenCalledWith('accounts/token/refresh/', { refresh: 'old-refresh' });
      expect(localStorage.getItem('access_token')).toBe(mockRegisterResponse.access);
      expect(localStorage.getItem('refresh_token')).toBe(mockRegisterResponse.refresh);
    });
  });

  describe('token management', () => {
    it('should get access token from localStorage', () => {
      localStorage.setItem('access_token', 'test-token');
      expect(service.getAccessToken()).toBe('test-token');
    });

    it('should get refresh token from localStorage', () => {
      localStorage.setItem('refresh_token', 'test-refresh');
      expect(service.getRefreshToken()).toBe('test-refresh');
    });

    it('should remove token from localStorage', () => {
      localStorage.setItem('access_token', 'test-token');
      service.removeToken('access_token');
      expect(localStorage.getItem('access_token')).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when access token exists', () => {
      localStorage.setItem('access_token', 'test-token');
      expect(service.isAuthenticated()).toBe(true);
    });

    it('should return false when no access token', () => {
      expect(service.isAuthenticated()).toBe(false);
    });
  });
});

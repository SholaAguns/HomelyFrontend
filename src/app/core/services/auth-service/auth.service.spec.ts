import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthService } from './auth.service';
import { ApiService } from '../api-service/api.service';
import { of } from 'rxjs';
import { firstValueFrom } from 'rxjs';
import {
  mockLoginCredentials,
  mockLoginResponse,
  mockRegisterData,
  mockRegisterResponse,
} from '../../../shared/mocks/models/auth-models.mock';
import { createApiServiceMock } from '../../../shared/mocks/api-service.mock';

describe('AuthService', () => {
  let service: AuthService;
  let apiServiceMock: ReturnType<typeof createApiServiceMock>;

  beforeEach(() => {
    apiServiceMock = createApiServiceMock();

    TestBed.configureTestingModule({
      providers: [AuthService, { provide: ApiService, useValue: apiServiceMock }],
    });

    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('login', () => {
    it('should call login request with credentials on login', async () => {
      apiServiceMock.post.mockReturnValue(of(mockLoginResponse));

      const response = await firstValueFrom(service.login(mockLoginCredentials));

      expect(response).toEqual(mockLoginResponse);
      expect(apiServiceMock.post).toHaveBeenCalledWith('accounts/login/', mockLoginCredentials);
    });
  });

  describe('register', () => {
    it('should call register request with user data on register', async () => {
      apiServiceMock.post.mockReturnValue(of(mockRegisterResponse));

      const response = await firstValueFrom(service.register(mockRegisterData));

      expect(response).toEqual(mockRegisterResponse);
      expect(apiServiceMock.post).toHaveBeenCalledWith('accounts/register/', mockRegisterData);
    });
  });

  describe('logout', () => {
    it('should call logout endpoint on logout', async () => {
      apiServiceMock.post.mockReturnValue(of(void 0));

      await firstValueFrom(service.logout());

      expect(apiServiceMock.post).toHaveBeenCalledWith('accounts/logout/', {});
    });
  });

  describe('refreshToken', () => {
    it('should call token refresh endpoint with no body on refreshToken', async () => {
      apiServiceMock.post.mockReturnValue(of(void 0));

      await firstValueFrom(service.refreshToken());

      expect(apiServiceMock.post).toHaveBeenCalledWith('accounts/token/refresh/', {});
    });
  });
});

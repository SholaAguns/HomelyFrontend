import { TestBed } from '@angular/core/testing';
import { AuthStore } from './auth.store';
import { AuthService } from '../../services/auth-service/auth.service';
import { NotificationService } from '../../services/notification.service';
import { of, throwError } from 'rxjs';
import { mockLoginCredentials, mockLoginResponse, mockRegisterData, mockRegisterResponse } from '../../../shared/mocks/models/auth-models.mock';

describe('AuthStore', () => {
  let service: InstanceType<typeof AuthStore>;
  let authServiceMock: jasmine.SpyObj<AuthService>;
  let notificationServiceMock: jasmine.SpyObj<NotificationService>;

  beforeEach(() => {
    authServiceMock = jasmine.createSpyObj('AuthService', [
      'login',
      'register',
      'logout',
      'getAccessToken',
      'getRefreshToken',
      'removeToken'
    ]);
    
    notificationServiceMock = jasmine.createSpyObj('NotificationService', [
      'success',
      'error',
      'info'
    ]);

    TestBed.configureTestingModule({
      providers: [
        AuthStore,
        { provide: AuthService, useValue: authServiceMock },
        { provide: NotificationService, useValue: notificationServiceMock }
      ]
    });

    service = TestBed.inject(AuthStore);
    authServiceMock = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    notificationServiceMock = TestBed.inject(NotificationService) as jasmine.SpyObj<NotificationService>;
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
    it('should update state on successful login', (done) => {
      authServiceMock.login.and.returnValue(of(mockLoginResponse));

      service.login(mockLoginCredentials);

      setTimeout(() => {
        expect(service.user()).toEqual(mockLoginResponse.user);
        expect(service.accessToken()).toBe(mockLoginResponse.access);
        expect(service.refreshToken()).toBe(mockLoginResponse.refresh);
        expect(service.loading()).toBe(false);
        expect(service.isAuthenticated()).toBe(true);
        expect(notificationServiceMock.success).toHaveBeenCalledWith('Login successful');
        done();
      }, 100);
    });

    it('should handle login error', (done) => {
      const error = new Error('Invalid credentials');
      authServiceMock.login.and.returnValue(throwError(() => error));

      service.login(mockLoginCredentials);

      setTimeout(() => {
        expect(service.error()).toBe('Invalid credentials');
        expect(service.loading()).toBe(false);
        expect(service.isAuthenticated()).toBe(false);
        expect(notificationServiceMock.error).toHaveBeenCalledWith('Login failed: Invalid credentials');
        done();
      }, 100);
    });
  });

  describe('register', () => {
    it('should update state on successful registration', (done) => {
      authServiceMock.register.and.returnValue(of(mockRegisterResponse));

      service.register(mockRegisterData);

      setTimeout(() => {
        expect(service.user()).toBeNull();
        expect(service.accessToken()).toBe(mockRegisterResponse.access);
        expect(service.refreshToken()).toBe(mockRegisterResponse.refresh);
        expect(service.loading()).toBe(false);
        expect(notificationServiceMock.success).toHaveBeenCalledWith('Registration successful');
        done();
      }, 100);
    });

    it('should handle registration error', (done) => {
      const error = new Error('Email already exists');
      authServiceMock.register.and.returnValue(throwError(() => error));

      service.register(mockRegisterData);

      setTimeout(() => {
        expect(service.error()).toBe('Email already exists');
        expect(service.loading()).toBe(false);
        expect(notificationServiceMock.error).toHaveBeenCalledWith('Registration failed: Email already exists');
        done();
      }, 100);
    });
  });

  describe('logout', () => {
    it('should reset state on logout', (done) => {
      authServiceMock.logout.and.returnValue(of(void 0));

      service.logout();

      setTimeout(() => {
        expect(service.user()).toBeNull();
        expect(service.accessToken()).toBeNull();
        expect(service.refreshToken()).toBeNull();
        expect(authServiceMock.removeToken).toHaveBeenCalledWith('access_token');
        expect(authServiceMock.removeToken).toHaveBeenCalledWith('refresh_token');
        expect(notificationServiceMock.info).toHaveBeenCalledWith('Logged out successfully');
        done();
      }, 100);
    });
  });

  describe('initializeFromStorage', () => {
    it('should load tokens from storage', () => {
      authServiceMock.getAccessToken.and.returnValue('serviced-access-token');
      authServiceMock.getRefreshToken.and.returnValue('serviced-refresh-token');

      service.initializeFromStorage();

      expect(service.accessToken()).toBe('serviced-access-token');
      expect(service.refreshToken()).toBe('serviced-refresh-token');
    });

    it('should not update state when no tokens in storage', () => {
      authServiceMock.getAccessToken.and.returnValue(null);
      authServiceMock.getRefreshToken.and.returnValue(null);

      service.initializeFromStorage();

      expect(service.accessToken()).toBeNull();
      expect(service.refreshToken()).toBeNull();
    });
  });
});

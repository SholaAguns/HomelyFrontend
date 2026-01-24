import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginComponent } from './login.component';
import { AuthStore } from '../../../core/stores/auth-store/auth.store';
import { signal } from '@angular/core';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let routerSpy: jasmine.SpyObj<Router>;
  let mockAuthStore: any;

  beforeEach(async () => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    mockAuthStore = {
      login: jasmine.createSpy('login'),
      isAuthenticated: signal(false),
      user: signal(null),
      loading: signal(false),
      error: signal(null),
      accessToken: signal(null),
      refreshToken: signal(null)
    };

    await TestBed.configureTestingModule({
      imports: [LoginComponent, ReactiveFormsModule],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: AuthStore, useValue: mockAuthStore }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty form', () => {
    expect(component.loginForm.get('email')?.value).toBe('');
    expect(component.loginForm.get('password')?.value).toBe('');
  });

  describe('form validation', () => {
    it('should require email', () => {
      const emailControl = component.loginForm.get('email');
      emailControl?.setValue('');
      expect(emailControl?.hasError('required')).toBe(true);
    });

    it('should validate email format', () => {
      const emailControl = component.loginForm.get('email');
      emailControl?.setValue('invalid-email');
      expect(emailControl?.hasError('email')).toBe(true);

      emailControl?.setValue('valid@email.com');
      expect(emailControl?.hasError('email')).toBe(false);
    });

    it('should require password', () => {
      const passwordControl = component.loginForm.get('password');
      passwordControl?.setValue('');
      expect(passwordControl?.hasError('required')).toBe(true);
    });

    it('should validate password minimum length', () => {
      const passwordControl = component.loginForm.get('password');
      passwordControl?.setValue('12345');
      expect(passwordControl?.hasError('minlength')).toBe(true);

      passwordControl?.setValue('123456');
      expect(passwordControl?.hasError('minlength')).toBe(false);
    });

    it('should invalidate form when fields are empty', () => {
      expect(component.loginForm.valid).toBe(false);
    });

    it('should validate form when all fields are valid', () => {
      component.loginForm.setValue({
        email: 'test@example.com',
        password: 'password123'
      });
      expect(component.loginForm.valid).toBe(true);
    });
  });

  describe('onSubmit', () => {
    it('should not call login when form is invalid', () => {
      component.loginForm.setValue({
        email: 'invalid-email',
        password: '123'
      });

      component.onSubmit();

      expect(mockAuthStore.login).not.toHaveBeenCalled();
    });

    it('should call login with credentials when form is valid', () => {
      const credentials = {
        email: 'test@example.com',
        password: 'password123'
      };
      component.loginForm.setValue(credentials);

      component.onSubmit();

      expect(mockAuthStore.login).toHaveBeenCalledWith(credentials);
    });

    it('should navigate to home on successful authentication', fakeAsync(() => {
      component.loginForm.setValue({
        email: 'test@example.com',
        password: 'password123'
      });

      component.onSubmit();

      // Simulate authentication success
      mockAuthStore.isAuthenticated.set(true);
      tick(250);

      expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
    }));

    it('should retry polling if not authenticated immediately', fakeAsync(() => {
      component.loginForm.setValue({
        email: 'test@example.com',
        password: 'password123'
      });

      component.onSubmit();

      // Not authenticated after first poll
      tick(250);
      expect(routerSpy.navigate).not.toHaveBeenCalled();

      // Authenticated on second poll
      mockAuthStore.isAuthenticated.set(true);
      tick(250);

      expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
    }));

    it('should stop polling after max attempts', fakeAsync(() => {
      component.loginForm.setValue({
        email: 'test@example.com',
        password: 'password123'
      });

      component.onSubmit();

      // Wait for all 5 attempts (5 * 250ms = 1250ms)
      tick(1500);

      expect(routerSpy.navigate).not.toHaveBeenCalled();
    }));
  });

  describe('form getters', () => {
    it('should return email control', () => {
      expect(component.email).toBe(component.loginForm.get('email'));
    });

    it('should return password control', () => {
      expect(component.password).toBe(component.loginForm.get('password'));
    });
  });
});

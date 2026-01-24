import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RegisterComponent } from './register.component';
import { AuthStore } from '../../../core/stores/auth-store/auth.store';
import { signal } from '@angular/core';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let routerSpy: jasmine.SpyObj<Router>;
  let mockAuthStore: any;

  beforeEach(async () => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    mockAuthStore = {
      register: jasmine.createSpy('register'),
      isAuthenticated: signal(false),
      user: signal(null),
      loading: signal(false),
      error: signal(null),
      accessToken: signal(null),
      refreshToken: signal(null)
    };

    await TestBed.configureTestingModule({
      imports: [RegisterComponent, ReactiveFormsModule],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: AuthStore, useValue: mockAuthStore }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty form', () => {
    expect(component.registerForm.get('firstName')?.value).toBe('');
    expect(component.registerForm.get('lastName')?.value).toBe('');
    expect(component.registerForm.get('email')?.value).toBe('');
    expect(component.registerForm.get('password')?.value).toBe('');
    expect(component.registerForm.get('confirmPassword')?.value).toBe('');
  });

  describe('form validation', () => {
    it('should require firstName', () => {
      const firstNameControl = component.registerForm.get('firstName');
      firstNameControl?.setValue('');
      expect(firstNameControl?.hasError('required')).toBe(true);
    });

    it('should validate firstName minimum length', () => {
      const firstNameControl = component.registerForm.get('firstName');
      firstNameControl?.setValue('J');
      expect(firstNameControl?.hasError('minlength')).toBe(true);

      firstNameControl?.setValue('John');
      expect(firstNameControl?.hasError('minlength')).toBe(false);
    });

    it('should require lastName', () => {
      const lastNameControl = component.registerForm.get('lastName');
      lastNameControl?.setValue('');
      expect(lastNameControl?.hasError('required')).toBe(true);
    });

    it('should validate lastName minimum length', () => {
      const lastNameControl = component.registerForm.get('lastName');
      lastNameControl?.setValue('D');
      expect(lastNameControl?.hasError('minlength')).toBe(true);

      lastNameControl?.setValue('Doe');
      expect(lastNameControl?.hasError('minlength')).toBe(false);
    });

    it('should require email', () => {
      const emailControl = component.registerForm.get('email');
      emailControl?.setValue('');
      expect(emailControl?.hasError('required')).toBe(true);
    });

    it('should validate email format', () => {
      const emailControl = component.registerForm.get('email');
      emailControl?.setValue('invalid-email');
      expect(emailControl?.hasError('email')).toBe(true);

      emailControl?.setValue('valid@email.com');
      expect(emailControl?.hasError('email')).toBe(false);
    });

    it('should require password', () => {
      const passwordControl = component.registerForm.get('password');
      passwordControl?.setValue('');
      expect(passwordControl?.hasError('required')).toBe(true);
    });

    it('should validate password minimum length', () => {
      const passwordControl = component.registerForm.get('password');
      passwordControl?.setValue('12345');
      expect(passwordControl?.hasError('minlength')).toBe(true);

      passwordControl?.setValue('123456');
      expect(passwordControl?.hasError('minlength')).toBe(false);
    });

    it('should require confirmPassword', () => {
      const confirmPasswordControl = component.registerForm.get('confirmPassword');
      confirmPasswordControl?.setValue('');
      expect(confirmPasswordControl?.hasError('required')).toBe(true);
    });

    it('should validate password match', () => {
      component.registerForm.patchValue({
        password: 'password123',
        confirmPassword: 'different123'
      });
      expect(component.registerForm.hasError('passwordMismatch')).toBe(true);

      component.registerForm.patchValue({
        password: 'password123',
        confirmPassword: 'password123'
      });
      expect(component.registerForm.hasError('passwordMismatch')).toBe(false);
    });

    it('should validate complete valid form', () => {
      component.registerForm.setValue({
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123'
      });
      expect(component.registerForm.valid).toBe(true);
    });
  });

  describe('passwordMatchValidator', () => {
    it('should return null when passwords match', () => {
      component.registerForm.patchValue({
        password: 'password123',
        confirmPassword: 'password123'
      });
      const result = component.passwordMatchValidator(component.registerForm);
      expect(result).toBeNull();
    });

    it('should return error when passwords do not match', () => {
      component.registerForm.patchValue({
        password: 'password123',
        confirmPassword: 'different'
      });
      const result = component.passwordMatchValidator(component.registerForm);
      expect(result).toEqual({ passwordMismatch: true });
    });
  });

  describe('onSubmit', () => {
    it('should not call register when form is invalid', () => {
      component.registerForm.setValue({
        firstName: 'J',
        lastName: 'D',
        email: 'invalid-email',
        password: '123',
        confirmPassword: '456'
      });

      component.onSubmit();

      expect(mockAuthStore.register).not.toHaveBeenCalled();
    });

    it('should call register without confirmPassword when form is valid', () => {
      component.registerForm.setValue({
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123'
      });

      component.onSubmit();

      expect(mockAuthStore.register).toHaveBeenCalledWith({
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@example.com',
        password: 'password123'
      });
    });

    it('should navigate to home on successful authentication', fakeAsync(() => {
      component.registerForm.setValue({
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123'
      });

      component.onSubmit();

      // Simulate authentication success
      mockAuthStore.isAuthenticated.set(true);
      tick(250);

      expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
    }));

    it('should retry polling if not authenticated immediately', fakeAsync(() => {
      component.registerForm.setValue({
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123'
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
      component.registerForm.setValue({
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123'
      });

      component.onSubmit();

      // Wait for all 5 attempts (5 * 250ms = 1250ms)
      tick(1500);

      expect(routerSpy.navigate).not.toHaveBeenCalled();
    }));
  });

  describe('form getters', () => {
    it('should return firstName control', () => {
      expect(component.firstName).toBe(component.registerForm.get('firstName'));
    });

    it('should return lastName control', () => {
      expect(component.lastName).toBe(component.registerForm.get('lastName'));
    });

    it('should return email control', () => {
      expect(component.email).toBe(component.registerForm.get('email'));
    });

    it('should return password control', () => {
      expect(component.password).toBe(component.registerForm.get('password'));
    });

    it('should return confirmPassword control', () => {
      expect(component.confirmPassword).toBe(component.registerForm.get('confirmPassword'));
    });
  });
});

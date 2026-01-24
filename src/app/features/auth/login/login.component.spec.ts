import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { LoginComponent } from './login.component';
import { AuthStore } from '../../../core/stores/auth-store/auth.store';
import { Directive, HostListener, Input } from '@angular/core';
import { createRouterMock, createActivatedRouteMock } from '../../../shared/mocks/router.mock';
import { createAuthStoreMock } from '../../../shared/mocks/auth-store.mock';

@Directive({
  selector: '[routerLink]',
  standalone: true
})
class RouterLinkStubDirective {
  @Input() routerLink: any;
  navigatedTo: any = null;

  @HostListener('click')
  onClick() {
    this.navigatedTo = this.routerLink;
  }
}

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let routerMock: any;
  let mockAuthStore: any;

  beforeEach(async () => {
    routerMock = createRouterMock();
    mockAuthStore = createAuthStoreMock();

    await TestBed.configureTestingModule({
      imports: [LoginComponent, ReactiveFormsModule, RouterLinkStubDirective],
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: createActivatedRouteMock() },
        { provide: AuthStore, useValue: mockAuthStore }
      ]
    })
    .overrideComponent(LoginComponent, {
      remove: { imports: [] },
      add: { imports: [ReactiveFormsModule, RouterLinkStubDirective] }
    })
    .compileComponents();

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

    it('should navigate to home on successful authentication', async () => {
      component.loginForm.setValue({
        email: 'test@example.com',
        password: 'password123'
      });

      component.onSubmit();

      // Simulate authentication success
      mockAuthStore.isAuthenticated.set(true);
      await new Promise(resolve => setTimeout(resolve, 300));

      expect(routerMock.navigate).toHaveBeenCalledWith(['/']);
    });

    it('should retry polling if not authenticated immediately', async () => {
      component.loginForm.setValue({
        email: 'test@example.com',
        password: 'password123'
      });

      component.onSubmit();

      // Not authenticated after first poll
      await new Promise(resolve => setTimeout(resolve, 300));
      expect(routerMock.navigate).not.toHaveBeenCalled();

      // Authenticated on second poll
      mockAuthStore.isAuthenticated.set(true);
      await new Promise(resolve => setTimeout(resolve, 300));

      expect(routerMock.navigate).toHaveBeenCalledWith(['/']);
    });

    it('should stop polling after max attempts', async () => {
      component.loginForm.setValue({
        email: 'test@example.com',
        password: 'password123'
      });

      component.onSubmit();

      // Wait for all 5 attempts (5 * 250ms = 1250ms)
      await new Promise(resolve => setTimeout(resolve, 1500));

      expect(routerMock.navigate).not.toHaveBeenCalled();
    });
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

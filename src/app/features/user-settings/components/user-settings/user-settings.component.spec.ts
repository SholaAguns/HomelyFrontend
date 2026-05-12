import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { UserSettingsComponent } from './user-settings.component';
import { AuthService } from '../../../../core/services/auth-service/auth.service';
import { NotificationService } from '../../../../core/services/notification-service/notification.service';
import { createRouterMock } from '../../../../shared/mocks/router.mock';
import { createNotificationServiceMock } from '../../../../shared/mocks/notification-service.mock';
import { mockUser } from '../../../../shared/mocks/models/user-models.mock';

function createAuthServiceMock() {
  return {
    getCurrentUser: vi.fn().mockReturnValue(of(mockUser)),
    updateAccountDetails: vi.fn().mockReturnValue(of({})),
    changePassword: vi.fn().mockReturnValue(of({ message: 'Password updated successfully' })),
    deleteAccount: vi.fn().mockReturnValue(of(undefined)),
  };
}

describe('UserSettingsComponent', () => {
  let component: UserSettingsComponent;
  let fixture: ComponentFixture<UserSettingsComponent>;
  let authServiceMock: ReturnType<typeof createAuthServiceMock>;
  let notificationServiceMock: ReturnType<typeof createNotificationServiceMock>;
  let routerMock: ReturnType<typeof createRouterMock>;

  beforeEach(async () => {
    authServiceMock = createAuthServiceMock();
    notificationServiceMock = createNotificationServiceMock();
    routerMock = createRouterMock();

    await TestBed.configureTestingModule({
      imports: [UserSettingsComponent, ReactiveFormsModule],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: NotificationService, useValue: notificationServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UserSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should call getCurrentUser and patch forms on load', () => {
      expect(authServiceMock.getCurrentUser).toHaveBeenCalled();
      expect(component.accountDetailsForm.get('first_name')?.value).toBe(mockUser.first_name);
      expect(component.accountDetailsForm.get('last_name')?.value).toBe(mockUser.last_name);
      expect(component.accountDetailsForm.get('email')?.value).toBe(mockUser.email);
      expect(component.profileForm.get('bio')?.value).toBe(mockUser.profile.bio);
      expect(component.profileForm.get('phone_number')?.value).toBe(mockUser.profile.phone_number);
    });

    it('should set loading to false after user loads', () => {
      expect(component.loading()).toBe(false);
    });

    it('should show error notification and set loading false when getCurrentUser fails', async () => {
      authServiceMock.getCurrentUser.mockReturnValue(throwError(() => new Error('Network error')));
      component.ngOnInit();
      expect(notificationServiceMock.error).toHaveBeenCalledWith('Failed to load user details');
      expect(component.loading()).toBe(false);
    });
  });

  describe('saveAccountDetails', () => {
    it('should call updateAccountDetails with form values on valid form', () => {
      component.accountDetailsForm.setValue({
        first_name: 'Jane',
        last_name: 'Smith',
        email: 'jane@example.com',
      });

      component.saveAccountDetails();

      expect(authServiceMock.updateAccountDetails).toHaveBeenCalledWith({
        first_name: 'Jane',
        last_name: 'Smith',
        email: 'jane@example.com',
      });
    });

    it('should show success notification after saving account details', () => {
      component.saveAccountDetails();
      expect(notificationServiceMock.success).toHaveBeenCalledWith('Account details updated');
    });

    it('should set savingDetails to false after successful save', () => {
      component.saveAccountDetails();
      expect(component.savingDetails()).toBe(false);
    });

    it('should not call updateAccountDetails when form is invalid', () => {
      component.accountDetailsForm.get('email')?.setValue('not-an-email');
      authServiceMock.updateAccountDetails.mockClear();

      component.saveAccountDetails();

      expect(authServiceMock.updateAccountDetails).not.toHaveBeenCalled();
    });

    it('should show email error message when email already exists', () => {
      authServiceMock.updateAccountDetails.mockReturnValue(
        throwError(() => ({ error: { email: ['A user with this email already exists.'] } }))
      );

      component.saveAccountDetails();

      expect(notificationServiceMock.error).toHaveBeenCalledWith(
        'A user with this email already exists.'
      );
    });

    it('should show generic error when updateAccountDetails fails', () => {
      authServiceMock.updateAccountDetails.mockReturnValue(
        throwError(() => ({ error: { detail: 'Server error' } }))
      );

      component.saveAccountDetails();

      expect(notificationServiceMock.error).toHaveBeenCalledWith('Server error');
    });
  });

  describe('saveProfile', () => {
    it('should call updateAccountDetails with profile form values', () => {
      component.profileForm.setValue({ bio: 'My bio', phone_number: '07700900000' });

      component.saveProfile();

      expect(authServiceMock.updateAccountDetails).toHaveBeenCalledWith({
        bio: 'My bio',
        phone_number: '07700900000',
      });
    });

    it('should show success notification after saving profile', () => {
      component.saveProfile();
      expect(notificationServiceMock.success).toHaveBeenCalledWith('Profile updated');
    });

    it('should show error notification when saveProfile fails', () => {
      authServiceMock.updateAccountDetails.mockReturnValue(throwError(() => new Error()));

      component.saveProfile();

      expect(notificationServiceMock.error).toHaveBeenCalledWith('Failed to update profile');
    });
  });

  describe('changePassword', () => {
    const validPasswordValues = {
      old_password: 'OldPass123',
      new_password: 'NewPass123',
      confirm_password: 'NewPass123',
    };

    it('should call changePassword with old and new password on valid form', () => {
      component.changePasswordForm.setValue(validPasswordValues);

      component.changePassword();

      expect(authServiceMock.changePassword).toHaveBeenCalledWith({
        old_password: 'OldPass123',
        new_password: 'NewPass123',
      });
    });

    it('should show success notification and reset form after password change', () => {
      component.changePasswordForm.setValue(validPasswordValues);

      component.changePassword();

      expect(notificationServiceMock.success).toHaveBeenCalledWith('Password changed successfully');
      expect(component.changePasswordForm.get('old_password')?.value).toBeNull();
    });

    it('should not call changePassword when form is invalid', () => {
      component.changePasswordForm.setValue({
        old_password: '',
        new_password: 'short',
        confirm_password: 'short',
      });

      component.changePassword();

      expect(authServiceMock.changePassword).not.toHaveBeenCalled();
    });

    it('should not call changePassword when passwords do not match', () => {
      component.changePasswordForm.setValue({
        old_password: 'OldPass123',
        new_password: 'NewPass123',
        confirm_password: 'DifferentPass123',
      });

      component.changePassword();

      expect(authServiceMock.changePassword).not.toHaveBeenCalled();
    });

    it('should show wrong password error when old password is incorrect', () => {
      component.changePasswordForm.setValue(validPasswordValues);
      authServiceMock.changePassword.mockReturnValue(
        throwError(() => ({ error: { old_password: 'Wrong password' } }))
      );

      component.changePassword();

      expect(notificationServiceMock.error).toHaveBeenCalledWith('Wrong password');
    });
  });

  describe('confirmDeleteAccount', () => {
    it('should call deleteAccount and navigate to login on success', () => {
      component.confirmDeleteAccount();

      expect(authServiceMock.deleteAccount).toHaveBeenCalled();
      expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('should show info notification after account is deleted', () => {
      component.confirmDeleteAccount();
      expect(notificationServiceMock.info).toHaveBeenCalledWith('Your account has been deleted');
    });

    it('should show error notification and close modal when deleteAccount fails', () => {
      authServiceMock.deleteAccount.mockReturnValue(throwError(() => new Error()));
      component.showDeleteModal.set(true);

      component.confirmDeleteAccount();

      expect(notificationServiceMock.error).toHaveBeenCalledWith('Failed to delete account');
      expect(component.deletingAccount()).toBe(false);
      expect(component.showDeleteModal()).toBe(false);
    });
  });

  describe('changePasswordForm validation', () => {
    it('should require new_password to be at least 8 characters', () => {
      component.changePasswordForm.get('new_password')?.setValue('short');
      expect(component.changePasswordForm.get('new_password')?.hasError('minlength')).toBe(true);
    });

    it('should flag passwordMismatch when new_password and confirm_password differ', () => {
      component.changePasswordForm.setValue({
        old_password: 'OldPass123',
        new_password: 'NewPass123',
        confirm_password: 'Different123',
      });
      expect(component.changePasswordForm.hasError('passwordMismatch')).toBe(true);
    });

    it('should be valid when all fields are correctly filled and passwords match', () => {
      component.changePasswordForm.setValue({
        old_password: 'OldPass123',
        new_password: 'NewPass123',
        confirm_password: 'NewPass123',
      });
      expect(component.changePasswordForm.valid).toBe(true);
    });
  });
});

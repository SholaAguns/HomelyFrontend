import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth-service/auth.service';
import { AuthStore } from '../../../../core/stores/auth-store/auth.store';
import { NotificationService } from '../../../../core/services/notification-service/notification.service';
import { User } from '../../../../shared/models/user-models';

@Component({
  selector: 'app-user-settings',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-settings.component.html',
})
export class UserSettingsComponent implements OnInit {
  private authService = inject(AuthService);
  private authStore = inject(AuthStore);
  private notificationService = inject(NotificationService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  currentUser = signal<User | null>(null);
  loading = signal(true);
  savingDetails = signal(false);
  savingPassword = signal(false);
  showDeleteModal = signal(false);
  deletingAccount = signal(false);

  accountDetailsForm: FormGroup = this.fb.group({
    first_name: ['', Validators.required],
    last_name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
  });

  profileForm: FormGroup = this.fb.group({
    bio: [''],
    phone_number: [''],
  });

  changePasswordForm: FormGroup = this.fb.group(
    {
      old_password: ['', Validators.required],
      new_password: ['', [Validators.required, Validators.minLength(8)]],
      confirm_password: ['', Validators.required],
    },
    { validators: this.passwordMatchValidator }
  );

  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        this.currentUser.set(user);
        this.accountDetailsForm.patchValue({
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
        });
        this.profileForm.patchValue({
          bio: user.profile?.bio ?? '',
          phone_number: user.profile?.phone_number ?? '',
        });
        this.loading.set(false);
      },
      error: () => {
        this.notificationService.error('Failed to load user details');
        this.loading.set(false);
      },
    });
  }

  saveAccountDetails(): void {
    if (this.accountDetailsForm.invalid) return;
    this.savingDetails.set(true);

    this.authService.updateAccountDetails(this.accountDetailsForm.value).subscribe({
      next: () => {
        this.notificationService.success('Account details updated');
        this.savingDetails.set(false);
      },
      error: (err) => {
        const message =
          err?.error?.email?.[0] ?? err?.error?.detail ?? 'Failed to update account details';
        this.notificationService.error(message);
        this.savingDetails.set(false);
      },
    });
  }

  saveProfile(): void {
    if (this.profileForm.invalid) return;
    this.savingDetails.set(true);

    this.authService.updateAccountDetails(this.profileForm.value).subscribe({
      next: () => {
        this.notificationService.success('Profile updated');
        this.savingDetails.set(false);
      },
      error: () => {
        this.notificationService.error('Failed to update profile');
        this.savingDetails.set(false);
      },
    });
  }

  changePassword(): void {
    if (this.changePasswordForm.invalid) return;
    this.savingPassword.set(true);

    const { old_password, new_password } = this.changePasswordForm.value;

    this.authService.changePassword({ old_password, new_password }).subscribe({
      next: () => {
        this.notificationService.success('Password changed successfully');
        this.changePasswordForm.reset();
        this.savingPassword.set(false);
      },
      error: (err) => {
        const message =
          err?.error?.old_password ?? err?.error?.detail ?? 'Failed to change password';
        this.notificationService.error(message);
        this.savingPassword.set(false);
      },
    });
  }

  confirmDeleteAccount(): void {
    this.deletingAccount.set(true);

    this.authService.deleteAccount().subscribe({
      next: () => {
        this.notificationService.info('Your account has been deleted');
        this.router.navigate(['/login']);
      },
      error: () => {
        this.notificationService.error('Failed to delete account');
        this.deletingAccount.set(false);
        this.showDeleteModal.set(false);
      },
    });
  }

  private passwordMatchValidator(group: FormGroup): { [key: string]: boolean } | null {
    const newPassword = group.get('new_password')?.value;
    const confirmPassword = group.get('confirm_password')?.value;
    return newPassword === confirmPassword ? null : { passwordMismatch: true };
  }
}

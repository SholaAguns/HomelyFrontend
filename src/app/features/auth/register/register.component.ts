import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthStore } from '../../../core/stores/auth-store/auth.store';
import { RegisterData } from '../../../shared/models/auth-models';
import { interval, take, takeWhile } from 'rxjs';

@Component({
  selector: 'app-register',
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  private formBuilder = inject(FormBuilder);
  private router = inject(Router);
  protected readonly authStore = inject(AuthStore);

  registerForm: FormGroup = this.formBuilder.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]]
  }, { validators: this.passwordMatchValidator });

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    return password && confirmPassword && password.value === confirmPassword.value
      ? null
      : { passwordMismatch: true };
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      const { confirmPassword, ...registerData } = this.registerForm.value;
      this.authStore.register(registerData as RegisterData);

      // Poll authentication status with retry
      let attempts = 0;
      const maxAttempts = 5;
      interval(250)
        .pipe(
          take(maxAttempts),
          takeWhile(() => !this.authStore.isAuthenticated() && attempts++ < maxAttempts)
        )
        .subscribe({
          next: () => {
            if (this.authStore.isAuthenticated()) {
              this.router.navigate(['/']);
            }
          },
          complete: () => {
            if (this.authStore.isAuthenticated()) {
              this.router.navigate(['/']);
            }
          }
        });
    }
  }

  get firstName() { return this.registerForm.get('firstName'); }
  get lastName() { return this.registerForm.get('lastName'); }
  get email() { return this.registerForm.get('email'); }
  get password() { return this.registerForm.get('password'); }
  get confirmPassword() { return this.registerForm.get('confirmPassword'); }
}

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthStore } from '../../../core/stores/auth-store/auth.store';
import { LoginCredentials } from '../../../shared/models/auth-models';
import { interval, take, takeWhile } from 'rxjs';

@Component({
  selector: 'app-login',
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private formBuilder = inject(FormBuilder);
  private router = inject(Router);
  protected readonly authStore = inject(AuthStore);

  loginForm: FormGroup = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  onSubmit(): void {
    if (this.loginForm.valid) {
      const credentials: LoginCredentials = this.loginForm.value;
      this.authStore.login(credentials);

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

  get email() { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }
}

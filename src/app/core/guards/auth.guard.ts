import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStore } from '../stores/auth-store/auth.store';

export const authGuard: CanActivateFn = () => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  // Check if we have tokens in localStorage (prevents redirect during initialization)
  const hasTokens = !!authStore.accessToken() || !!authStore.refreshToken();

  if (authStore.isAuthenticated() || (hasTokens && authStore.loading())) {
    return true;
  }

  return router.createUrlTree(['/login']);
};

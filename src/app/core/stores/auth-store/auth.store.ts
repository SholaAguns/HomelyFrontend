import { computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, catchError, EMPTY } from 'rxjs';
import {
  LoginCredentials,
  LoginResponse,
  RegisterData,
  RegisterResponse,
} from '../../../shared/models/auth-models';
import { User } from '../../../shared/models/user-models';
import { NotificationService } from '../../services/notification-service/notification.service';
import { AuthService } from '../../services/auth-service/auth.service';

type AuthState = {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  loading: boolean;
  error: string | null;
};

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  loading: false,
  error: null,
};

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ user, accessToken }) => ({
    isAuthenticated: computed(() => !!user() && !!accessToken()),
  })),
  withMethods(
    (
      store,
      authService = inject(AuthService),
      notificationService = inject(NotificationService),
      router = inject(Router)
    ) => ({
      login: rxMethod<LoginCredentials>(
        pipe(
          tap(() => patchState(store, { loading: true, error: null })),
          switchMap((credentials) =>
            authService.login(credentials).pipe(
              tap((response: LoginResponse) => {
                patchState(store, {
                  user: response.user,
                  accessToken: response.access,
                  refreshToken: response.refresh,
                  loading: false,
                });
                notificationService.success('Login successful');
                router.navigate(['/']);
              }),
              catchError((error: Error) => {
                patchState(store, {
                  error: error.message,
                  loading: false,
                });
                notificationService.error('Login failed: ' + error.message);
                return EMPTY;
              })
            )
          )
        )
      ),

      register: rxMethod<RegisterData>(
        pipe(
          tap(() => patchState(store, { loading: true, error: null })),
          switchMap((data) =>
            authService.register(data).pipe(
              tap((response: RegisterResponse) => {
                patchState(store, {
                  user: null,
                  accessToken: response.access,
                  refreshToken: response.refresh,
                  loading: false,
                });
                notificationService.success('Registration successful');
                router.navigate(['/login']);
              }),
              catchError((error: Error) => {
                patchState(store, {
                  error: error.message,
                  loading: false,
                });
                notificationService.error('Registration failed: ' + error.message);
                return EMPTY;
              })
            )
          )
        )
      ),

      logout: rxMethod<void>(
        pipe(
          switchMap(() => authService.logout()),
          tap(() => {
            authService.removeToken('access_token');
            authService.removeToken('refresh_token');
            patchState(store, initialState);
            notificationService.info('Logged out successfully');
          })
        )
      ),

      initializeFromStorage: () => {
        const accessToken = authService.getAccessToken();
        const refreshToken = authService.getRefreshToken();
        if (accessToken && refreshToken) {
          patchState(store, { accessToken, refreshToken, loading: true });

          authService.getCurrentUser().subscribe({
            next: (user) => {
              patchState(store, { user, loading: false });
            },
            error: () => {
              // Invalid token, clear storage
              authService.removeToken('access_token');
              authService.removeToken('refresh_token');
              patchState(store, initialState);
            },
          });
        }
      },
    })
  )
);

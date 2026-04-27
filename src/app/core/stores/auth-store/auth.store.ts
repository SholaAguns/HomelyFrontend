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
import { AppError } from '../../../shared/models/error-models';
import { User } from '../../../shared/models/user-models';
import { NotificationService } from '../../services/notification-service/notification.service';
import { AuthService } from '../../services/auth-service/auth.service';
import { NotificationStore } from '../notification-store/notification.store';

const PENDING_INVITE_KEY = 'pending_invite_token';

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
      notificationStore = inject(NotificationStore),
      router = inject(Router)
    ) => {
      function postAuthRedirect(accessToken: string): void {
        notificationStore.connect(accessToken);
        const pendingToken = localStorage.getItem(PENDING_INVITE_KEY);
        if (pendingToken) {
          localStorage.removeItem(PENDING_INVITE_KEY);
          router.navigate(['/accept-invite'], { queryParams: { token: pendingToken } });
        } else {
          router.navigate(['/']);
        }
      }

      return {
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
                  postAuthRedirect(response.access);
                }),
                catchError((error: AppError) => {
                  patchState(store, { error: error.message, loading: false });
                  notificationService.error('Login failed. Please try again.');
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
                  postAuthRedirect(response.access);
                }),
                catchError((error: AppError) => {
                  patchState(store, { error: error.message, loading: false });
                  notificationService.error('Registration failed. Please try again.');
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
              notificationStore.disconnect();
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
                notificationStore.connect(accessToken);
              },
              error: () => {
                authService.removeToken('access_token');
                authService.removeToken('refresh_token');
                patchState(store, initialState);
              },
            });
          }
        },
      };
    }
  )
);

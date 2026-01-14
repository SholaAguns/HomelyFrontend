import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';
import {LoginCredentials, LoginResponse, RegisterData, User} from '../../shared/models/auth-models';
import { NotificationService } from '../services/notification.service';
import {AuthService} from '../services/auth.service';

type AuthState = {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
};

const initialState: AuthState = {
  user: null,
  token: null,
  loading: false,
  error: null,
};

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ user, token }) => ({
    isAuthenticated: computed(() => !!user() && !!token()),
  })),
  withMethods(
    (store, authService = inject(AuthService), notificationService = inject(NotificationService)) => ({
      login: rxMethod<LoginCredentials>(
        pipe(
          tap(() => patchState(store, { loading: true, error: null })),
          switchMap((credentials) => authService.login(credentials)),
          tap({
            next: (response: LoginResponse) => {
              patchState(store, {
                user: response.user,
                token: response.token,
                loading: false,
              });
              notificationService.success('Login successful');
            },
            error: (error: Error) => {
              patchState(store, {
                error: error.message,
                loading: false,
              });
              notificationService.error('Login failed: ' + error.message);
            },
          })
        )
      ),

      register: rxMethod<RegisterData>(
        pipe(
          tap(() => patchState(store, { loading: true, error: null })),
          switchMap((data) => authService.register(data)),
          tap({
            next: (response: AuthResponse) => {
              patchState(store, {
                user: response.user,
                token: response.token,
                loading: false,
              });
              notificationService.success('Registration successful');
            },
            error: (error: Error) => {
              patchState(store, {
                error: error.message,
                loading: false,
              });
              notificationService.error('Registration failed: ' + error.message);
            },
          })
        )
      ),

      logout: () => {
        authService.logout();
        patchState(store, initialState);
        notificationService.info('Logged out successfully');
      },

      initializeFromStorage: () => {
        const token = authService.getToken();
        if (token) {
          patchState(store, { token });
          // TODO: Fetch user data from API using token
        }
      },
    })
  )
);

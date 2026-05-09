import { Injectable, inject, signal } from '@angular/core';
import { Observable, of, tap, map } from 'rxjs';
import { ApiService } from '../api-service/api.service';
import {
  LoginCredentials,
  LoginResponse,
  ProjectRole,
  ProjectRoleResponse,
  RegisterData,
  RegisterResponse,
} from '../../../shared/models/auth-models';
import {
  ChangePasswordRequest,
  EditUserProfileRequest,
  UpdateAccountDetailsRequest,
  User,
  UserProfile,
} from '../../../shared/models/user-models';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private api = inject(ApiService);
  private readonly ACCESS_TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly AUTH_ENDPOINT = 'accounts/';

  currentUserEmail = signal<string>('');
  private roleCache = new Map<string, ProjectRole>();

  login(credentials: LoginCredentials): Observable<LoginResponse> {
    let endpoint = this.AUTH_ENDPOINT + 'login/';

    return this.api.post<LoginResponse>(endpoint, credentials).pipe(
      tap((response) => {
        this.setToken(this.ACCESS_TOKEN_KEY, response.access);
        this.setToken(this.REFRESH_TOKEN_KEY, response.refresh);
      })
    );
  }

  register(data: RegisterData): Observable<RegisterResponse> {
    let endpoint = this.AUTH_ENDPOINT + 'register/';

    return this.api.post<RegisterResponse>(endpoint, data).pipe(
      tap((response) => {
        this.setToken(this.ACCESS_TOKEN_KEY, response.access);
        this.setToken(this.REFRESH_TOKEN_KEY, response.refresh);
      })
    );
  }

  logout(): Observable<void> {
    if (!this.isAuthenticated()) return of(undefined);

    let endpoint = this.AUTH_ENDPOINT + 'logout/';
    let data = {
      refresh: this.getRefreshToken(),
    };

    return this.api.post<void>(endpoint, data);
  }

  refreshToken(): Observable<RegisterResponse> {
    let endpoint = this.AUTH_ENDPOINT + 'token/refresh/';
    let data = {
      refresh: this.getRefreshToken(),
    };

    return this.api.post<RegisterResponse>(endpoint, data).pipe(
      tap((response) => {
        this.setToken(this.ACCESS_TOKEN_KEY, response.access);
        this.setToken(this.REFRESH_TOKEN_KEY, response.refresh);
      })
    );
  }

  getUser(userId: string): Observable<User> {
    let endpoint = this.AUTH_ENDPOINT + `users/${userId}/`;

    return this.api.get<User>(endpoint);
  }

  getCurrentUser(): Observable<User> {
    let endpoint = this.AUTH_ENDPOINT + 'users/me/';

    return this.api.get<User>(endpoint).pipe(tap((user) => this.currentUserEmail.set(user.email)));
  }

  getUserRoleOld(projectUuid: string): Observable<ProjectRole> {
    if (this.roleCache.has(projectUuid)) {
      return of(this.roleCache.get(projectUuid)!);
    }

    return this.api.get<{ role: ProjectRole }>(`property/projects/${projectUuid}/user-role/`).pipe(
      map((response) => response.role),
      tap((role) => this.roleCache.set(projectUuid, role))
    );
  }

  getUserRole(projectUuid: string): Observable<ProjectRoleResponse> {
    return this.api.get<ProjectRoleResponse>(`property/projects/${projectUuid}/user-role/`).pipe();
  }

  clearRoleCache(projectUuid?: string): void {
    if (projectUuid) {
      this.roleCache.delete(projectUuid);
    } else {
      this.roleCache.clear();
    }
  }

  canEdit(projectUuid: string, role?: ProjectRole): boolean {
    if (role !== undefined) {
      return role === 'owner' || role === 'contributor';
    }
    const cachedRole = this.roleCache.get(projectUuid);
    return cachedRole === 'owner' || cachedRole === 'contributor';
  }

  isOwner(projectUuid: string, role?: ProjectRole): boolean {
    if (role !== undefined) {
      return role === 'owner';
    }
    const cachedRole = this.roleCache.get(projectUuid);
    return cachedRole === 'owner';
  }

  canView(projectUuid: string, role?: ProjectRole): boolean {
    if (role !== undefined) {
      return role !== null;
    }
    const cachedRole = this.roleCache.get(projectUuid);
    return cachedRole !== null;
  }

  editUserProfile(requestData: EditUserProfileRequest): Observable<UserProfile> {
    let endpoint = this.AUTH_ENDPOINT + 'users/profile/';

    return this.api.put<UserProfile>(endpoint, requestData);
  }

  updateAccountDetails(requestData: UpdateAccountDetailsRequest): Observable<UserProfile> {
    return this.api.patch<UserProfile>(this.AUTH_ENDPOINT + 'users/profile/', requestData);
  }

  changePassword(requestData: ChangePasswordRequest): Observable<{ message: string }> {
    return this.api.post<{ message: string }>(
      this.AUTH_ENDPOINT + 'users/change_password/',
      requestData
    );
  }

  deleteAccount(): Observable<void> {
    return this.api.delete<void>(this.AUTH_ENDPOINT + 'users/delete_account/');
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  private setToken(key: string, token: string): void {
    localStorage.setItem(key, token);
  }

  removeToken(key: string): void {
    localStorage.removeItem(key);
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }
}

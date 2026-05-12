import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
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
  private readonly AUTH_ENDPOINT = 'accounts/';
  currentUserEmail = signal<string>('');

  login(credentials: LoginCredentials): Observable<LoginResponse> {
    return this.api.post<LoginResponse>(this.AUTH_ENDPOINT + 'login/', credentials);
  }

  register(data: RegisterData): Observable<RegisterResponse> {
    return this.api.post<RegisterResponse>(this.AUTH_ENDPOINT + 'register/', data);
  }

  logout(): Observable<void> {
    return this.api.post<void>(this.AUTH_ENDPOINT + 'logout/', {});
  }

  refreshToken(): Observable<void> {
    return this.api.post<void>(this.AUTH_ENDPOINT + 'token/refresh/', {});
  }

  getUser(userId: string): Observable<User> {
    return this.api.get<User>(this.AUTH_ENDPOINT + `users/${userId}/`);
  }

  getCurrentUser(): Observable<User> {
    return this.api
      .get<User>(this.AUTH_ENDPOINT + 'users/me/')
      .pipe(tap((user) => this.currentUserEmail.set(user.email)));
  }

  getUserRole(projectUuid: string): Observable<ProjectRoleResponse> {
    return this.api.get<ProjectRoleResponse>(`property/projects/${projectUuid}/user-role/`);
  }

  canEdit(_projectUuid: string, role?: ProjectRole): boolean {
    return role === 'owner' || role === 'contributor';
  }

  isOwner(_projectUuid: string, role?: ProjectRole): boolean {
    return role === 'owner';
  }

  canView(_projectUuid: string, role?: ProjectRole): boolean {
    return role !== null && role !== undefined;
  }

  editUserProfile(requestData: EditUserProfileRequest): Observable<UserProfile> {
    return this.api.put<UserProfile>(this.AUTH_ENDPOINT + 'users/profile/', requestData);
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
}

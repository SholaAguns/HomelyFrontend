import { Injectable, inject } from '@angular/core';
import { Observable, of, tap } from 'rxjs';
import { ApiService } from '../api-service/api.service';
import {LoginCredentials, LoginResponse, RegisterData, RegisterResponse} from '../../../shared/models/auth-models';
import {EditUserProfileRequest, User, UserProfile} from '../../../shared/models/user-models';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private api = inject(ApiService);
  private readonly ACCESS_TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly AUTH_ENDPOINT = 'accounts/';

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
    if(!this.isAuthenticated()) return of(undefined);

    let endpoint = this.AUTH_ENDPOINT + 'logout/';
    let data = {
      refresh: this.getRefreshToken()
    };

    return this.api.post<void>(endpoint, data);
  }

  refreshToken(): Observable<RegisterResponse> {

    let endpoint = this.AUTH_ENDPOINT + 'token/refresh/';
    let data = {
      refresh: this.getRefreshToken()
    }

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

  editUserProfile(requestData: EditUserProfileRequest): Observable<UserProfile> {

    let endpoint = this.AUTH_ENDPOINT + 'users/profile/';

    return this.api.put<UserProfile>(endpoint, requestData);
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

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Router, provideRouter } from '@angular/router';
import { HeaderComponent } from './header.component';
import { UiStore } from '../../../core/stores/ui.store';
import { AuthStore } from '../../../core/stores/auth-store/auth.store';
import { NotificationStore } from '../../../core/stores/notification-store/notification.store';
import { signal } from '@angular/core';
import { createNotificationStoreMock } from '../../mocks/notification-store.mock';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockUiStore: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockAuthStore: any;

  beforeEach(async () => {
    mockUiStore = {
      theme: signal('light'),
      toggleSidebar: vi.fn(),
      toggleTheme: vi.fn(),
    };

    mockAuthStore = {
      isAuthenticated: signal(true),
      logout: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [
        provideRouter([]),
        { provide: UiStore, useValue: mockUiStore },
        { provide: AuthStore, useValue: mockAuthStore },
        { provide: NotificationStore, useValue: createNotificationStoreMock() },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call toggleSidebar on onToggleSidebar', () => {
    component.onToggleSidebar();
    expect(mockUiStore.toggleSidebar).toHaveBeenCalled();
  });

  it('should call toggleTheme on onToggleTheme', () => {
    component.onToggleTheme();
    expect(mockUiStore.toggleTheme).toHaveBeenCalled();
  });

  it('should call logout and navigate on onLogout', () => {
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate');

    component.onLogout();
    expect(mockAuthStore.logout).toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledWith(['/']);
  });

  it('should display correct theme icon based on theme', () => {
    const compiled = fixture.nativeElement;

    mockUiStore.theme.set('light');
    fixture.detectChanges();
    let moonIcon = compiled.querySelector(
      'button[aria-label="Toggle theme"] svg path[d*="M20.354"]'
    );
    expect(moonIcon).toBeTruthy();

    mockUiStore.theme.set('dark');
    fixture.detectChanges();
    let sunIcon = compiled.querySelector(
      'button[aria-label="Toggle theme"] svg path[d*="M12 3v1"]'
    );
    expect(sunIcon).toBeTruthy();
  });

  it('should show logout button when authenticated', () => {
    mockAuthStore.isAuthenticated.set(true);
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const logoutButton = compiled.querySelector('button[aria-label="Logout"]');
    expect(logoutButton).toBeTruthy();
  });

  it('should hide logout button when not authenticated', () => {
    mockAuthStore.isAuthenticated.set(false);
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const logoutButton = compiled.querySelector('button[aria-label="Logout"]');
    expect(logoutButton).toBeFalsy();
  });

  it('should have router link to home on logo/text', () => {
    const compiled = fixture.nativeElement;
    const logoLink = compiled.querySelector('a[routerLink="/home"]');
    expect(logoLink).toBeTruthy();
    expect(logoLink.textContent).toContain('Homely');
  });
});

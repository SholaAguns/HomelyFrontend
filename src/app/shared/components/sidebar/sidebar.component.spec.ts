import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { provideRouter } from '@angular/router';
import { SidebarComponent } from './sidebar.component';
import { UiStore } from '../../../core/stores/ui.store';
import { signal } from '@angular/core';

describe('SidebarComponent', () => {
  let component: SidebarComponent;
  let fixture: ComponentFixture<SidebarComponent>;
  let mockUiStore: any;

  beforeEach(async () => {
    mockUiStore = {
      sidebarOpen: signal(true),
    };

    await TestBed.configureTestingModule({
      imports: [SidebarComponent],
      providers: [provideRouter([]), { provide: UiStore, useValue: mockUiStore }],
    }).compileComponents();

    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have correct navigation items', () => {
    expect((component as any).navItems).toEqual([
      { path: '/projects', icon: 'list', label: 'Projects' },
      { path: '/favorites', icon: 'heart', label: 'Favorites' },
      { path: '/rating-criteria', icon: 'star', label: 'Rating Criteria' },
      { path: '/saved-locations', icon: 'map-pin', label: 'Saved Locations' },
      { path: '/profile', icon: 'user', label: 'Profile' },
      { path: '/settings', icon: 'settings', label: 'Settings' },
    ]);
  });

  it('should have Projects as first navigation item', () => {
    expect((component as any).navItems[0]).toEqual({
      path: '/projects',
      icon: 'list',
      label: 'Projects',
    });
  });

  it('should display version information', () => {
    const compiled = fixture.nativeElement;
    const versionElement = compiled.querySelector('p');
    expect(versionElement.textContent).toContain('Homely v1.0.0');
  });

  it('should apply correct width class when sidebar is open', () => {
    mockUiStore.sidebarOpen.set(true);
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const sidebar = compiled.querySelector('aside');
    expect(sidebar.classList.contains('w-64')).toBe(true);
  });

  it('should apply correct width class when sidebar is closed', () => {
    mockUiStore.sidebarOpen.set(false);
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const sidebar = compiled.querySelector('aside');
    expect(sidebar.classList.contains('w-0')).toBe(true);
  });

  it('should render all navigation items', () => {
    const compiled = fixture.nativeElement;
    const navLinks = compiled.querySelectorAll('nav a');
    expect(navLinks.length).toBe(6);
  });

  it('should have correct routerLink for Projects', () => {
    const compiled = fixture.nativeElement;
    const projectsLink = compiled.querySelector('a[href="/projects"]');
    expect(projectsLink).toBeTruthy();
    expect(projectsLink.textContent).toContain('Projects');
  });
});

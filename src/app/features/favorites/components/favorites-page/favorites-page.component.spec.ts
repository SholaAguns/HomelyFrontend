import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { FavoritesPageComponent } from './favorites-page.component';
import { FavoritesService } from '../../../../core/services/favorites-service/favorites.service';
import { NotificationService } from '../../../../core/services/notification-service/notification.service';
import { createRouterMock } from '../../../../shared/mocks/router.mock';
import {
  mockProperty,
  mockPropertyStage2Complete,
} from '../../../../shared/mocks/models/property-models.mock';

function createNotificationServiceMock() {
  return {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    show: vi.fn(),
    remove: vi.fn(),
  };
}

function createFavoritesServiceMock() {
  return {
    getAllFavorites: vi.fn(),
    getProjectFavorites: vi.fn(),
    addFavorite: vi.fn(),
    removeFavorite: vi.fn(),
  };
}

describe('FavoritesPageComponent', () => {
  let component: FavoritesPageComponent;
  let fixture: ComponentFixture<FavoritesPageComponent>;
  let routerMock: any;
  let favoritesServiceMock: ReturnType<typeof createFavoritesServiceMock>;
  let notificationServiceMock: ReturnType<typeof createNotificationServiceMock>;

  beforeEach(async () => {
    routerMock = createRouterMock();
    favoritesServiceMock = createFavoritesServiceMock();
    notificationServiceMock = createNotificationServiceMock();

    await TestBed.configureTestingModule({
      imports: [FavoritesPageComponent],
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: FavoritesService, useValue: favoritesServiceMock },
        { provide: NotificationService, useValue: notificationServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FavoritesPageComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should load favorites on init', () => {
      const mockFavorites = [
        { ...mockProperty, is_favorited: true },
        { ...mockPropertyStage2Complete, is_favorited: true },
      ];
      favoritesServiceMock.getAllFavorites.mockReturnValue(of(mockFavorites));

      component.ngOnInit();

      expect(favoritesServiceMock.getAllFavorites).toHaveBeenCalled();
      expect(component.favorites()).toEqual(mockFavorites);
      expect(component.loading()).toBe(false);
    });

    it('should handle error when loading favorites fails', () => {
      const error = new Error('Failed to load');
      favoritesServiceMock.getAllFavorites.mockReturnValue(throwError(() => error));

      component.ngOnInit();

      expect(component.error()).toBe('Failed to load');
      expect(component.loading()).toBe(false);
      expect(notificationServiceMock.error).toHaveBeenCalledWith('Failed to load favorites');
    });
  });

  describe('loadFavorites', () => {
    it('should set loading state while fetching', () => {
      const mockFavorites = [{ ...mockProperty, is_favorited: true }];
      favoritesServiceMock.getAllFavorites.mockReturnValue(of(mockFavorites));

      component.loadFavorites();

      expect(component.loading()).toBe(false);
      expect(component.favorites()).toEqual(mockFavorites);
    });

    it('should clear error state on successful load', () => {
      const mockFavorites = [{ ...mockProperty, is_favorited: true }];
      favoritesServiceMock.getAllFavorites.mockReturnValue(of(mockFavorites));
      component.error.set('Previous error');

      component.loadFavorites();

      expect(component.error()).toBeNull();
    });
  });

  describe('onFavoriteToggle', () => {
    beforeEach(() => {
      const mockFavorites = [
        { ...mockProperty, is_favorited: true },
        { ...mockPropertyStage2Complete, is_favorited: true },
      ];
      component.favorites.set(mockFavorites);
    });

    it('should remove favorite and update UI optimistically', () => {
      favoritesServiceMock.removeFavorite.mockReturnValue(of(void 0));

      component.onFavoriteToggle('property-uuid-1');

      expect(favoritesServiceMock.removeFavorite).toHaveBeenCalledWith('property-uuid-1');
      expect(component.favorites().length).toBe(1);
      expect(component.favorites()[0].uuid).toBe('property-uuid-2');
      expect(notificationServiceMock.success).toHaveBeenCalledWith('Removed from favorites');
    });

    it('should add favorite when property is not favorited', () => {
      const unfavoritedProperty = { ...mockProperty, is_favorited: false };
      component.favorites.set([unfavoritedProperty]);
      favoritesServiceMock.addFavorite.mockReturnValue(of(void 0));

      component.onFavoriteToggle('property-uuid-1');

      expect(favoritesServiceMock.addFavorite).toHaveBeenCalledWith('property-uuid-1');
      expect(notificationServiceMock.success).toHaveBeenCalledWith('Added to favorites');
    });

    it('should revert state and show error on failure', () => {
      const error = new Error('API error');
      favoritesServiceMock.removeFavorite.mockReturnValue(throwError(() => error));
      const initialProperty = component.favorites()[0];

      component.onFavoriteToggle('property-uuid-1');

      expect(initialProperty.is_favorited).toBe(true);
      expect(notificationServiceMock.error).toHaveBeenCalledWith('Failed to update favorite');
    });

    it('should do nothing if property not found', () => {
      component.onFavoriteToggle('non-existent-uuid');

      expect(favoritesServiceMock.removeFavorite).not.toHaveBeenCalled();
      expect(favoritesServiceMock.addFavorite).not.toHaveBeenCalled();
    });
  });
});

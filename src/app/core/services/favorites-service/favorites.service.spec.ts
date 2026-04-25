import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { FavoritesService } from './favorites.service';
import { ApiService } from '../api-service/api.service';
import { of } from 'rxjs';
import { firstValueFrom } from 'rxjs';
import {
  mockProperty,
  mockPropertyStage2Complete,
} from '../../../shared/mocks/models/property-models.mock';
import { createApiServiceMock } from '../../../shared/mocks/api-service.mock';

describe('FavoritesService', () => {
  let favoritesService: FavoritesService;
  let apiServiceMock: ReturnType<typeof createApiServiceMock>;

  beforeEach(() => {
    apiServiceMock = createApiServiceMock();

    TestBed.configureTestingModule({
      providers: [FavoritesService, { provide: ApiService, useValue: apiServiceMock }],
    });

    favoritesService = TestBed.inject(FavoritesService);
  });

  it('should be created', () => {
    expect(favoritesService).toBeTruthy();
  });

  describe('getAllFavorites', () => {
    it('should call API get with correct endpoint', async () => {
      const mockFavorites = [
        { ...mockProperty, is_favorited: true },
        { ...mockPropertyStage2Complete, is_favorited: true },
      ];
      apiServiceMock.get.mockReturnValue(of(mockFavorites));

      const response = await firstValueFrom(favoritesService.getAllFavorites());

      expect(response).toEqual(mockFavorites);
      expect(apiServiceMock.get).toHaveBeenCalledWith('property/favorites/');
    });

    it('should return empty array when no favorites', async () => {
      apiServiceMock.get.mockReturnValue(of([]));

      const response = await firstValueFrom(favoritesService.getAllFavorites());

      expect(response).toEqual([]);
      expect(apiServiceMock.get).toHaveBeenCalledWith('property/favorites/');
    });
  });

  describe('getProjectFavorites', () => {
    it('should call API get with project uuid parameter and extract properties array', async () => {
      const mockFavorites = [{ ...mockProperty, is_favorited: true }];
      const mockResponse = {
        project_id: 'project-uuid-1',
        project_name: 'Test Project',
        total_favorites: 1,
        properties: mockFavorites,
      };
      apiServiceMock.get.mockReturnValue(of(mockResponse));

      const response = await firstValueFrom(favoritesService.getProjectFavorites('project-uuid-1'));

      expect(response).toEqual(mockFavorites);
      expect(apiServiceMock.get).toHaveBeenCalledWith(
        'property/projects/project-uuid-1/favorites/'
      );
    });

    it('should return empty array when no favorites in project', async () => {
      const mockResponse = {
        project_id: 'project-uuid-2',
        project_name: 'Test Project 2',
        total_favorites: 0,
        properties: [],
      };
      apiServiceMock.get.mockReturnValue(of(mockResponse));

      const response = await firstValueFrom(favoritesService.getProjectFavorites('project-uuid-2'));

      expect(response).toEqual([]);
      expect(apiServiceMock.get).toHaveBeenCalledWith(
        'property/projects/project-uuid-2/favorites/'
      );
    });
  });

  describe('addFavorite', () => {
    it('should call API post with property_uuid in request body', async () => {
      apiServiceMock.post.mockReturnValue(of(void 0));

      await firstValueFrom(favoritesService.addFavorite('property-uuid-1'));

      expect(apiServiceMock.post).toHaveBeenCalledWith('property/favorites/', {
        property_uuid: 'property-uuid-1',
      });
    });

    it('should handle different property uuids', async () => {
      apiServiceMock.post.mockReturnValue(of(void 0));

      await firstValueFrom(favoritesService.addFavorite('property-uuid-999'));

      expect(apiServiceMock.post).toHaveBeenCalledWith('property/favorites/', {
        property_uuid: 'property-uuid-999',
      });
    });
  });

  describe('removeFavorite', () => {
    it('should call API delete with property uuid', async () => {
      apiServiceMock.delete.mockReturnValue(of(void 0));

      await firstValueFrom(favoritesService.removeFavorite('property-uuid-1'));

      expect(apiServiceMock.delete).toHaveBeenCalledWith('property/favorites/property-uuid-1/');
    });

    it('should handle different property uuids', async () => {
      apiServiceMock.delete.mockReturnValue(of(void 0));

      await firstValueFrom(favoritesService.removeFavorite('property-uuid-999'));

      expect(apiServiceMock.delete).toHaveBeenCalledWith('property/favorites/property-uuid-999/');
    });
  });
});

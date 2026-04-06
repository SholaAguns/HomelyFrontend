import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { SavedLocationService } from './saved-location.service';
import { ApiService } from './api-service/api.service';
import { of } from 'rxjs';
import { firstValueFrom } from 'rxjs';
import {
  mockSavedLocation,
  mockSavedLocation2,
  mockCreateSavedLocationDto,
  mockUpdateSavedLocationDto,
} from '../../shared/mocks/models/saved-location-models.mock';
import { createApiServiceMock } from '../../shared/mocks/api-service.mock';

describe('SavedLocationService', () => {
  let savedLocationService: SavedLocationService;
  let apiServiceMock: ReturnType<typeof createApiServiceMock>;

  beforeEach(() => {
    apiServiceMock = createApiServiceMock();

    TestBed.configureTestingModule({
      providers: [SavedLocationService, { provide: ApiService, useValue: apiServiceMock }],
    });

    savedLocationService = TestBed.inject(SavedLocationService);
  });

  it('should be created', () => {
    expect(savedLocationService).toBeTruthy();
  });

  describe('getAll', () => {
    it('should call API get with correct endpoint', async () => {
      const mockLocations = [mockSavedLocation, mockSavedLocation2];
      apiServiceMock.get.mockReturnValue(of(mockLocations));

      const response = await firstValueFrom(savedLocationService.getAll());

      expect(response).toEqual(mockLocations);
      expect(apiServiceMock.get).toHaveBeenCalledWith('property/saved-locations/');
    });
  });

  describe('getByUuid', () => {
    it('should call API get with uuid parameter', async () => {
      apiServiceMock.get.mockReturnValue(of(mockSavedLocation));

      const response = await firstValueFrom(savedLocationService.getByUuid('test-location-uuid-1'));

      expect(response).toEqual(mockSavedLocation);
      expect(apiServiceMock.get).toHaveBeenCalledWith(
        'property/saved-locations/test-location-uuid-1/'
      );
    });
  });

  describe('create', () => {
    it('should call API post with create data', async () => {
      apiServiceMock.post.mockReturnValue(of(mockSavedLocation));

      const response = await firstValueFrom(
        savedLocationService.create(mockCreateSavedLocationDto)
      );

      expect(response).toEqual(mockSavedLocation);
      expect(apiServiceMock.post).toHaveBeenCalledWith(
        'property/saved-locations/',
        mockCreateSavedLocationDto
      );
    });
  });

  describe('update', () => {
    it('should call API patch with uuid and update data', async () => {
      const updatedLocation = { ...mockSavedLocation, ...mockUpdateSavedLocationDto };
      apiServiceMock.patch.mockReturnValue(of(updatedLocation));

      const response = await firstValueFrom(
        savedLocationService.update('test-location-uuid-1', mockUpdateSavedLocationDto)
      );

      expect(response).toEqual(updatedLocation);
      expect(apiServiceMock.patch).toHaveBeenCalledWith(
        'property/saved-locations/test-location-uuid-1/',
        mockUpdateSavedLocationDto
      );
    });
  });

  describe('delete', () => {
    it('should call API delete with uuid', async () => {
      apiServiceMock.delete.mockReturnValue(of(void 0));

      await firstValueFrom(savedLocationService.delete('test-location-uuid-1'));

      expect(apiServiceMock.delete).toHaveBeenCalledWith(
        'property/saved-locations/test-location-uuid-1/'
      );
    });
  });
});

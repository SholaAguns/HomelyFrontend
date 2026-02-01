import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { PropertyCreationService } from './property-creation.service';
import { ApiService } from '../api-service/api.service';
import { of } from 'rxjs';
import { firstValueFrom } from 'rxjs';
import {
  mockCreateFromSearchRequest,
  mockCreateFromSearchResponse,
  mockPropertyListTask,
} from '../../../shared/mocks/models/property-models.mock';
import { createApiServiceMock } from '../../../shared/mocks/api-service.mock';

describe('PropertyCreationService', () => {
  let propertyCreationService: PropertyCreationService;
  let apiServiceMock: ReturnType<typeof createApiServiceMock>;

  beforeEach(() => {
    apiServiceMock = createApiServiceMock();

    TestBed.configureTestingModule({
      providers: [PropertyCreationService, { provide: ApiService, useValue: apiServiceMock }],
    });

    propertyCreationService = TestBed.inject(PropertyCreationService);
  });

  it('should be created', () => {
    expect(propertyCreationService).toBeTruthy();
  });

  describe('createFromSearch', () => {
    it('should call API post to create-from-search endpoint with propertyListUuid and request', async () => {
      apiServiceMock.post.mockReturnValue(of(mockCreateFromSearchResponse));

      const response = await firstValueFrom(
        propertyCreationService.createFromSearch('list-uuid-1', mockCreateFromSearchRequest)
      );

      expect(response).toEqual(mockCreateFromSearchResponse);
      expect(apiServiceMock.post).toHaveBeenCalledWith(
        'property/property-lists/list-uuid-1/create-from-search/',
        mockCreateFromSearchRequest
      );
    });

    it('should handle different property list UUIDs', async () => {
      apiServiceMock.post.mockReturnValue(of(mockCreateFromSearchResponse));

      await firstValueFrom(
        propertyCreationService.createFromSearch('different-list-uuid', mockCreateFromSearchRequest)
      );

      expect(apiServiceMock.post).toHaveBeenCalledWith(
        'property/property-lists/different-list-uuid/create-from-search/',
        mockCreateFromSearchRequest
      );
    });
  });

  describe('getSearchStatus', () => {
    it('should call API get to scrape-status endpoint with propertyListUuid and taskUuid', async () => {
      apiServiceMock.get.mockReturnValue(of(mockPropertyListTask));

      const response = await firstValueFrom(
        propertyCreationService.getSearchStatus('list-uuid-1', 'task-uuid-1')
      );

      expect(response).toEqual(mockPropertyListTask);
      expect(apiServiceMock.get).toHaveBeenCalledWith(
        'property/property-lists/list-uuid-1/scrape-status/task-uuid-1/'
      );
    });

    it('should handle different task UUIDs', async () => {
      apiServiceMock.get.mockReturnValue(of(mockPropertyListTask));

      await firstValueFrom(
        propertyCreationService.getSearchStatus('list-uuid-1', 'different-task-uuid')
      );

      expect(apiServiceMock.get).toHaveBeenCalledWith(
        'property/property-lists/list-uuid-1/scrape-status/different-task-uuid/'
      );
    });
  });
});

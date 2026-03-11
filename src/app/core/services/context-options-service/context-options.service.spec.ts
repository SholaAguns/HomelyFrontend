import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { firstValueFrom } from 'rxjs';
import { of } from 'rxjs';
import { ContextOptionsService } from './context-options.service';
import { ApiService } from '../api-service/api.service';
import { createApiServiceMock } from '../../../shared/mocks/api-service.mock';
import {
  mockContextOptions,
  mockUpdateContextOptionsDto,
} from '../../../shared/mocks/models/property-list-models.mock';

describe('ContextOptionsService', () => {
  let contextOptionsService: ContextOptionsService;
  let apiServiceMock: ReturnType<typeof createApiServiceMock>;

  const propertyListUuid = 'test-uuid-1';
  const expectedEndpoint = `property/property-lists/${propertyListUuid}/context-options/`;

  beforeEach(() => {
    apiServiceMock = createApiServiceMock();

    TestBed.configureTestingModule({
      providers: [ContextOptionsService, { provide: ApiService, useValue: apiServiceMock }],
    });

    contextOptionsService = TestBed.inject(ContextOptionsService);
  });

  it('should be created', () => {
    expect(contextOptionsService).toBeTruthy();
  });

  describe('getByPropertyList', () => {
    it('should call API get with correct context options endpoint', async () => {
      apiServiceMock.get.mockReturnValue(of(mockContextOptions));

      const response = await firstValueFrom(
        contextOptionsService.getByPropertyList(propertyListUuid)
      );

      expect(response).toEqual(mockContextOptions);
      expect(apiServiceMock.get).toHaveBeenCalledWith(expectedEndpoint);
    });
  });

  describe('update', () => {
    it('should call API patch with correct endpoint and update data', async () => {
      const updatedOptions = { ...mockContextOptions, ...mockUpdateContextOptionsDto };
      apiServiceMock.patch.mockReturnValue(of(updatedOptions));

      const response = await firstValueFrom(
        contextOptionsService.update(propertyListUuid, mockUpdateContextOptionsDto)
      );

      expect(response).toEqual(updatedOptions);
      expect(apiServiceMock.patch).toHaveBeenCalledWith(
        expectedEndpoint,
        mockUpdateContextOptionsDto
      );
    });
  });
});

import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PropertyListService } from './property-list.service';
import { ApiService } from '../api-service/api.service';
import { of } from 'rxjs';
import { firstValueFrom } from 'rxjs';
import {
  mockPropertyList,
  mockActivePropertyList,
  mockPropertyListDetail,
  mockCreatePropertyListDto,
  mockUpdatePropertyListDto,
} from '../../../shared/mocks/models/property-list-models.mock';
import { createApiServiceMock } from '../../../shared/mocks/api-service.mock';

describe('PropertyListService', () => {
  let propertyListService: PropertyListService;
  let apiServiceMock: ReturnType<typeof createApiServiceMock>;

  beforeEach(() => {
    apiServiceMock = createApiServiceMock();

    TestBed.configureTestingModule({
      providers: [PropertyListService, { provide: ApiService, useValue: apiServiceMock }],
    });

    propertyListService = TestBed.inject(PropertyListService);
  });

  it('should be created', () => {
    expect(propertyListService).toBeTruthy();
  });

  describe('getAll', () => {
    it('should call API get with correct endpoint', async () => {
      const mockLists = [mockPropertyList, mockActivePropertyList];
      apiServiceMock.get.mockReturnValue(of(mockLists));

      const response = await firstValueFrom(propertyListService.getAll());

      expect(response).toEqual(mockLists);
      expect(apiServiceMock.get).toHaveBeenCalledWith('property/property-lists/');
    });
  });

  describe('getByUuid', () => {
    it('should call API get with uuid parameter', async () => {
      apiServiceMock.get.mockReturnValue(of(mockPropertyListDetail));

      const response = await firstValueFrom(propertyListService.getByUuid('test-uuid-1'));

      expect(response).toEqual(mockPropertyListDetail);
      expect(apiServiceMock.get).toHaveBeenCalledWith('property/property-lists/test-uuid-1/');
    });
  });

  describe('create', () => {
    it('should call API post with create data', async () => {
      apiServiceMock.post.mockReturnValue(of(mockPropertyList));

      const response = await firstValueFrom(propertyListService.create(mockCreatePropertyListDto));

      expect(response).toEqual(mockPropertyList);
      expect(apiServiceMock.post).toHaveBeenCalledWith(
        'property/property-lists/',
        mockCreatePropertyListDto
      );
    });
  });

  describe('update', () => {
    it('should call API patch with uuid and update data', async () => {
      const updatedList = { ...mockPropertyList, ...mockUpdatePropertyListDto };
      apiServiceMock.patch.mockReturnValue(of(updatedList));

      const response = await firstValueFrom(
        propertyListService.update('test-uuid-1', mockUpdatePropertyListDto)
      );

      expect(response).toEqual(updatedList);
      expect(apiServiceMock.patch).toHaveBeenCalledWith(
        'property/property-lists/test-uuid-1/',
        mockUpdatePropertyListDto
      );
    });
  });

  describe('delete', () => {
    it('should call API delete with uuid', async () => {
      apiServiceMock.delete.mockReturnValue(of(void 0));

      await firstValueFrom(propertyListService.delete('test-uuid-1'));

      expect(apiServiceMock.delete).toHaveBeenCalledWith('property/property-lists/test-uuid-1/');
    });
  });
});

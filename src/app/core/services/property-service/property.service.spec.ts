import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { PropertyService } from './property.service';
import { ApiService } from '../api-service/api.service';
import { of } from 'rxjs';
import { firstValueFrom } from 'rxjs';
import {
  mockProperty,
  mockPropertyStage2Complete,
  mockPropertyDetail,
  mockCreatePropertyDto,
  mockUpdatePropertyDto,
  mockPropertyStateTransition,
  mockCreateFromInputRequest,
  mockCreateFromInputResponseWithProperty,
} from '../../../shared/mocks/models/property-models.mock';
import { createApiServiceMock } from '../../../shared/mocks/api-service.mock';

describe('PropertyService', () => {
  let propertyService: PropertyService;
  let apiServiceMock: ReturnType<typeof createApiServiceMock>;

  beforeEach(() => {
    apiServiceMock = createApiServiceMock();

    TestBed.configureTestingModule({
      providers: [PropertyService, { provide: ApiService, useValue: apiServiceMock }],
    });

    propertyService = TestBed.inject(PropertyService);
  });

  it('should be created', () => {
    expect(propertyService).toBeTruthy();
  });

  describe('getAll', () => {
    it('should call API get with endpoint only when no propertyListUuid provided', async () => {
      const mockProperties = [mockProperty, mockPropertyStage2Complete];
      apiServiceMock.get.mockReturnValue(of(mockProperties));

      const response = await firstValueFrom(propertyService.getAll());

      expect(response).toEqual(mockProperties);
      expect(apiServiceMock.get).toHaveBeenCalledWith('property/properties/');
    });

    it('should call API get with query parameter when propertyListUuid provided', async () => {
      const mockProperties = [mockProperty];
      apiServiceMock.get.mockReturnValue(of(mockProperties));

      const response = await firstValueFrom(propertyService.getAll('list-uuid-1'));

      expect(response).toEqual(mockProperties);
      expect(apiServiceMock.get).toHaveBeenCalledWith(
        'property/properties/?property_list=list-uuid-1'
      );
    });
  });

  describe('getByUuid', () => {
    it('should call API get with uuid parameter', async () => {
      apiServiceMock.get.mockReturnValue(of(mockPropertyDetail));

      const response = await firstValueFrom(propertyService.getByUuid('property-uuid-1'));

      expect(response).toEqual(mockPropertyDetail);
      expect(apiServiceMock.get).toHaveBeenCalledWith('property/properties/property-uuid-1/');
    });
  });

  describe('create', () => {
    it('should call API post with create data', async () => {
      apiServiceMock.post.mockReturnValue(of(mockProperty));

      const response = await firstValueFrom(propertyService.create(mockCreatePropertyDto));

      expect(response).toEqual(mockProperty);
      expect(apiServiceMock.post).toHaveBeenCalledWith(
        'property/properties/',
        mockCreatePropertyDto
      );
    });
  });

  describe('update', () => {
    it('should call API patch with uuid and update data', async () => {
      const updatedProperty = { ...mockProperty, ...mockUpdatePropertyDto };
      apiServiceMock.patch.mockReturnValue(of(updatedProperty));

      const response = await firstValueFrom(
        propertyService.update('property-uuid-1', mockUpdatePropertyDto)
      );

      expect(response).toEqual(updatedProperty);
      expect(apiServiceMock.patch).toHaveBeenCalledWith(
        'property/properties/property-uuid-1/',
        mockUpdatePropertyDto
      );
    });
  });

  describe('delete', () => {
    it('should call API delete with uuid', async () => {
      apiServiceMock.delete.mockReturnValue(of(void 0));

      await firstValueFrom(propertyService.delete('property-uuid-1'));

      expect(apiServiceMock.delete).toHaveBeenCalledWith('property/properties/property-uuid-1/');
    });
  });

  describe('runStage2', () => {
    it('should call API post to run_stage2 endpoint with uuid', async () => {
      apiServiceMock.post.mockReturnValue(of(mockPropertyStateTransition));

      const response = await firstValueFrom(propertyService.runStage2('property-uuid-1'));

      expect(response).toEqual(mockPropertyStateTransition);
      expect(apiServiceMock.post).toHaveBeenCalledWith(
        'property/properties/property-uuid-1/run_stage2/',
        {}
      );
    });
  });

  describe('runStage3', () => {
    it('should call API post to run_stage3 endpoint with uuid', async () => {
      apiServiceMock.post.mockReturnValue(of(mockPropertyStateTransition));

      const response = await firstValueFrom(propertyService.runStage3('property-uuid-1'));

      expect(response).toEqual(mockPropertyStateTransition);
      expect(apiServiceMock.post).toHaveBeenCalledWith(
        'property/properties/property-uuid-1/run_stage3/',
        {}
      );
    });
  });

  describe('rerunServices', () => {
    it('should call API post to rerun_services endpoint with uuid', async () => {
      apiServiceMock.post.mockReturnValue(of(mockPropertyStateTransition));

      const response = await firstValueFrom(propertyService.rerunServices('property-uuid-1'));

      expect(response).toEqual(mockPropertyStateTransition);
      expect(apiServiceMock.post).toHaveBeenCalledWith(
        'property/properties/property-uuid-1/rerun_services/',
        {}
      );
    });
  });

  describe('createFromInput', () => {
    it('should call API post to create-from-input endpoint with request data', async () => {
      apiServiceMock.post.mockReturnValue(of(mockCreateFromInputResponseWithProperty));

      const response = await firstValueFrom(
        propertyService.createFromInput(mockCreateFromInputRequest)
      );

      expect(response).toEqual(mockCreateFromInputResponseWithProperty);
      expect(apiServiceMock.post).toHaveBeenCalledWith(
        'property/properties/create-from-input/',
        mockCreateFromInputRequest
      );
    });
  });
});

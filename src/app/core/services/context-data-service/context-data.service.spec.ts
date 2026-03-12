import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ContextDataService } from './context-data.service';
import { environment } from '../../../../environments/environment';
import { ContextData } from '../../../shared/models/context-data.models';

describe('ContextDataService', () => {
  let contextDataService: ContextDataService;
  let httpTestingController: HttpTestingController;
  const baseUrl = `${environment.apiUrl}/properties`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ContextDataService],
    });

    contextDataService = TestBed.inject(ContextDataService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(contextDataService).toBeTruthy();
  });

  describe('triggerStage2', () => {
    it('should send POST request to trigger stage 2', () => {
      const propertyId = 'test-property-id';
      const expectedResponse = { message: 'Stage 2 triggered successfully' };

      contextDataService.triggerStage2(propertyId).subscribe((response) => {
        expect(response).toEqual(expectedResponse);
      });

      const request = httpTestingController.expectOne(`${baseUrl}/${propertyId}/run-stage2/`);
      expect(request.request.method).toBe('POST');
      expect(request.request.body).toEqual({});
      request.flush(expectedResponse);
    });
  });

  describe('getContextData', () => {
    it('should fetch all context data for property', () => {
      const propertyId = 'test-property-id';
      const expectedData: ContextData[] = [
        {
          id: '1',
          property_id: propertyId,
          service_name: 'crime',
          status: 'COMPLETE',
          data: {},
          error_message: null,
          started_at: null,
          completed_at: null,
          cached: false,
        },
      ];

      contextDataService.getContextData(propertyId).subscribe((data) => {
        expect(data).toEqual(expectedData);
      });

      const request = httpTestingController.expectOne(`${baseUrl}/${propertyId}/context-data/`);
      expect(request.request.method).toBe('GET');
      request.flush(expectedData);
    });
  });

  describe('getServiceData', () => {
    it('should fetch specific service data', () => {
      const propertyId = 'test-property-id';
      const serviceName = 'crime';
      const expectedData: ContextData = {
        id: '1',
        property_id: propertyId,
        service_name: 'crime',
        status: 'COMPLETE',
        data: {},
        error_message: null,
        started_at: null,
        completed_at: null,
        cached: false,
      };

      contextDataService.getServiceData(propertyId, serviceName).subscribe((data) => {
        expect(data).toEqual(expectedData);
      });

      const request = httpTestingController.expectOne(
        `${baseUrl}/${propertyId}/context-data/${serviceName}/`
      );
      expect(request.request.method).toBe('GET');
      request.flush(expectedData);
    });
  });

  describe('retryService', () => {
    it('should send POST request to retry failed service', () => {
      const propertyId = 'test-property-id';
      const serviceName = 'crime';
      const expectedResponse = { message: 'Service retry triggered' };

      contextDataService.retryService(propertyId, serviceName).subscribe((response) => {
        expect(response).toEqual(expectedResponse);
      });

      const request = httpTestingController.expectOne(
        `${baseUrl}/${propertyId}/retry-service/${serviceName}/`
      );
      expect(request.request.method).toBe('POST');
      expect(request.request.body).toEqual({});
      request.flush(expectedResponse);
    });
  });
});

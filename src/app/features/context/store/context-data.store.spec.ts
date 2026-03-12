/* global jasmine */
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { ContextDataStore } from './context-data.store';
import { ContextDataService } from '../../../core/services/context-data-service/context-data.service';
import { ContextData } from '../../../shared/models/context-data.models';

describe('ContextDataStore', () => {
  let store: InstanceType<typeof ContextDataStore>;
  let contextDataService: jasmine.SpyObj<ContextDataService>;

  const mockContextData: ContextData[] = [
    {
      id: '1',
      property_id: 'prop-1',
      service_name: 'crime',
      status: 'COMPLETE',
      data: { total: 10 },
      error_message: null,
      started_at: null,
      completed_at: null,
      cached: false,
    },
    {
      id: '2',
      property_id: 'prop-1',
      service_name: 'schools',
      status: 'IN_PROGRESS',
      data: null,
      error_message: null,
      started_at: null,
      completed_at: null,
      cached: false,
    },
    {
      id: '3',
      property_id: 'prop-1',
      service_name: 'broadband',
      status: 'FAILED',
      data: null,
      error_message: 'Error fetching broadband data',
      started_at: null,
      completed_at: null,
      cached: false,
    },
  ];

  beforeEach(() => {
    const contextDataServiceSpy = jasmine.createSpyObj('ContextDataService', [
      'getContextData',
      'triggerStage2',
      'retryService',
    ]);

    TestBed.configureTestingModule({
      providers: [
        ContextDataStore,
        { provide: ContextDataService, useValue: contextDataServiceSpy },
      ],
    });

    store = TestBed.inject(ContextDataStore);
    contextDataService = TestBed.inject(ContextDataService) as jasmine.SpyObj<ContextDataService>;
  });

  it('should be created with initial state', () => {
    expect(store).toBeTruthy();
    expect(store.entities()).toEqual({});
    expect(store.byProperty()).toEqual({});
    expect(store.loading()).toEqual({});
    expect(store.error()).toEqual({});
  });

  describe('load', () => {
    it('should load context data for property', (done) => {
      contextDataService.getContextData.and.returnValue(of(mockContextData));

      store.load('prop-1');

      setTimeout(() => {
        expect(contextDataService.getContextData).toHaveBeenCalledWith('prop-1');
        expect(store.entities()['1']).toEqual(mockContextData[0]);
        expect(store.entities()['2']).toEqual(mockContextData[1]);
        expect(store.byProperty()['prop-1']).toEqual(['1', '2', '3']);
        expect(store.loading()['prop-1']).toBe(false);
        done();
      }, 10);
    });

    it('should handle load errors', (done) => {
      const errorMessage = 'Failed to load context data';
      contextDataService.getContextData.and.returnValue(throwError(() => new Error(errorMessage)));

      store.load('prop-1');

      setTimeout(() => {
        expect(store.error()['prop-1']).toBe(errorMessage);
        expect(store.loading()['prop-1']).toBe(false);
        done();
      }, 10);
    });
  });

  describe('computed signals', () => {
    beforeEach((done) => {
      contextDataService.getContextData.and.returnValue(of(mockContextData));
      store.load('prop-1');
      setTimeout(done, 10);
    });

    it('should return context data for property', () => {
      const propertyData = store.forProperty()('prop-1');
      expect(propertyData.length).toBe(3);
      expect(propertyData[0].service_name).toBe('crime');
    });

    it('should calculate progress correctly', () => {
      const progress = store.progressFor()('prop-1');
      expect(progress.total).toBe(3);
      expect(progress.complete).toBe(1);
      expect(progress.in_progress).toBe(1);
      expect(progress.failed).toBe(1);
      expect(progress.pending).toBe(0);
    });

    it('should return completed services', () => {
      const completed = store.completedFor()('prop-1');
      expect(completed.length).toBe(1);
      expect(completed[0].service_name).toBe('crime');
    });

    it('should return failed services', () => {
      const failed = store.failedFor()('prop-1');
      expect(failed.length).toBe(1);
      expect(failed[0].service_name).toBe('broadband');
    });
  });

  describe('triggerStage2', () => {
    it('should trigger stage 2 and reload data', (done) => {
      contextDataService.triggerStage2.and.returnValue(of({ message: 'Success' }));
      contextDataService.getContextData.and.returnValue(of(mockContextData));

      store.triggerStage2('prop-1');

      setTimeout(() => {
        expect(contextDataService.triggerStage2).toHaveBeenCalledWith('prop-1');
        expect(contextDataService.getContextData).toHaveBeenCalledWith('prop-1');
        done();
      }, 10);
    });

    it('should handle trigger errors', (done) => {
      const errorMessage = 'Failed to trigger stage 2';
      contextDataService.triggerStage2.and.returnValue(throwError(() => new Error(errorMessage)));

      store.triggerStage2('prop-1');

      setTimeout(() => {
        expect(store.error()['prop-1']).toBe(errorMessage);
        done();
      }, 10);
    });
  });

  describe('updateService', () => {
    it('should update existing service data', () => {
      const updatedData: ContextData = {
        id: '1',
        property_id: 'prop-1',
        service_name: 'crime',
        status: 'COMPLETE',
        data: { total: 20 },
        error_message: null,
        started_at: null,
        completed_at: null,
        cached: false,
      };

      store.updateService('prop-1', mockContextData[0]);
      expect(store.entities()['1']).toEqual(mockContextData[0]);

      store.updateService('prop-1', updatedData);
      expect(store.entities()['1'].data.total).toBe(20);
    });

    it('should add new service data', () => {
      const newData: ContextData = {
        id: '4',
        property_id: 'prop-1',
        service_name: 'mobile',
        status: 'COMPLETE',
        data: {},
        error_message: null,
        started_at: null,
        completed_at: null,
        cached: false,
      };

      store.updateService('prop-1', newData);
      expect(store.entities()['4']).toEqual(newData);
      expect(store.byProperty()['prop-1']).toContain('4');
    });
  });

  describe('retry', () => {
    it('should retry failed service and reload data', (done) => {
      contextDataService.retryService.and.returnValue(of({ message: 'Success' }));
      contextDataService.getContextData.and.returnValue(of(mockContextData));

      store.retry({ propertyId: 'prop-1', service: 'broadband' });

      setTimeout(() => {
        expect(contextDataService.retryService).toHaveBeenCalledWith('prop-1', 'broadband');
        expect(contextDataService.getContextData).toHaveBeenCalledWith('prop-1');
        done();
      }, 10);
    });

    it('should handle retry errors', (done) => {
      const errorMessage = 'Failed to retry service';
      contextDataService.retryService.and.returnValue(throwError(() => new Error(errorMessage)));

      store.retry({ propertyId: 'prop-1', service: 'broadband' });

      setTimeout(() => {
        expect(store.error()['prop-1']).toBe(errorMessage);
        done();
      }, 10);
    });
  });
});

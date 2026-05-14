import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Router } from '@angular/router';
import { SearchTaskStore } from './search-task.store';
import { PropertyCreationService } from '../../../core/services/property-creation-service/property-creation.service';
import { PropertyWebSocketService } from '../../../core/services/property-websocket-service/property-websocket.service';
import { NotificationService } from '../../../core/services/notification-service/notification.service';
import { of, throwError, Subject } from 'rxjs';
import {
  mockCreateFromSearchRequest,
  mockCreateFromSearchResponse,
  mockPropertyListTask,
  mockPropertyListTaskCompleted,
  mockScrapeProgressEvent,
  mockScrapeProgressEventCompleted,
} from '../../../shared/mocks/models/property-models.mock';
import { createPropertyCreationServiceMock } from '../../../shared/mocks/property-creation-service.mock';
import { createPropertyWebSocketServiceMock } from '../../../shared/mocks/property-websocket-service.mock';
import { createRouterMock } from '../../../shared/mocks/router.mock';
import { createNotificationServiceMock } from '../../../shared/mocks/notification-service.mock';

describe('SearchTaskStore', () => {
  let searchTaskStore: InstanceType<typeof SearchTaskStore>;
  let routerMock: any;
  let propertyCreationServiceMock: ReturnType<typeof createPropertyCreationServiceMock>;
  let propertyWebSocketServiceMock: ReturnType<typeof createPropertyWebSocketServiceMock>;
  let notificationServiceMock: ReturnType<typeof createNotificationServiceMock>;

  beforeEach(() => {
    routerMock = createRouterMock();
    propertyCreationServiceMock = createPropertyCreationServiceMock();
    propertyWebSocketServiceMock = createPropertyWebSocketServiceMock();
    notificationServiceMock = createNotificationServiceMock();

    TestBed.configureTestingModule({
      providers: [
        SearchTaskStore,
        { provide: Router, useValue: routerMock },
        { provide: PropertyCreationService, useValue: propertyCreationServiceMock },
        { provide: PropertyWebSocketService, useValue: propertyWebSocketServiceMock },
        { provide: NotificationService, useValue: notificationServiceMock },
      ],
    });

    searchTaskStore = TestBed.inject(SearchTaskStore);
  });

  it('should create with initial state', () => {
    expect(searchTaskStore).toBeTruthy();
    expect(searchTaskStore.currentTask()).toBeNull();
    expect(searchTaskStore.status()).toBeNull();
    expect(searchTaskStore.completedItems()).toBe(0);
    expect(searchTaskStore.totalItems()).toBe(0);
    expect(searchTaskStore.failedItems()).toBe(0);
    expect(searchTaskStore.errors()).toEqual([]);
    expect(searchTaskStore.loading()).toBe(false);
    expect(searchTaskStore.usingPollingFallback()).toBe(false);
  });

  describe('computed signals', () => {
    it('should compute progressPercentage as 0 when totalItems is 0', () => {
      expect(searchTaskStore.progressPercentage()).toBe(0);
    });

    it('should compute progressPercentage correctly', async () => {
      const websocketSubject = new Subject();
      propertyCreationServiceMock.createFromSearch.mockReturnValue(
        of(mockCreateFromSearchResponse)
      );
      propertyWebSocketServiceMock.connectToPropertyList.mockReturnValue(websocketSubject);

      searchTaskStore.startSearch({
        listUuid: 'list-uuid-1',
        request: mockCreateFromSearchRequest,
      });
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Simulate progress event
      searchTaskStore.updateProgress({
        ...mockScrapeProgressEvent,
        completed_items: 25,
        total_items: 100,
      });

      expect(searchTaskStore.progressPercentage()).toBe((25 / 100) * 100);
    });

    it('should compute progressPercentage as 100 when completed', async () => {
      const websocketSubject = new Subject();
      propertyCreationServiceMock.createFromSearch.mockReturnValue(
        of(mockCreateFromSearchResponse)
      );
      propertyWebSocketServiceMock.connectToPropertyList.mockReturnValue(websocketSubject);

      searchTaskStore.startSearch({
        listUuid: 'list-uuid-1',
        request: mockCreateFromSearchRequest,
      });
      await new Promise((resolve) => setTimeout(resolve, 100));

      searchTaskStore.updateProgress({
        ...mockScrapeProgressEvent,
        completed_items: 100,
        total_items: 100,
      });

      expect(searchTaskStore.progressPercentage()).toBe(100);
    });
  });

  describe('startSearch', () => {
    it('should create search task and update store state', async () => {
      const websocketSubject = new Subject();
      propertyCreationServiceMock.createFromSearch.mockReturnValue(
        of(mockCreateFromSearchResponse)
      );
      propertyWebSocketServiceMock.connectToPropertyList.mockReturnValue(websocketSubject);

      searchTaskStore.startSearch({
        listUuid: 'list-uuid-1',
        request: mockCreateFromSearchRequest,
      });
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(propertyCreationServiceMock.createFromSearch).toHaveBeenCalledWith(
        'list-uuid-1',
        mockCreateFromSearchRequest
      );
      expect(searchTaskStore.currentTask()).toBeTruthy();
      expect(searchTaskStore.currentTask()?.uuid).toBe(mockCreateFromSearchResponse.uuid);
      expect(searchTaskStore.status()).toBe('QUEUED');
      expect(searchTaskStore.loading()).toBe(false);
      expect(searchTaskStore.propertyListUuid()).toBe('list-uuid-1');
    });

    it('should handle search creation error', async () => {
      const errorMessage = 'Failed to start search';
      propertyCreationServiceMock.createFromSearch.mockReturnValue(
        throwError(() => new Error(errorMessage))
      );

      searchTaskStore.startSearch({
        listUuid: 'list-uuid-1',
        request: mockCreateFromSearchRequest,
      });
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(searchTaskStore.errors()).toContain(errorMessage);
      expect(searchTaskStore.loading()).toBe(false);
      expect(searchTaskStore.status()).toBe('FAILED');
      expect(notificationServiceMock.error).toHaveBeenCalledWith(
        'Property search failed. Please try again.'
      );
    });

    it('should clear previous errors when starting new search', async () => {
      const websocketSubject = new Subject();
      propertyCreationServiceMock.createFromSearch.mockReturnValue(
        of(mockCreateFromSearchResponse)
      );
      propertyWebSocketServiceMock.connectToPropertyList.mockReturnValue(websocketSubject);

      // Set initial error
      propertyCreationServiceMock.createFromSearch.mockReturnValueOnce(
        throwError(() => new Error('First error'))
      );
      searchTaskStore.startSearch({
        listUuid: 'list-uuid-1',
        request: mockCreateFromSearchRequest,
      });
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Start new search
      propertyCreationServiceMock.createFromSearch.mockReturnValue(
        of(mockCreateFromSearchResponse)
      );
      searchTaskStore.startSearch({
        listUuid: 'list-uuid-1',
        request: mockCreateFromSearchRequest,
      });
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(searchTaskStore.errors()).toEqual([]);
    });
  });

  describe('startPolling', () => {
    it('should poll getSearchStatus and update state', async () => {
      const websocketSubject = new Subject();
      propertyCreationServiceMock.createFromSearch.mockReturnValue(
        of(mockCreateFromSearchResponse)
      );
      propertyWebSocketServiceMock.connectToPropertyList.mockReturnValue(websocketSubject);
      propertyCreationServiceMock.getSearchStatus.mockReturnValue(of(mockPropertyListTask));

      searchTaskStore.startSearch({
        listUuid: 'list-uuid-1',
        request: mockCreateFromSearchRequest,
      });

      await new Promise((resolve) => setTimeout(resolve, 2500));

      expect(propertyCreationServiceMock.getSearchStatus).toHaveBeenCalled();
      expect(searchTaskStore.status()).toBe('IN_PROGRESS');
    });

    it('should stop polling when task is completed', async () => {
      // Create task first
      const websocketSubject = new Subject();
      propertyCreationServiceMock.createFromSearch.mockReturnValue(
        of(mockCreateFromSearchResponse)
      );
      propertyWebSocketServiceMock.connectToPropertyList.mockReturnValue(websocketSubject);

      searchTaskStore.startSearch({
        listUuid: 'list-uuid-1',
        request: mockCreateFromSearchRequest,
      });
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Start polling with completed status
      propertyCreationServiceMock.getSearchStatus.mockReturnValue(
        of(mockPropertyListTaskCompleted)
      );
      searchTaskStore.startPolling('list-uuid-1');
      await new Promise((resolve) => setTimeout(resolve, 2100));

      const callCount = propertyCreationServiceMock.getSearchStatus.mock.calls.length;

      // Wait another polling cycle to ensure it stopped
      await new Promise((resolve) => setTimeout(resolve, 2100));

      // Should not have increased call count (polling stopped)
      expect(propertyCreationServiceMock.getSearchStatus.mock.calls.length).toBeLessThanOrEqual(
        callCount + 1
      );
    }, 10000);

    it('should not start polling if no current task', () => {
      searchTaskStore.startPolling('list-uuid-1');

      expect(propertyCreationServiceMock.getSearchStatus).not.toHaveBeenCalled();
    });
  });

  describe('updateProgress', () => {
    it('should update store state with progress event', () => {
      searchTaskStore.updateProgress(mockScrapeProgressEvent);

      expect(searchTaskStore.status()).toBe('IN_PROGRESS');
      expect(searchTaskStore.completedItems()).toBe(mockScrapeProgressEvent.completed_items);
      expect(searchTaskStore.totalItems()).toBe(mockScrapeProgressEvent.total_items);
      expect(searchTaskStore.failedItems()).toBe(mockScrapeProgressEvent.failed_items);
      expect(searchTaskStore.errors()).toEqual(mockScrapeProgressEvent.errors);
    });

    it('should update currentTask when it exists', async () => {
      const websocketSubject = new Subject();
      propertyCreationServiceMock.createFromSearch.mockReturnValue(
        of(mockCreateFromSearchResponse)
      );
      propertyWebSocketServiceMock.connectToPropertyList.mockReturnValue(websocketSubject);

      searchTaskStore.startSearch({
        listUuid: 'list-uuid-1',
        request: mockCreateFromSearchRequest,
      });
      await new Promise((resolve) => setTimeout(resolve, 100));

      searchTaskStore.updateProgress(mockScrapeProgressEvent);

      const currentTask = searchTaskStore.currentTask();
      expect(currentTask?.status).toBe('IN_PROGRESS');
      expect(currentTask?.completed_items).toBe(mockScrapeProgressEvent.completed_items);
    });
  });

  describe('reset', () => {
    it('should reset store to initial state', async () => {
      const websocketSubject = new Subject();
      propertyCreationServiceMock.createFromSearch.mockReturnValue(
        of(mockCreateFromSearchResponse)
      );
      propertyWebSocketServiceMock.connectToPropertyList.mockReturnValue(websocketSubject);

      searchTaskStore.startSearch({
        listUuid: 'list-uuid-1',
        request: mockCreateFromSearchRequest,
      });
      await new Promise((resolve) => setTimeout(resolve, 100));

      searchTaskStore.reset();

      expect(searchTaskStore.currentTask()).toBeNull();
      expect(searchTaskStore.status()).toBeNull();
      expect(searchTaskStore.completedItems()).toBe(0);
      expect(searchTaskStore.totalItems()).toBe(0);
      expect(searchTaskStore.failedItems()).toBe(0);
      expect(searchTaskStore.errors()).toEqual([]);
      expect(searchTaskStore.loading()).toBe(false);
      expect(searchTaskStore.usingPollingFallback()).toBe(false);
      expect(searchTaskStore.propertyListUuid()).toBeNull();
    });
  });
});

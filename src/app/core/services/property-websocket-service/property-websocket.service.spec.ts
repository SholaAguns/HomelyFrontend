import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PropertyWebSocketService } from './property-websocket.service';
import { WebSocketService } from '../websocket.service';
import { of, throwError } from 'rxjs';
import { mockScrapeProgressEvent } from '../../../shared/mocks/models/property-models.mock';

describe('PropertyWebSocketService', () => {
  let propertyWebSocketService: PropertyWebSocketService;
  let webSocketServiceMock: {
    connect: ReturnType<typeof vi.fn>;
    disconnect: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    webSocketServiceMock = {
      connect: vi.fn(),
      disconnect: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        PropertyWebSocketService,
        { provide: WebSocketService, useValue: webSocketServiceMock },
      ],
    });

    propertyWebSocketService = TestBed.inject(PropertyWebSocketService);
  });

  it('should be created', () => {
    expect(propertyWebSocketService).toBeTruthy();
  });

  describe('connectToPropertyList', () => {
    it('should connect to property_list channel with propertyListUuid', async () => {
      const websocketData = {
        type: 'scrape_progress',
        data: mockScrapeProgressEvent,
      };

      webSocketServiceMock.connect.mockReturnValue(of(websocketData));

      return new Promise<void>((resolve) => {
        propertyWebSocketService.connectToPropertyList('list-uuid-1').subscribe({
          next: (event) => {
            expect(event).toEqual(mockScrapeProgressEvent);
            expect(webSocketServiceMock.connect).toHaveBeenCalledWith('property-list/list-uuid-1/');
            resolve();
          },
        });
      });
    });

    it('should map websocket data to ScrapeProgressEvent', async () => {
      const websocketData = {
        type: 'scrape_progress',
        data: mockScrapeProgressEvent,
      };

      webSocketServiceMock.connect.mockReturnValue(of(websocketData));

      return new Promise<void>((resolve) => {
        propertyWebSocketService.connectToPropertyList('list-uuid-1').subscribe({
          next: (event) => {
            expect(event.uuid).toBe(mockScrapeProgressEvent.uuid);
            expect(event.status).toBe(mockScrapeProgressEvent.status);
            expect(event.completed_items).toBe(mockScrapeProgressEvent.completed_items);
            expect(event.total_items).toBe(mockScrapeProgressEvent.total_items);
            resolve();
          },
        });
      });
    });

    it('should handle unknown message types gracefully', async () => {
      const websocketData = {
        type: 'unknown_type',
        payload: {},
      };

      webSocketServiceMock.connect.mockReturnValue(of(websocketData));

      return new Promise<void>((resolve, reject) => {
        propertyWebSocketService.connectToPropertyList('list-uuid-1').subscribe({
          next: () => {
            // Should not emit
            reject(new Error('Should not emit for unknown message type'));
          },
          error: () => {
            // Error is caught and converted to EMPTY
            resolve();
          },
          complete: () => {
            // EMPTY completes immediately
            resolve();
          },
        });
      });
    });

    it('should handle websocket errors', async () => {
      const error = new Error('WebSocket connection failed');
      webSocketServiceMock.connect.mockReturnValue(throwError(() => error));

      return new Promise<void>((resolve, reject) => {
        propertyWebSocketService.connectToPropertyList('list-uuid-1').subscribe({
          next: () => {
            reject(new Error('Should not emit on error'));
          },
          error: () => {
            // Error is caught and converted to EMPTY
            resolve();
          },
          complete: () => {
            // EMPTY completes immediately
            resolve();
          },
        });
      });
    });
  });

  describe('subscribeToPropertyList', () => {
    it('should subscribe to service_update events', async () => {
      const websocketData = {
        type: 'service_update',
        service: 'crime',
        status: 'COMPLETE',
        property_id: 'prop-1',
        data: { total: 10 },
      };

      webSocketServiceMock.connect.mockReturnValue(of(websocketData));

      return new Promise<void>((resolve) => {
        propertyWebSocketService.subscribeToPropertyList('list-uuid-1').subscribe({
          next: (event) => {
            expect(event.type).toBe('service_update');
            expect(event.service).toBe('crime');
            expect(event.property_id).toBe('prop-1');
            expect(webSocketServiceMock.connect).toHaveBeenCalledWith('property-list/list-uuid-1/');
            resolve();
          },
        });
      });
    });

    it('should subscribe to stage2_complete events', async () => {
      const websocketData = {
        type: 'stage2_complete',
        property_id: 'prop-1',
        progress: {
          total: 5,
          complete: 5,
          in_progress: 0,
          failed: 0,
          pending: 0,
        },
      };

      webSocketServiceMock.connect.mockReturnValue(of(websocketData));

      return new Promise<void>((resolve) => {
        propertyWebSocketService.subscribeToPropertyList('list-uuid-1').subscribe({
          next: (event) => {
            expect(event.type).toBe('stage2_complete');
            expect(event.property_id).toBe('prop-1');
            resolve();
          },
        });
      });
    });

    it('should filter out non-context events', async () => {
      const websocketData = {
        type: 'scrape_progress',
        data: {},
      };

      webSocketServiceMock.connect.mockReturnValue(of(websocketData));

      return new Promise<void>((resolve, reject) => {
        propertyWebSocketService.subscribeToPropertyList('list-uuid-1').subscribe({
          next: () => {
            reject(new Error('Should not emit for scrape_progress'));
          },
          complete: () => {
            resolve();
          },
        });
      });
    });
  });

  describe('disconnect', () => {
    it('should call disconnect on WebSocketService', () => {
      propertyWebSocketService.disconnect();

      expect(webSocketServiceMock.disconnect).toHaveBeenCalled();
    });
  });
});

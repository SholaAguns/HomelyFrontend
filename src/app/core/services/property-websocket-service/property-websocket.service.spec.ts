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
        payload: mockScrapeProgressEvent,
      };

      webSocketServiceMock.connect.mockReturnValue(of(websocketData));

      return new Promise<void>((resolve) => {
        propertyWebSocketService.connectToPropertyList('list-uuid-1').subscribe({
          next: (event) => {
            expect(event).toEqual(mockScrapeProgressEvent);
            expect(webSocketServiceMock.connect).toHaveBeenCalledWith('property_list.list-uuid-1');
            resolve();
          },
        });
      });
    });

    it('should map websocket data to ScrapeProgressEvent', async () => {
      const websocketData = {
        type: 'scrape_progress',
        payload: mockScrapeProgressEvent,
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

  describe('disconnect', () => {
    it('should call disconnect on WebSocketService', () => {
      propertyWebSocketService.disconnect();

      expect(webSocketServiceMock.disconnect).toHaveBeenCalled();
    });
  });
});

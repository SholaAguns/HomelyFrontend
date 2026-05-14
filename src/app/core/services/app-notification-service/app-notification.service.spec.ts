import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { firstValueFrom, of } from 'rxjs';
import { AppNotificationService } from './app-notification.service';
import { ApiService } from '../api-service/api.service';
import { AppNotification } from '../../../shared/models/project-models';
import { createApiServiceMock } from '../../../shared/mocks/api-service.mock';
import { mockAppNotification } from '../../../shared/mocks/models/project-sharing-models.mock';

class MockWebSocket {
  static instances: MockWebSocket[] = [];
  onmessage: ((e: MessageEvent) => void) | null = null;
  onclose: (() => void) | null = null;
  close = vi.fn(() => {
    if (this.onclose) this.onclose();
  });
  send = vi.fn();

  constructor(public url: string) {
    MockWebSocket.instances.push(this);
  }
}

describe('AppNotificationService', () => {
  let service: AppNotificationService;
  let apiMock: ReturnType<typeof createApiServiceMock>;

  beforeEach(() => {
    MockWebSocket.instances = [];
    vi.stubGlobal('WebSocket', MockWebSocket);

    apiMock = createApiServiceMock();
    TestBed.configureTestingModule({
      providers: [AppNotificationService, { provide: ApiService, useValue: apiMock }],
    });
    service = TestBed.inject(AppNotificationService);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('connect', () => {
    it('should open a WebSocket connection to the notifications endpoint', () => {
      service.connect();
      expect(MockWebSocket.instances.length).toBe(1);
      expect(MockWebSocket.instances[0].url).toContain('/notifications/');
    });

    it('should not open a second socket if already connected', () => {
      service.connect();
      service.connect();
      expect(MockWebSocket.instances.length).toBe(1);
    });

    it('should emit notification when socket receives a valid message', async () => {
      service.connect();
      const ws = MockWebSocket.instances[0];

      const emitted: AppNotification[] = [];
      service.incoming$.subscribe((n) => emitted.push(n));

      const event = {
        data: JSON.stringify({ type: 'notification', payload: mockAppNotification }),
      } as MessageEvent;
      ws.onmessage!(event);

      expect(emitted).toHaveLength(1);
      expect(emitted[0]).toEqual(mockAppNotification);
    });

    it('should ignore malformed socket messages', () => {
      service.connect();
      const ws = MockWebSocket.instances[0];
      const emitted: AppNotification[] = [];
      service.incoming$.subscribe((n) => emitted.push(n));

      ws.onmessage!({ data: 'not-json' } as MessageEvent);
      expect(emitted).toHaveLength(0);
    });

    it('should ignore messages with wrong type', () => {
      service.connect();
      const ws = MockWebSocket.instances[0];
      const emitted: AppNotification[] = [];
      service.incoming$.subscribe((n) => emitted.push(n));

      ws.onmessage!({ data: JSON.stringify({ type: 'ping' }) } as MessageEvent);
      expect(emitted).toHaveLength(0);
    });
  });

  describe('disconnect', () => {
    it('should close the socket and allow reconnecting', () => {
      service.connect();
      const ws = MockWebSocket.instances[0];
      service.disconnect();
      expect(ws.close).toHaveBeenCalled();

      service.connect();
      expect(MockWebSocket.instances.length).toBe(2);
    });

    it('should do nothing when not connected', () => {
      expect(() => service.disconnect()).not.toThrow();
    });
  });

  describe('getAll', () => {
    it('should GET all notifications', async () => {
      apiMock.get.mockReturnValue(of([mockAppNotification]));
      const result = await firstValueFrom(service.getAll());
      expect(result).toEqual([mockAppNotification]);
      expect(apiMock.get).toHaveBeenCalledWith('property/notifications/');
    });
  });

  describe('getUnreadCount', () => {
    it('should GET unread count', async () => {
      apiMock.get.mockReturnValue(of({ count: 3 }));
      const result = await firstValueFrom(service.getUnreadCount());
      expect(result).toEqual({ count: 3 });
      expect(apiMock.get).toHaveBeenCalledWith('property/notifications/unread-count/');
    });
  });

  describe('markRead', () => {
    it('should POST to mark a notification read', async () => {
      const updated = { ...mockAppNotification, is_read: true };
      apiMock.post.mockReturnValue(of(updated));
      const result = await firstValueFrom(service.markRead('notif-uuid-1'));
      expect(result).toEqual(updated);
      expect(apiMock.post).toHaveBeenCalledWith('property/notifications/notif-uuid-1/read/', {});
    });
  });

  describe('markAllRead', () => {
    it('should POST to mark all notifications read', async () => {
      apiMock.post.mockReturnValue(of(undefined));
      await firstValueFrom(service.markAllRead());
      expect(apiMock.post).toHaveBeenCalledWith('property/notifications/read-all/', {});
    });
  });
});

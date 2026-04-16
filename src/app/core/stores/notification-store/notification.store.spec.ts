import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { of } from 'rxjs';
import { NotificationStore } from './notification.store';
import { AppNotificationService } from '../../services/app-notification-service/app-notification.service';
import { createAppNotificationServiceMock } from '../../../shared/mocks/app-notification-service.mock';
import {
  mockAppNotification,
  mockAppNotificationRead,
} from '../../../shared/mocks/models/project-sharing-models.mock';

describe('NotificationStore', () => {
  let store: InstanceType<typeof NotificationStore>;
  let svcMock: ReturnType<typeof createAppNotificationServiceMock>;

  beforeEach(() => {
    svcMock = createAppNotificationServiceMock();
    TestBed.configureTestingModule({
      providers: [NotificationStore, { provide: AppNotificationService, useValue: svcMock }],
    });
    store = TestBed.inject(NotificationStore);
  });

  it('should initialise with empty state', () => {
    expect(store.notifications()).toEqual([]);
    expect(store.unreadCount()).toBe(0);
    expect(store.isConnected()).toBe(false);
  });

  describe('connect', () => {
    it('should call svc.connect and set isConnected', async () => {
      svcMock.getAll.mockReturnValue(of([]));
      svcMock.getUnreadCount.mockReturnValue(of({ count: 0 }));
      store.connect('token');
      await new Promise((r) => setTimeout(r, 50));
      expect(svcMock.connect).toHaveBeenCalledWith('token');
      expect(store.isConnected()).toBe(true);
    });

    it('should load initial notifications and unread count', async () => {
      svcMock.getAll.mockReturnValue(of([mockAppNotification]));
      svcMock.getUnreadCount.mockReturnValue(of({ count: 1 }));
      store.connect('token');
      await new Promise((r) => setTimeout(r, 50));
      expect(store.notifications()).toEqual([mockAppNotification]);
      expect(store.unreadCount()).toBe(1);
    });

    it('should prepend incoming WS notifications and increment unread count', async () => {
      svcMock.getAll.mockReturnValue(of([]));
      svcMock.getUnreadCount.mockReturnValue(of({ count: 0 }));
      store.connect('token');
      await new Promise((r) => setTimeout(r, 50));

      svcMock._subject.next(mockAppNotification);
      await new Promise((r) => setTimeout(r, 10));

      expect(store.notifications()[0]).toEqual(mockAppNotification);
      expect(store.unreadCount()).toBe(1);
    });
  });

  describe('disconnect', () => {
    it('should call svc.disconnect and reset state', async () => {
      svcMock.getAll.mockReturnValue(of([mockAppNotification]));
      svcMock.getUnreadCount.mockReturnValue(of({ count: 1 }));
      store.connect('token');
      await new Promise((r) => setTimeout(r, 50));

      store.disconnect();
      expect(svcMock.disconnect).toHaveBeenCalled();
      expect(store.notifications()).toEqual([]);
      expect(store.unreadCount()).toBe(0);
      expect(store.isConnected()).toBe(false);
    });
  });

  describe('markRead', () => {
    it('should mark a notification as read and decrement unread count', async () => {
      svcMock.getAll.mockReturnValue(of([mockAppNotification]));
      svcMock.getUnreadCount.mockReturnValue(of({ count: 1 }));
      store.connect('token');
      await new Promise((r) => setTimeout(r, 50));

      svcMock.markRead.mockReturnValue(of({ ...mockAppNotification, is_read: true }));
      store.markRead(mockAppNotification.uuid);
      await new Promise((r) => setTimeout(r, 50));

      expect(store.notifications()[0].is_read).toBe(true);
      expect(store.unreadCount()).toBe(0);
    });

    it('should not decrement below zero', async () => {
      svcMock.getAll.mockReturnValue(of([mockAppNotificationRead]));
      svcMock.getUnreadCount.mockReturnValue(of({ count: 0 }));
      store.connect('token');
      await new Promise((r) => setTimeout(r, 50));

      svcMock.markRead.mockReturnValue(of(mockAppNotificationRead));
      store.markRead(mockAppNotificationRead.uuid);
      await new Promise((r) => setTimeout(r, 50));

      expect(store.unreadCount()).toBe(0);
    });
  });

  describe('markAllRead', () => {
    it('should mark all notifications as read and set unread count to 0', async () => {
      svcMock.getAll.mockReturnValue(
        of([mockAppNotification, { ...mockAppNotification, uuid: 'notif-2' }])
      );
      svcMock.getUnreadCount.mockReturnValue(of({ count: 2 }));
      store.connect('token');
      await new Promise((r) => setTimeout(r, 50));

      svcMock.markAllRead.mockReturnValue(of(undefined));
      store.markAllRead();
      await new Promise((r) => setTimeout(r, 50));

      expect(store.notifications().every((n) => n.is_read)).toBe(true);
      expect(store.unreadCount()).toBe(0);
    });
  });

  describe('unreadNotifications computed', () => {
    it('should return only unread notifications', async () => {
      svcMock.getAll.mockReturnValue(of([mockAppNotification, mockAppNotificationRead]));
      svcMock.getUnreadCount.mockReturnValue(of({ count: 1 }));
      store.connect('token');
      await new Promise((r) => setTimeout(r, 50));

      expect(store.unreadNotifications()).toHaveLength(1);
      expect(store.unreadNotifications()[0].is_read).toBe(false);
    });
  });
});

import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  let notificationService: NotificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [NotificationService]
    });

    notificationService = TestBed.inject(NotificationService);
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should be created', () => {
    expect(notificationService).toBeTruthy();
  });

  it('should initialize with empty notifications', () => {
    expect(notificationService.notifications()).toEqual([]);
  });

  describe('show', () => {
    it('should add notification with default type and duration', () => {
      notificationService.show('Test message');

      const notifications = notificationService.notifications();
      expect(notifications.length).toBe(1);
      expect(notifications[0].message).toBe('Test message');
      expect(notifications[0].type).toBe('info');
      expect(notifications[0].duration).toBe(5000);
      expect(notifications[0].id).toBeTruthy();
    });

    it('should add notification with custom type and duration', () => {
      notificationService.show('Error message', 'error', 3000);

      const notifications = notificationService.notifications();
      expect(notifications[0].type).toBe('error');
      expect(notifications[0].duration).toBe(3000);
    });

    it('should auto-remove notification after duration', () => {
      notificationService.show('Test message', 'info', 1000);
      expect(notificationService.notifications().length).toBe(1);

      vi.advanceTimersByTime(1000);
      expect(notificationService.notifications().length).toBe(0);
    });

    it('should not auto-remove notification when duration is 0', () => {
      notificationService.show('Persistent message', 'info', 0);
      expect(notificationService.notifications().length).toBe(1);

      vi.advanceTimersByTime(10000);
      expect(notificationService.notifications().length).toBe(1);
    });

    it('should generate unique IDs for notifications', () => {
      notificationService.show('Message 1');
      notificationService.show('Message 2');

      const notifications = notificationService.notifications();
      expect(notifications[0].id).not.toBe(notifications[1].id);
    });
  });

  describe('success', () => {
    it('should add success notification with default duration', () => {
      notificationService.success('Success message');

      const notifications = notificationService.notifications();
      expect(notifications[0].type).toBe('success');
      expect(notifications[0].message).toBe('Success message');
      expect(notifications[0].duration).toBe(5000);
    });

    it('should add success notification with custom duration', () => {
      notificationService.success('Success message', 2000);

      const notifications = notificationService.notifications();
      expect(notifications[0].duration).toBe(2000);
    });
  });

  describe('error', () => {
    it('should add error notification with default duration', () => {
      notificationService.error('Error message');

      const notifications = notificationService.notifications();
      expect(notifications[0].type).toBe('error');
      expect(notifications[0].message).toBe('Error message');
      expect(notifications[0].duration).toBe(5000);
    });

    it('should add error notification with custom duration', () => {
      notificationService.error('Error message', 3000);

      const notifications = notificationService.notifications();
      expect(notifications[0].duration).toBe(3000);
    });
  });

  describe('warning', () => {
    it('should add warning notification with default duration', () => {
      notificationService.warning('Warning message');

      const notifications = notificationService.notifications();
      expect(notifications[0].type).toBe('warning');
      expect(notifications[0].message).toBe('Warning message');
      expect(notifications[0].duration).toBe(5000);
    });

    it('should add warning notification with custom duration', () => {
      notificationService.warning('Warning message', 4000);

      const notifications = notificationService.notifications();
      expect(notifications[0].duration).toBe(4000);
    });
  });

  describe('info', () => {
    it('should add info notification with default duration', () => {
      notificationService.info('Info message');

      const notifications = notificationService.notifications();
      expect(notifications[0].type).toBe('info');
      expect(notifications[0].message).toBe('Info message');
      expect(notifications[0].duration).toBe(5000);
    });

    it('should add info notification with custom duration', () => {
      notificationService.info('Info message', 6000);

      const notifications = notificationService.notifications();
      expect(notifications[0].duration).toBe(6000);
    });
  });

  describe('remove', () => {
    it('should remove notification by id', () => {
      notificationService.show('Message 1', 'info', 0);
      notificationService.show('Message 2', 'info', 0);

      const notifications = notificationService.notifications();
      const idToRemove = notifications[0].id;

      notificationService.remove(idToRemove);

      const remainingNotifications = notificationService.notifications();
      expect(remainingNotifications.length).toBe(1);
      expect(remainingNotifications[0].message).toBe('Message 2');
    });

    it('should not throw when removing non-existent id', () => {
      notificationService.show('Message 1', 'info', 0);

      expect(() => notificationService.remove('non-existent-id')).not.toThrow();
      expect(notificationService.notifications().length).toBe(1);
    });
  });

  describe('clear', () => {
    it('should remove all notifications', () => {
      notificationService.show('Message 1', 'info', 0);
      notificationService.show('Message 2', 'error', 0);
      notificationService.show('Message 3', 'success', 0);

      expect(notificationService.notifications().length).toBe(3);

      notificationService.clear();

      expect(notificationService.notifications().length).toBe(0);
    });

    it('should handle clearing empty notifications', () => {
      expect(() => notificationService.clear()).not.toThrow();
      expect(notificationService.notifications().length).toBe(0);
    });
  });
});

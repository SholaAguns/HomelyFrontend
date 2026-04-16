import { vi } from 'vitest';
import { signal } from '@angular/core';

export function createNotificationStoreMock() {
  return {
    notifications: signal([]),
    unreadCount: signal(0),
    isConnected: signal(false),
    unreadNotifications: signal([]),
    connect: vi.fn(),
    disconnect: vi.fn(),
    markRead: vi.fn(),
    markAllRead: vi.fn(),
  };
}

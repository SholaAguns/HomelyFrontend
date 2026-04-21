import { vi } from 'vitest';
import { Subject } from 'rxjs';
import { AppNotification } from '../models/project-models';

export function createAppNotificationServiceMock() {
  const incoming$ = new Subject<AppNotification>();
  return {
    incoming$: incoming$.asObservable(),
    _subject: incoming$,
    connect: vi.fn(),
    disconnect: vi.fn(),
    getAll: vi.fn(),
    getUnreadCount: vi.fn(),
    markRead: vi.fn(),
    markAllRead: vi.fn(),
  };
}

import { vi } from 'vitest';

export function createNotificationServiceMock() {
  return {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
    show: vi.fn(),
    remove: vi.fn(),
    clear: vi.fn(),
  };
}

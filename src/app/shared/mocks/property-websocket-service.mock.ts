import { vi } from 'vitest';

/**
 * Creates a mock PropertyWebSocketService for testing
 *
 * @returns Mock PropertyWebSocketService object
 */
export function createPropertyWebSocketServiceMock() {
  return {
    connectToPropertyList: vi.fn(),
    disconnect: vi.fn(),
  };
}

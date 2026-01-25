import { vi } from 'vitest';

/**
 * Creates a mock ApiService for testing components that use ApiService
 *
 * @returns Mock ApiService object with common HTTP methods
 */
export function createApiServiceMock() {
  return {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn()
  };
}

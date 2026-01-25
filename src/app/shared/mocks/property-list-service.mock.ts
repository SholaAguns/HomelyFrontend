import { vi } from 'vitest';

/**
 * Creates a mock PropertyListService for testing components that use PropertyListService
 *
 * @returns Mock PropertyListService object with all service methods
 */
export function createPropertyListServiceMock() {
  return {
    getAll: vi.fn(),
    getByUuid: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    activate: vi.fn()
  };
}

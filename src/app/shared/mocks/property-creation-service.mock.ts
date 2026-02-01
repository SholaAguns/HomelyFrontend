import { vi } from 'vitest';

/**
 * Creates a mock PropertyCreationService for testing
 *
 * @returns Mock PropertyCreationService object
 */
export function createPropertyCreationServiceMock() {
  return {
    createFromSearch: vi.fn(),
    getSearchStatus: vi.fn(),
  };
}

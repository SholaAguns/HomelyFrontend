import { vi } from 'vitest';

/**
 * Creates a mock ActivatedRoute for testing components that use route.parent parameters
 */
export function createActivatedRouteWithParentMock(parentUuid: string | null = 'test-uuid-1') {
  return {
    parent: {
      snapshot: {
        paramMap: {
          get: vi.fn().mockReturnValue(parentUuid),
        },
      },
    },
  };
}

/**
 * Creates a mock ActivatedRoute with nested parent for testing components
 * that access route.parent.parent.snapshot
 */
export function createActivatedRouteWithNestedParentMock(
  parentUuid: string | null = 'test-uuid-1'
) {
  return {
    parent: {
      parent: {
        snapshot: {
          paramMap: {
            get: vi.fn().mockReturnValue(parentUuid),
          },
        },
      },
    },
  };
}

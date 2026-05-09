import { vi } from 'vitest';
import { of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

/**
 * Creates a mock Router for testing Angular components that use Router
 *
 * @returns Mock Router object with common methods
 */
export function createRouterMock() {
  return {
    navigate: vi.fn(),
    events: of(),
    createUrlTree: vi.fn(),
    serializeUrl: vi.fn(),
  };
}

/**
 * Creates a mock ActivatedRoute for testing Angular components that use routing
 *
 * The ActivatedRoute mock includes:
 * - params: Observable of route parameters
 * - snapshot: Current route snapshot with params, queryParams, etc.
 *
 * @returns Mock ActivatedRoute object
 */
export function createActivatedRouteMock() {
  return {
    params: of({}),
    snapshot: {
      params: {},
      queryParams: {},
      data: {},
      url: [],
      outlet: 'primary',
      routeConfig: null,
      root: {} as any,
      parent: null,
      firstChild: null,
      children: [],
      pathFromRoot: [],
      paramMap: { get: vi.fn().mockReturnValue(null) },
      queryParamMap: { get: vi.fn().mockReturnValue(null) },
    },
  };
}

import { vi } from 'vitest';
import { signal } from '@angular/core';

/**
 * Creates a mock AuthStore for testing Angular components that depend on AuthStore
 *
 * The mock includes all AuthStore signals and methods:
 * - Signals: user, accessToken, refreshToken, loading, error, isAuthenticated
 * - Methods: login, register, logout, initializeFromStorage
 *
 * All signals are writable so they can be updated in tests to simulate different states
 *
 * @example
 * ```typescript
 * const mockAuthStore = createAuthStoreMock();
 *
 * // Simulate authenticated state
 * mockAuthStore.isAuthenticated.set(true);
 * mockAuthStore.user.set({ email: 'test@example.com', ... });
 *
 * // Simulate loading state
 * mockAuthStore.loading.set(true);
 *
 * // Verify method calls
 * expect(mockAuthStore.login).toHaveBeenCalledWith(credentials);
 * ```
 *
 * @returns Mock AuthStore object with signals and methods
 */
export function createAuthStoreMock() {
  return {
    // Signals - all writable for test control
    user: signal(null),
    accessToken: signal(null),
    refreshToken: signal(null),
    loading: signal(false),
    error: signal(null),
    isAuthenticated: signal(false),

    // Methods - all mocked with vi.fn()
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    initializeFromStorage: vi.fn()
  };
}

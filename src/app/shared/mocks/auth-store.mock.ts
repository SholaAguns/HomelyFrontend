import { vi } from 'vitest';
import { signal } from '@angular/core';

export function createAuthStoreMock() {
  return {
    user: signal(null),
    loading: signal(false),
    error: signal(null),
    isAuthenticated: signal(false),

    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    initialize: vi.fn(),
  };
}

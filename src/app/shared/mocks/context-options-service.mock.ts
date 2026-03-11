import { vi } from 'vitest';

export function createContextOptionsServiceMock() {
  return {
    getByPropertyList: vi.fn(),
    update: vi.fn(),
  };
}

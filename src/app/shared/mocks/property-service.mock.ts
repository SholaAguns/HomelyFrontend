import { vi } from 'vitest';

export function createPropertyServiceMock() {
  return {
    getAll: vi.fn(),
    getByUuid: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    runStage2: vi.fn(),
    runStage3: vi.fn(),
    rerunServices: vi.fn(),
    createFromInput: vi.fn(),
  };
}

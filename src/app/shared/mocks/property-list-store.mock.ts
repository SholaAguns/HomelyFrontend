import { vi } from 'vitest';
import { signal } from '@angular/core';

export function createPropertyListStoreMock() {
  return {
    load: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    activate: vi.fn(),
    select: vi.fn(),
    entities: signal({}),
    ids: signal([]),
    selectedId: signal<string | null>(null),
    all: signal([]),
    selected: signal(null),
    count: signal(0),
    activeLists: signal([]),
    loading: signal(false),
    error: signal<string | null>(null)
  };
}

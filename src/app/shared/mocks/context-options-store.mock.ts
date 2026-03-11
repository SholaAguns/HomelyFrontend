import { vi, vi as vitest } from 'vitest';
import { signal, computed } from '@angular/core';

export function createContextOptionsStoreMock() {
  const entitiesSignal = signal<Record<string, any>>({});

  return {
    load: vi.fn(),
    save: vi.fn(),
    entities: entitiesSignal,
    loading: signal(false),
    saving: signal(false),
    error: signal<string | null>(null),
    getByPropertyList: computed(
      () => (propertyListUuid: string) => entitiesSignal()[propertyListUuid] ?? null
    ),
  };
}

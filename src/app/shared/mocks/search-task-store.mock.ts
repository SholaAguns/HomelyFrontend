import { signal } from '@angular/core';
import { vi } from 'vitest';
import { PropertyListTask, TaskStatus } from '../models/property-models';

export function createSearchTaskStoreMock() {
  return {
    currentTask: signal<PropertyListTask | null>(null),
    status: signal<TaskStatus | null>(null),
    completedItems: signal<number>(0),
    totalItems: signal<number>(0),
    failedItems: signal<number>(0),
    errors: signal<string[]>([]),
    loading: signal<boolean>(false),
    usingPollingFallback: signal<boolean>(false),
    propertyListUuid: signal<string | null>(null),
    progressPercentage: signal<number>(0),
    startSearch: vi.fn(),
    startPolling: vi.fn(),
    updateProgress: vi.fn(),
    reset: vi.fn(),
  };
}

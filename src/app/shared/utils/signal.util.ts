import { Signal, WritableSignal, computed, signal, effect, isDevMode } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';

/**
 * Creates a signal from an Observable with a required initial value
 */
export function toSignalWithDefault<T>(observable: Observable<T>, initialValue: T): Signal<T> {
  return toSignal(observable, { initialValue });
}

/**
 * Creates a computed signal that derives from multiple signals
 */
export function computedFrom<T, U>(
  sources: Signal<T>[],
  computation: (...values: T[]) => U
): Signal<U> {
  return computed(() => computation(...sources.map((source) => source())));
}

/**
 * Creates a writable signal with validation
 */
export function signalWithValidation<T>(
  initialValue: T,
  validator: (value: T) => boolean
): WritableSignal<T> {
  const internalSignal = signal(initialValue);

  return {
    ...internalSignal,
    set: (value: T) => {
      if (validator(value)) {
        internalSignal.set(value);
      }
    },
    update: (updateFn: (value: T) => T) => {
      const newValue = updateFn(internalSignal());
      if (validator(newValue)) {
        internalSignal.set(newValue);
      }
    },
  } as WritableSignal<T>;
}

/**
 * Creates a derived signal that applies a transform function
 */
export function mapSignal<T, U>(source: Signal<T>, transform: (value: T) => U): Signal<U> {
  return computed(() => transform(source()));
}

/**
 * Creates a signal that filters values based on a predicate
 */
export function filterSignal<T>(
  source: Signal<T>,
  predicate: (value: T) => boolean,
  fallback: T
): Signal<T> {
  return computed(() => {
    const value = source();
    return predicate(value) ? value : fallback;
  });
}

/**
 * Creates an effect that logs signal changes for debugging
 */
export function debugSignal<T>(signalToDebug: Signal<T>, label?: string): void {
  effect(() => {
    const value = signalToDebug();
    if (isDevMode()) {
      console.log(`[Signal${label ? ` ${label}` : ''}]:`, value);
    }
  });
}

/**
 * Combines multiple signals into a single signal containing an array
 */
export function combineSignals<T>(...signals: Signal<T>[]): Signal<T[]> {
  return computed(() => signals.map((signalItem) => signalItem()));
}

/**
 * Creates a toggle signal with true/false state
 */
export function toggleSignal(initialValue = false) {
  const toggleValue = signal(initialValue);

  return {
    value: toggleValue.asReadonly(),
    toggle: () => toggleValue.update((value) => !value),
    setTrue: () => toggleValue.set(true),
    setFalse: () => toggleValue.set(false),
    set: (value: boolean) => toggleValue.set(value),
  };
}

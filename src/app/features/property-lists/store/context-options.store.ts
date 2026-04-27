import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, exhaustMap, catchError, EMPTY } from 'rxjs';
import { ContextOptionsService } from '../../../core/services/context-options-service/context-options.service';
import { NotificationService } from '../../../core/services/notification-service/notification.service';
import {
  ContextOptions,
  UpdateContextOptionsDto,
} from '../../../shared/models/context-options.models';
import { AppError } from '../../../shared/models/error-models';

type ContextOptionsState = {
  entities: Record<string, ContextOptions>;
  loading: boolean;
  saving: boolean;
  error: string | null;
};

const initialState: ContextOptionsState = {
  entities: {},
  loading: false,
  saving: false,
  error: null,
};

export const ContextOptionsStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ entities }) => ({
    getByPropertyList: computed(
      () => (propertyListUuid: string) => entities()[propertyListUuid] ?? null
    ),
  })),
  withMethods(
    (
      store,
      contextOptionsService = inject(ContextOptionsService),
      notificationService = inject(NotificationService)
    ) => ({
      load: rxMethod<string>(
        pipe(
          tap(() => patchState(store, { loading: true, error: null })),
          switchMap((propertyListUuid) =>
            contextOptionsService.getByPropertyList(propertyListUuid).pipe(
              tap((contextOptions) => {
                const entities = { ...store.entities(), [propertyListUuid]: contextOptions };
                patchState(store, { entities, loading: false });
              }),
              catchError((error: AppError) => {
                patchState(store, { error: error.message, loading: false });
                notificationService.error('Could not load context options.');
                return EMPTY;
              })
            )
          )
        )
      ),
      save: rxMethod<{ propertyListUuid: string; data: UpdateContextOptionsDto }>(
        pipe(
          tap(() => patchState(store, { saving: true, error: null })),
          exhaustMap(({ propertyListUuid, data }) =>
            contextOptionsService.update(propertyListUuid, data).pipe(
              tap((contextOptions) => {
                const entities = { ...store.entities(), [propertyListUuid]: contextOptions };
                patchState(store, { entities, saving: false });
              }),
              catchError((error: AppError) => {
                patchState(store, { error: error.message, saving: false });
                notificationService.error('Could not save context options. Please try again.');
                return EMPTY;
              })
            )
          )
        )
      ),
    })
  )
);

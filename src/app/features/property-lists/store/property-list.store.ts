import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, exhaustMap, catchError, EMPTY } from 'rxjs';
import { PropertyListService } from '../../../core/services/property-list-service/property-list.service';
import { NotificationService } from '../../../core/services/notification-service/notification.service';
import {
  PropertyList,
  CreatePropertyListDto,
  UpdatePropertyListDto,
  PropertyListDetail,
} from '../../../shared/models/property-list-models';
import { AppError } from '../../../shared/models/error-models';

type PropertyListState = {
  entities: Record<string, PropertyList>;
  detailEntities: Record<string, PropertyListDetail>;
  ids: string[];
  selectedId: string | null;
  loading: boolean;
  error: string | null;
};

const initialState: PropertyListState = {
  entities: {},
  detailEntities: {},
  ids: [],
  selectedId: null,
  loading: false,
  error: null,
};

export const PropertyListStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ entities, detailEntities, ids, selectedId }) => ({
    all: computed(() => ids().map((id) => entities()[id])),
    selected: computed(() => {
      const id = selectedId();
      return id ? entities()[id] : null;
    }),
    selectedDetail: computed(() => {
      const id = selectedId();
      return id ? detailEntities()[id] : null;
    }),
    count: computed(() => ids().length),
  })),
  withMethods(
    (
      store,
      service = inject(PropertyListService),
      notificationService = inject(NotificationService)
    ) => ({
      load: rxMethod<string | undefined>(
        pipe(
          tap(() => patchState(store, { loading: true, error: null })),
          switchMap((projectUuid) =>
            service.getAll(projectUuid).pipe(
              tap((lists) => {
                const entities = lists.reduce(
                  (accumulator, list) => ({ ...accumulator, [list.uuid]: list }),
                  {}
                );
                const ids = lists.map((list) => list.uuid);
                patchState(store, { entities, ids, loading: false });
              }),
              catchError((error: AppError) => {
                patchState(store, { error: error.message, loading: false });
                notificationService.error('Could not load your property lists.');
                return EMPTY;
              })
            )
          )
        )
      ),
      create: rxMethod<CreatePropertyListDto>(
        pipe(
          tap(() => patchState(store, { loading: true, error: null })),
          exhaustMap((data) =>
            service.create(data).pipe(
              tap((list) => {
                const entities = { ...store.entities(), [list.uuid]: list };
                const ids = [...store.ids(), list.uuid];
                patchState(store, { entities, ids, loading: false });
              }),
              catchError((error: AppError) => {
                patchState(store, { error: error.message, loading: false });
                notificationService.error('Could not create property list. Please try again.');
                return EMPTY;
              })
            )
          )
        )
      ),
      update: rxMethod<{ uuid: string; data: UpdatePropertyListDto }>(
        pipe(
          tap(() => patchState(store, { loading: true, error: null })),
          exhaustMap(({ uuid, data }) =>
            service.update(uuid, data).pipe(
              tap((list) => {
                const entities = { ...store.entities(), [list.uuid]: list };
                patchState(store, { entities, loading: false });
              }),
              catchError((error: AppError) => {
                patchState(store, { error: error.message, loading: false });
                notificationService.error('Could not update property list. Please try again.');
                return EMPTY;
              })
            )
          )
        )
      ),
      delete: rxMethod<string>(
        pipe(
          tap(() => patchState(store, { loading: true, error: null })),
          switchMap((uuid) =>
            service.delete(uuid).pipe(
              tap(() => {
                const entities = { ...store.entities() };
                delete entities[uuid];
                const ids = store.ids().filter((id) => id !== uuid);
                patchState(store, { entities, ids, loading: false });
              }),
              catchError((error: AppError) => {
                patchState(store, { error: error.message, loading: false });
                notificationService.error('Could not delete property list. Please try again.');
                return EMPTY;
              })
            )
          )
        )
      ),
      loadDetail: rxMethod<string>(
        pipe(
          tap(() => patchState(store, { loading: true, error: null })),
          switchMap((uuid) =>
            service.getByUuid(uuid).pipe(
              tap((detail) => {
                const detailEntities = { ...store.detailEntities(), [uuid]: detail };
                const { properties, ...entity } = detail;
                const entities = { ...store.entities(), [uuid]: entity };
                if (!store.ids().includes(uuid)) {
                  const ids = [...store.ids(), uuid];
                  patchState(store, { entities, detailEntities, ids, loading: false });
                } else {
                  patchState(store, { entities, detailEntities, loading: false });
                }
              }),
              catchError((error: AppError) => {
                patchState(store, { error: error.message, loading: false });
                notificationService.error('Could not load property list details.');
                return EMPTY;
              })
            )
          )
        )
      ),
      select: (uuid: string | null) => patchState(store, { selectedId: uuid }),
    })
  )
);

import { computed, inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, exhaustMap } from 'rxjs';
import { PropertyListService } from '../../../core/services/property-list.service';
import {
  PropertyList,
  CreatePropertyListDto,
  UpdatePropertyListDto,
  PropertyListDetail,
} from '../../../shared/models/property-list-models';

type PropertyListState = {
  entities: Record<string, PropertyList>;
  ids: string[];
  selectedId: string | null;
  loading: boolean;
  error: string | null;
};

const initialState: PropertyListState = {
  entities: {},
  ids: [],
  selectedId: null,
  loading: false,
  error: null,
};

export const PropertyListStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ entities, ids, selectedId }) => ({
    all: computed(() => ids().map((id) => entities()[id])),
    selected: computed(() => {
      const id = selectedId();
      return id ? entities()[id] : null;
    }),
    count: computed(() => ids().length),
    activeLists: computed(() =>
      ids()
        .map((id) => entities()[id])
        .filter((list) => list.state === 'ACTIVE')
    ),
  })),
  withMethods((store, service = inject(PropertyListService)) => ({
    load: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(() => service.getAll()),
        tap({
          next: (lists) => {
            const entities = lists.reduce(
              (acc, list) => ({ ...acc, [list.uuid]: list }),
              {}
            );
            const ids = lists.map((list) => list.uuid);
            patchState(store, { entities, ids, loading: false });
          },
          error: (error) =>
            patchState(store, { error: error.message, loading: false }),
        })
      )
    ),
    create: rxMethod<CreatePropertyListDto>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        exhaustMap((data) => service.create(data)),
        tap({
          next: (list) => {
            const entities = { ...store.entities(), [list.uuid]: list };
            const ids = [...store.ids(), list.uuid];
            patchState(store, { entities, ids, loading: false });
          },
          error: (error) =>
            patchState(store, { error: error.message, loading: false }),
        })
      )
    ),
    update: rxMethod<{ uuid: string; data: UpdatePropertyListDto }>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        exhaustMap(({ uuid, data }) => service.update(uuid, data)),
        tap({
          next: (list) => {
            const entities = { ...store.entities(), [list.uuid]: list };
            patchState(store, { entities, loading: false });
          },
          error: (error) =>
            patchState(store, { error: error.message, loading: false }),
        })
      )
    ),
    delete: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((uuid) =>
          service.delete(uuid).pipe(
            tap({
              next: () => {
                const entities = { ...store.entities() };
                delete entities[uuid];
                const ids = store.ids().filter((id) => id !== uuid);
                patchState(store, { entities, ids, loading: false });
              },
              error: (error) =>
                patchState(store, { error: error.message, loading: false }),
            })
          )
        )
      )
    ),
    activate: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((uuid) =>
          service.activate(uuid).pipe(
            tap({
              next: (result) => {
                const entity = store.entities()[uuid];
                if (entity) {
                  const updatedEntity = {
                    ...entity,
                    state: result.state as 'ACTIVE' | 'DRAFT',
                  };
                  const entities = { ...store.entities(), [uuid]: updatedEntity };
                  patchState(store, { entities, loading: false });
                }
              },
              error: (error) =>
                patchState(store, { error: error.message, loading: false }),
            })
          )
        )
      )
    ),
    select: (uuid: string | null) => patchState(store, { selectedId: uuid }),
  }))
);

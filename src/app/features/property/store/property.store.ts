import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, exhaustMap, catchError, EMPTY } from 'rxjs';
import { PropertyService } from '../../../core/services/property-service/property.service';
import {
  Property,
  CreatePropertyDto,
  UpdatePropertyDto,
  CreateFromInputRequest,
} from '../../../shared/models/property-models';

type PropertyState = {
  entities: Record<string, Property>;
  ids: string[];
  selectedId: string | null;
  loading: boolean;
  error: string | null;
};

const initialState: PropertyState = {
  entities: {},
  ids: [],
  selectedId: null,
  loading: false,
  error: null,
};

export const PropertyStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ entities, ids, selectedId }) => ({
    allEntities: computed(() => ids().map((id) => entities()[id])),
    selectedEntity: computed(() => {
      const id = selectedId();
      return id ? entities()[id] : null;
    }),
    count: computed(() => ids().length),
    propertiesByList: computed(
      () => (listId: string) =>
        ids()
          .map((id) => entities()[id])
          .filter((property) => listId in property.property_lists)
    ),
    propertiesByState: computed(
      () => (state: string) =>
        ids()
          .map((id) => entities()[id])
          .filter((property) => property.state === state)
    ),
  })),
  withMethods((store, propertyService = inject(PropertyService)) => ({
    load: rxMethod<string | undefined>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((propertyListUuid) =>
          propertyService.getAll(propertyListUuid).pipe(
            tap((properties) => {
              const entities = properties.reduce(
                (accumulator, property) => ({ ...accumulator, [property.uuid]: property }),
                {}
              );
              const ids = properties.map((property) => property.uuid);
              patchState(store, { entities, ids, loading: false });
            }),
            catchError((error) => {
              patchState(store, { error: error.message, loading: false });
              return EMPTY;
            })
          )
        )
      )
    ),
    create: rxMethod<CreatePropertyDto>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        exhaustMap((data) =>
          propertyService.create(data).pipe(
            tap((property) => {
              const entities = { ...store.entities(), [property.uuid]: property };
              const ids = [...store.ids(), property.uuid];
              patchState(store, { entities, ids, loading: false });
            }),
            catchError((error) => {
              patchState(store, { error: error.message, loading: false });
              return EMPTY;
            })
          )
        )
      )
    ),
    update: rxMethod<{ uuid: string; data: UpdatePropertyDto }>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        exhaustMap(({ uuid, data }) =>
          propertyService.update(uuid, data).pipe(
            tap((property) => {
              const entities = { ...store.entities(), [property.uuid]: property };
              patchState(store, { entities, loading: false });
            }),
            catchError((error) => {
              patchState(store, { error: error.message, loading: false });
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
          propertyService.delete(uuid).pipe(
            tap(() => {
              const entities = { ...store.entities() };
              delete entities[uuid];
              const ids = store.ids().filter((id) => id !== uuid);
              patchState(store, { entities, ids, loading: false });
            }),
            catchError((error) => {
              patchState(store, { error: error.message, loading: false });
              return EMPTY;
            })
          )
        )
      )
    ),
    createFromInput: rxMethod<CreateFromInputRequest>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        exhaustMap((request) =>
          propertyService.createFromInput(request).pipe(
            tap((response) => {
              if (response.property) {
                const entities = {
                  ...store.entities(),
                  [response.property.uuid]: response.property,
                };
                const ids = [...store.ids(), response.property.uuid];
                patchState(store, { entities, ids, loading: false });
              } else {
                patchState(store, { loading: false });
              }
            }),
            catchError((error) => {
              patchState(store, { error: error.message, loading: false });
              return EMPTY;
            })
          )
        )
      )
    ),
    runStage2: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((uuid) =>
          propertyService.runStage2(uuid).pipe(
            tap((result) => {
              const entity = store.entities()[uuid];
              if (entity) {
                const updatedEntity = { ...entity, state: result.state };
                const entities = { ...store.entities(), [uuid]: updatedEntity };
                patchState(store, { entities, loading: false });
              }
            }),
            catchError((error) => {
              patchState(store, { error: error.message, loading: false });
              return EMPTY;
            })
          )
        )
      )
    ),
    runStage3: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((uuid) =>
          propertyService.runStage3(uuid).pipe(
            tap((result) => {
              const entity = store.entities()[uuid];
              if (entity) {
                const updatedEntity = { ...entity, state: result.state };
                const entities = { ...store.entities(), [uuid]: updatedEntity };
                patchState(store, { entities, loading: false });
              }
            }),
            catchError((error) => {
              patchState(store, { error: error.message, loading: false });
              return EMPTY;
            })
          )
        )
      )
    ),
    select: (uuid: string | null) => patchState(store, { selectedId: uuid }),
    checkDuplicate: (externalId: string): Property | null => {
      const duplicateEntity = store
        .ids()
        .map((id) => store.entities()[id])
        .find((property) => property.external_id === externalId);
      return duplicateEntity || null;
    },
  }))
);

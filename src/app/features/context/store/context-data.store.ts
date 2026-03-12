import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, catchError, EMPTY } from 'rxjs';
import { ContextDataService } from '../../../core/services/context-data-service/context-data.service';
import { ContextData } from '../../../shared/models/context-data.models';

type ContextDataState = {
  entities: Record<string, ContextData>;
  byProperty: Record<string, string[]>;
  loading: Record<string, boolean>;
  error: Record<string, string | null>;
};

const initialState: ContextDataState = {
  entities: {},
  byProperty: {},
  loading: {},
  error: {},
};

export const ContextDataStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ entities, byProperty }) => ({
    forProperty: computed(() => (propertyId: string) => {
      const contextDataIds = byProperty()[propertyId] || [];
      return contextDataIds.map((id) => entities()[id]).filter(Boolean);
    }),

    progressFor: computed(() => (propertyId: string) => {
      const contextDataList = byProperty()[propertyId]?.map((id) => entities()[id]) || [];
      return {
        total: contextDataList.length,
        complete: contextDataList.filter((d) => d.status === 'COMPLETE').length,
        in_progress: contextDataList.filter((d) => d.status === 'IN_PROGRESS').length,
        failed: contextDataList.filter((d) => d.status === 'FAILED').length,
        pending: contextDataList.filter((d) => d.status === 'PENDING').length,
      };
    }),

    completedFor: computed(() => (propertyId: string) => {
      const contextDataIds = byProperty()[propertyId] || [];
      return contextDataIds.map((id) => entities()[id]).filter((d) => d.status === 'COMPLETE');
    }),

    failedFor: computed(() => (propertyId: string) => {
      const contextDataIds = byProperty()[propertyId] || [];
      return contextDataIds.map((id) => entities()[id]).filter((d) => d.status === 'FAILED');
    }),
  })),
  withMethods((store, contextDataService = inject(ContextDataService)) => {
    const loadMethod = rxMethod<string>(
      pipe(
        tap((propertyId) =>
          patchState(store, (state) => ({
            loading: { ...state.loading, [propertyId]: true },
            error: { ...state.error, [propertyId]: null },
          }))
        ),
        switchMap((propertyId) =>
          contextDataService.getContextData(propertyId).pipe(
            tap((contextDataList) => {
              const newEntities = contextDataList.reduce(
                (acc, item) => ({ ...acc, [item.id]: item }),
                {}
              );
              const contextDataIds = contextDataList.map((d) => d.id);
              patchState(store, (state) => ({
                entities: { ...state.entities, ...newEntities },
                byProperty: { ...state.byProperty, [propertyId]: contextDataIds },
                loading: { ...state.loading, [propertyId]: false },
              }));
            }),
            catchError((error) => {
              patchState(store, (state) => ({
                error: { ...state.error, [propertyId]: error.message },
                loading: { ...state.loading, [propertyId]: false },
              }));
              return EMPTY;
            })
          )
        )
      )
    );

    return {
      load: loadMethod,

      triggerStage2: rxMethod<string>(
        pipe(
          switchMap((propertyId) =>
            contextDataService.triggerStage2(propertyId).pipe(
              tap(() => {
                // Re-load to get PENDING records
                loadMethod(propertyId);
              }),
              catchError((error) => {
                patchState(store, (state) => ({
                  error: { ...state.error, [propertyId]: error.message },
                }));
                return EMPTY;
              })
            )
          )
        )
      ),

      updateService: (propertyId: string, contextData: ContextData) => {
        patchState(store, (state) => {
          const newEntities = { ...state.entities, [contextData.id]: contextData };

          const existingContextDataIds = state.byProperty[propertyId] || [];
          const updatedByProperty = {
            ...state.byProperty,
            [propertyId]: existingContextDataIds.includes(contextData.id)
              ? existingContextDataIds
              : [...existingContextDataIds, contextData.id],
          };

          return { entities: newEntities, byProperty: updatedByProperty };
        });
      },

      retry: rxMethod<{ propertyId: string; service: string }>(
        pipe(
          switchMap(({ propertyId, service: serviceName }) =>
            contextDataService.retryService(propertyId, serviceName).pipe(
              tap(() => loadMethod(propertyId)),
              catchError((error) => {
                patchState(store, (state) => ({
                  error: { ...state.error, [propertyId]: error.message },
                }));
                return EMPTY;
              })
            )
          )
        )
      ),
    };
  })
);

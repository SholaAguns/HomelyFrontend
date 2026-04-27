import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, exhaustMap, catchError, EMPTY } from 'rxjs';
import { RatingCriteriaService } from '../../../core/services/rating-criteria.service';
import { NotificationService } from '../../../core/services/notification-service/notification.service';
import {
  RatingCriteria,
  CreateRatingCriteriaDto,
  UpdateRatingCriteriaDto,
} from '../../../shared/models/rating-criteria.models';
import { AppError } from '../../../shared/models/error-models';

type RatingCriteriaState = {
  entities: Record<string, RatingCriteria>;
  list: RatingCriteria[];
  loading: boolean;
  saving: boolean;
  error: string | null;
};

const initialState: RatingCriteriaState = {
  entities: {},
  list: [],
  loading: false,
  saving: false,
  error: null,
};

export const RatingCriteriaStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ entities, list }) => ({
    getByUuid: computed(() => (uuid: string) => entities()[uuid] ?? null),
    allCriteria: computed(() => list()),
  })),
  withMethods(
    (
      store,
      ratingCriteriaService = inject(RatingCriteriaService),
      notificationService = inject(NotificationService)
    ) => ({
      loadAll: rxMethod<void>(
        pipe(
          tap(() => patchState(store, { loading: true, error: null })),
          switchMap(() =>
            ratingCriteriaService.getAll().pipe(
              tap((criteriaList) => {
                const entities = criteriaList.reduce(
                  (acc, criteria) => ({ ...acc, [criteria.uuid]: criteria }),
                  {}
                );
                patchState(store, { entities, list: criteriaList, loading: false });
              }),
              catchError((error: AppError) => {
                patchState(store, { error: error.message, loading: false });
                notificationService.error('Could not load rating criteria.');
                return EMPTY;
              })
            )
          )
        )
      ),
      loadById: rxMethod<string>(
        pipe(
          tap(() => patchState(store, { loading: true, error: null })),
          switchMap((uuid) =>
            ratingCriteriaService.getById(uuid).pipe(
              tap((criteria) => {
                const entities = { ...store.entities(), [uuid]: criteria };
                const existingIndex = store.list().findIndex((c) => c.uuid === uuid);
                const list =
                  existingIndex >= 0
                    ? [
                        ...store.list().slice(0, existingIndex),
                        criteria,
                        ...store.list().slice(existingIndex + 1),
                      ]
                    : [...store.list(), criteria];
                patchState(store, { entities, list, loading: false });
              }),
              catchError((error: AppError) => {
                patchState(store, { error: error.message, loading: false });
                notificationService.error('Could not load rating criteria.');
                return EMPTY;
              })
            )
          )
        )
      ),
      create: rxMethod<CreateRatingCriteriaDto>(
        pipe(
          tap(() => patchState(store, { saving: true, error: null })),
          exhaustMap((data) =>
            ratingCriteriaService.create(data).pipe(
              tap((criteria) => {
                const entities = { ...store.entities(), [criteria.uuid]: criteria };
                const list = [...store.list(), criteria];
                patchState(store, { entities, list, saving: false });
              }),
              catchError((error: AppError) => {
                patchState(store, { error: error.message, saving: false });
                notificationService.error('Could not create rating criteria. Please try again.');
                return EMPTY;
              })
            )
          )
        )
      ),
      update: rxMethod<{ uuid: string; data: UpdateRatingCriteriaDto }>(
        pipe(
          tap(() => patchState(store, { saving: true, error: null })),
          exhaustMap(({ uuid, data }) =>
            ratingCriteriaService.update(uuid, data).pipe(
              tap((criteria) => {
                const entities = { ...store.entities(), [uuid]: criteria };
                const list = store.list().map((c) => (c.uuid === uuid ? criteria : c));
                patchState(store, { entities, list, saving: false });
              }),
              catchError((error: AppError) => {
                patchState(store, { error: error.message, saving: false });
                notificationService.error('Could not update rating criteria. Please try again.');
                return EMPTY;
              })
            )
          )
        )
      ),
      delete: rxMethod<string>(
        pipe(
          tap(() => patchState(store, { saving: true, error: null })),
          exhaustMap((uuid) =>
            ratingCriteriaService.delete(uuid).pipe(
              tap(() => {
                const entities = { ...store.entities() };
                delete entities[uuid];
                const list = store.list().filter((c) => c.uuid !== uuid);
                patchState(store, { entities, list, saving: false });
              }),
              catchError((error: AppError) => {
                patchState(store, { error: error.message, saving: false });
                notificationService.error('Could not delete rating criteria. Please try again.');
                return EMPTY;
              })
            )
          )
        )
      ),
      copy: rxMethod<string>(
        pipe(
          tap(() => patchState(store, { saving: true, error: null })),
          exhaustMap((uuid) =>
            ratingCriteriaService.copy(uuid).pipe(
              tap((criteria) => {
                const entities = { ...store.entities(), [criteria.uuid]: criteria };
                const list = [...store.list(), criteria];
                patchState(store, { entities, list, saving: false });
              }),
              catchError((error: AppError) => {
                patchState(store, { error: error.message, saving: false });
                notificationService.error('Could not copy rating criteria. Please try again.');
                return EMPTY;
              })
            )
          )
        )
      ),
    })
  )
);

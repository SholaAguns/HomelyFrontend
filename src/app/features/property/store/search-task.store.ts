import { computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, catchError, EMPTY, interval, takeUntil, Subject } from 'rxjs';
import { PropertyCreationService } from '../../../core/services/property-creation-service/property-creation.service';
import {
  PropertyListTask,
  CreateFromSearchRequest,
  ScrapeProgressEvent,
  TaskStatus,
} from '../../../shared/models/property-models';

type SearchTaskState = {
  currentTask: PropertyListTask | null;
  status: TaskStatus | null;
  completedItems: number;
  totalItems: number;
  failedItems: number;
  errors: string[];
  loading: boolean;
  usingPollingFallback: boolean;
  propertyListUuid: string | null;
};

const initialState: SearchTaskState = {
  currentTask: null,
  status: null,
  completedItems: 0,
  totalItems: 0,
  failedItems: 0,
  errors: [],
  loading: false,
  usingPollingFallback: false,
  propertyListUuid: null,
};

export const SearchTaskStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ completedItems, totalItems }) => ({
    progressPercentage: computed(() => {
      const total = totalItems();
      const completed = completedItems();
      return total > 0 ? Math.round((completed / total) * 100) : 0;
    }),
  })),
  withMethods(
    (store, propertyCreationService = inject(PropertyCreationService), router = inject(Router)) => {
      const stopPolling$ = new Subject<void>();

      const methods = {
        startSearch: rxMethod<{ listUuid: string; request: CreateFromSearchRequest }>(
          pipe(
            tap(() => patchState(store, { loading: true, errors: [] })),
            switchMap(({ listUuid, request }) =>
              propertyCreationService.createFromSearch(listUuid, request).pipe(
                tap((response) => {
                  const task: PropertyListTask = {
                    uuid: response.uuid,
                    property_list: response.property_list,
                    task_type: response.task_type,
                    status: response.status,
                    celery_task_id: response.celery_task_id,
                    total_items: response.total_items,
                    completed_items: response.completed_items,
                    failed_items: response.failed_items,
                    progress_percentage: response.progress_percentage,
                    errors: response.errors,
                    metadata: response.metadata,
                    websocket_url: response.websocket_url,
                    created_at: response.created_at,
                    updated_at: response.updated_at,
                  };

                  patchState(store, {
                    currentTask: task,
                    status: response.status,
                    completedItems: response.completed_items,
                    totalItems: response.total_items,
                    failedItems: response.failed_items,
                    errors: response.errors,
                    loading: false,
                    propertyListUuid: response.property_list_uuid,
                    usingPollingFallback: true,
                  });

                  // Start polling for updates
                  methods.startPolling(listUuid);

                  // Navigate to property list detail page
                  router.navigate(['/lists', response.property_list_uuid]);
                }),
                catchError((error) => {
                  patchState(store, {
                    errors: [error.message],
                    loading: false,
                    status: 'FAILED',
                  });
                  return EMPTY;
                })
              )
            )
          )
        ),

        startPolling(listUuid: string): void {
          const taskUuid = store.currentTask()?.uuid;
          if (!taskUuid) return;

          stopPolling$.next();

          interval(2000)
            .pipe(
              takeUntil(stopPolling$),
              switchMap(() => propertyCreationService.getSearchStatus(listUuid, taskUuid)),
              tap((task) => {
                patchState(store, {
                  currentTask: task,
                  status: task.status,
                  completedItems: task.completed_items,
                  totalItems: task.total_items,
                  failedItems: task.failed_items,
                  errors: task.errors,
                });

                if (task.status === 'COMPLETED' || task.status === 'FAILED') {
                  stopPolling$.next();
                }
              }),
              catchError((error) => {
                console.error('Polling error:', error);
                return EMPTY;
              })
            )
            .subscribe();
        },

        updateProgress(event: ScrapeProgressEvent): void {
          patchState(store, {
            status: event.status,
            completedItems: event.completed_items,
            totalItems: event.total_items,
            failedItems: event.failed_items,
            errors: event.errors,
          });

          const currentTask = store.currentTask();
          if (currentTask) {
            patchState(store, {
              currentTask: {
                ...currentTask,
                status: event.status,
                completed_items: event.completed_items,
                total_items: event.total_items,
                failed_items: event.failed_items,
                progress_percentage: event.progress_percentage,
                errors: event.errors,
              },
            });
          }

          if (event.status === 'COMPLETED' || event.status === 'FAILED') {
            stopPolling$.next();
          }
        },

        reset(): void {
          stopPolling$.next();
          patchState(store, initialState);
        },
      };

      return methods;
    }
  )
);

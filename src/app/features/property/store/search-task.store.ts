import { computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import {
  pipe,
  switchMap,
  tap,
  catchError,
  EMPTY,
  interval,
  takeUntil,
  Subject,
  forkJoin,
} from 'rxjs';
import { PropertyCreationService } from '../../../core/services/property-creation-service/property-creation.service';
import { NotificationService } from '../../../core/services/notification-service/notification.service';
import {
  PropertyListTask,
  CreateFromSearchRequest,
  ScrapeProgressEvent,
  TaskStatus,
} from '../../../shared/models/property-models';
import { AppError } from '../../../shared/models/error-models';

type SearchTaskState = {
  tasks: PropertyListTask[];
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
  tasks: [],
  status: null,
  completedItems: 0,
  totalItems: 0,
  failedItems: 0,
  errors: [],
  loading: false,
  usingPollingFallback: false,
  propertyListUuid: null,
};

function aggregateProgress(tasks: PropertyListTask[]): {
  status: TaskStatus | null;
  completedItems: number;
  totalItems: number;
  failedItems: number;
  errors: string[];
} {
  if (!tasks.length)
    return { status: null, completedItems: 0, totalItems: 0, failedItems: 0, errors: [] };
  const allDone = tasks.every((t) => t.status === 'COMPLETED' || t.status === 'FAILED');
  const allFailed = tasks.every((t) => t.status === 'FAILED');
  const anyInProgress = tasks.some((t) => t.status === 'IN_PROGRESS');
  let status: TaskStatus;
  if (allDone) {
    status = allFailed ? 'FAILED' : 'COMPLETED';
  } else {
    status = anyInProgress ? 'IN_PROGRESS' : 'QUEUED';
  }
  return {
    status,
    completedItems: tasks.reduce((sum, t) => sum + t.completed_items, 0),
    totalItems: tasks.reduce((sum, t) => sum + t.total_items, 0),
    failedItems: tasks.reduce((sum, t) => sum + t.failed_items, 0),
    errors: tasks.flatMap((t) => t.errors),
  };
}

export const SearchTaskStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ completedItems, totalItems, tasks }) => ({
    progressPercentage: computed(() => {
      const total = totalItems();
      const completed = completedItems();
      return total > 0 ? Math.round((completed / total) * 100) : 0;
    }),
    currentTask: computed(() => tasks()[0] ?? null),
  })),
  withMethods(
    (
      store,
      propertyCreationService = inject(PropertyCreationService),
      router = inject(Router),
      notificationService = inject(NotificationService)
    ) => {
      const stopPolling$ = new Subject<void>();

      const methods = {
        startSearch: rxMethod<{ listUuid: string; request: CreateFromSearchRequest }>(
          pipe(
            tap(() => patchState(store, { loading: true, errors: [] })),
            switchMap(({ listUuid, request }) =>
              propertyCreationService.createFromSearch(listUuid, request).pipe(
                tap((response) => {
                  const tasks = response.tasks;
                  const aggregated = aggregateProgress(tasks);
                  const propertyListUuid = tasks[0]?.property_list ?? listUuid;

                  patchState(store, {
                    tasks,
                    status: aggregated.status,
                    completedItems: aggregated.completedItems,
                    totalItems: aggregated.totalItems,
                    failedItems: aggregated.failedItems,
                    errors: aggregated.errors,
                    loading: false,
                    propertyListUuid,
                    usingPollingFallback: true,
                  });

                  methods.startPolling(listUuid);
                  router.navigate(['/lists', propertyListUuid]);
                }),
                catchError((error: AppError) => {
                  patchState(store, {
                    errors: [error.message],
                    loading: false,
                    status: 'FAILED',
                  });
                  notificationService.error('Property search failed. Please try again.');
                  return EMPTY;
                })
              )
            )
          )
        ),

        startPolling(listUuid: string): void {
          const taskUuids = store
            .tasks()
            .map((t) => t.uuid)
            .filter(Boolean);
          if (!taskUuids.length) return;

          stopPolling$.next();

          interval(2000)
            .pipe(
              takeUntil(stopPolling$),
              switchMap(() =>
                forkJoin(
                  taskUuids.map((uuid) => propertyCreationService.getSearchStatus(listUuid, uuid))
                )
              ),
              tap((freshTasks) => {
                const updatedTasks = store
                  .tasks()
                  .map((t) => freshTasks.find((ft) => ft.uuid === t.uuid) ?? t);
                const aggregated = aggregateProgress(updatedTasks);
                patchState(store, {
                  tasks: updatedTasks,
                  status: aggregated.status,
                  completedItems: aggregated.completedItems,
                  totalItems: aggregated.totalItems,
                  failedItems: aggregated.failedItems,
                  errors: aggregated.errors,
                });
                if (aggregated.status === 'COMPLETED' || aggregated.status === 'FAILED') {
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
          const tasks = store.tasks();
          const updatedTasks = tasks.map((t, i) => {
            const matches = event.task_uuid ? t.uuid === event.task_uuid : i === 0;
            if (!matches) return t;
            return {
              ...t,
              status: event.status,
              completed_items: event.completed_items,
              total_items: event.total_items,
              failed_items: event.failed_items,
              progress_percentage: event.progress_percentage,
              errors: event.errors,
            };
          });

          const aggregated = aggregateProgress(updatedTasks);
          patchState(store, {
            tasks: updatedTasks,
            status: aggregated.status,
            completedItems: aggregated.completedItems,
            totalItems: aggregated.totalItems,
            failedItems: aggregated.failedItems,
            errors: aggregated.errors,
          });

          if (aggregated.status === 'COMPLETED' || aggregated.status === 'FAILED') {
            stopPolling$.next();
          }
        },

        reset(): void {
          stopPolling$.next();
          patchState(store, initialState);
        },

        initializeFromTasks(
          listUuid: string,
          scrapingTasks: { uuid: string; status: string; source: string }[]
        ): void {
          const tasks: PropertyListTask[] = scrapingTasks.map((t) => ({
            uuid: t.uuid,
            property_list: listUuid,
            task_type: 'SCRAPE_SEARCH',
            status: t.status as TaskStatus,
            celery_task_id: null,
            total_items: 0,
            completed_items: 0,
            failed_items: 0,
            progress_percentage: 0,
            errors: [],
            metadata: { source: t.source },
            websocket_url: '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }));

          const aggregated = aggregateProgress(tasks);
          patchState(store, {
            tasks,
            status: aggregated.status,
            completedItems: 0,
            totalItems: 0,
            failedItems: 0,
            errors: [],
            propertyListUuid: listUuid,
            usingPollingFallback: true,
          });

          methods.startPolling(listUuid);
        },

        initializeFromListCreation(
          listUuid: string,
          taskUuid: string,
          taskStatus: TaskStatus
        ): void {
          const task: PropertyListTask = {
            uuid: taskUuid,
            property_list: listUuid,
            task_type: 'SCRAPE_SEARCH',
            status: taskStatus,
            celery_task_id: null,
            total_items: 0,
            completed_items: 0,
            failed_items: 0,
            progress_percentage: 0,
            errors: [],
            metadata: {},
            websocket_url: '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          patchState(store, {
            tasks: [task],
            status: taskStatus,
            completedItems: 0,
            totalItems: 0,
            failedItems: 0,
            errors: [],
            propertyListUuid: listUuid,
            usingPollingFallback: true,
          });

          methods.startPolling(listUuid);
        },
      };

      return methods;
    }
  )
);

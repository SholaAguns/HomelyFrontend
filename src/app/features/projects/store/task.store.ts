import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, exhaustMap, catchError, EMPTY } from 'rxjs';
import { TaskService } from '../../../core/services/task-service/task.service';
import { NotificationService } from '../../../core/services/notification-service/notification.service';
import {
  Task,
  TaskListDetail,
  CreateTaskListDto,
  UpdateTaskListDto,
  CreateTaskDto,
  UpdateTaskDto,
} from '../../../shared/models/task-models';
import { AppError } from '../../../shared/models/error-models';

type TaskState = {
  taskLists: Record<string, TaskListDetail>;
  taskListIds: string[];
  loading: boolean;
  error: string | null;
};

const initialState: TaskState = {
  taskLists: {},
  taskListIds: [],
  loading: false,
  error: null,
};

export const TaskStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ taskLists, taskListIds }) => ({
    allTaskLists: computed(() => taskListIds().map((id) => taskLists()[id])),
  })),
  withMethods(
    (
      store,
      taskService = inject(TaskService),
      notificationService = inject(NotificationService)
    ) => ({
      loadForProject: rxMethod<string>(
        pipe(
          tap(() => patchState(store, { loading: true, error: null })),
          switchMap((projectUuid) =>
            taskService.getAllTaskLists(projectUuid).pipe(
              tap((taskLists) => {
                const taskListEntities: Record<string, TaskListDetail> = {};
                const taskListIds: string[] = [];
                taskLists.forEach((taskList) => {
                  taskListEntities[taskList.uuid] = taskList;
                  taskListIds.push(taskList.uuid);
                });
                patchState(store, { taskLists: taskListEntities, taskListIds, loading: false });
              }),
              catchError((error: AppError) => {
                patchState(store, { error: error.message, loading: false });
                notificationService.error('Could not load task lists.');
                return EMPTY;
              })
            )
          )
        )
      ),

      createTaskList: rxMethod<CreateTaskListDto>(
        pipe(
          exhaustMap((dto) =>
            taskService.createTaskList(dto).pipe(
              tap((newTaskList) => {
                patchState(store, {
                  taskLists: { ...store.taskLists(), [newTaskList.uuid]: newTaskList },
                  taskListIds: [...store.taskListIds(), newTaskList.uuid],
                });
                notificationService.success('Task list created.');
              }),
              catchError((error: AppError) => {
                notificationService.error('Could not create task list.');
                return EMPTY;
              })
            )
          )
        )
      ),

      updateTaskList: rxMethod<{ uuid: string; dto: UpdateTaskListDto }>(
        pipe(
          exhaustMap(({ uuid, dto }) =>
            taskService.updateTaskList(uuid, dto).pipe(
              tap((updatedTaskList) => {
                patchState(store, {
                  taskLists: { ...store.taskLists(), [uuid]: updatedTaskList },
                });
                notificationService.success('Task list updated.');
              }),
              catchError((error: AppError) => {
                notificationService.error('Could not update task list.');
                return EMPTY;
              })
            )
          )
        )
      ),

      deleteTaskList: rxMethod<string>(
        pipe(
          exhaustMap((uuid) =>
            taskService.deleteTaskList(uuid).pipe(
              tap(() => {
                const taskLists = { ...store.taskLists() };
                delete taskLists[uuid];
                patchState(store, {
                  taskLists,
                  taskListIds: store.taskListIds().filter((id) => id !== uuid),
                });
                notificationService.success('Task list deleted.');
              }),
              catchError((error: AppError) => {
                notificationService.error('Could not delete task list.');
                return EMPTY;
              })
            )
          )
        )
      ),

      createTask: rxMethod<CreateTaskDto>(
        pipe(
          exhaustMap((dto) =>
            taskService.createTask(dto).pipe(
              tap((newTask) => {
                const taskListUuid = newTask.task_list_uuid;
                const existingTaskList = store.taskLists()[taskListUuid];
                if (existingTaskList) {
                  const updatedTaskList: TaskListDetail = {
                    ...existingTaskList,
                    tasks: [...existingTaskList.tasks, newTask],
                    tasks_count: existingTaskList.tasks_count + 1,
                  };
                  patchState(store, {
                    taskLists: { ...store.taskLists(), [taskListUuid]: updatedTaskList },
                  });
                }
                notificationService.success('Task created.');
              }),
              catchError((error: AppError) => {
                notificationService.error('Could not create task.');
                return EMPTY;
              })
            )
          )
        )
      ),

      updateTask: rxMethod<{ uuid: string; taskListUuid: string; dto: UpdateTaskDto }>(
        pipe(
          exhaustMap(({ uuid, taskListUuid, dto }) =>
            taskService.updateTask(uuid, dto).pipe(
              tap((updatedTask) => {
                const existingTaskList = store.taskLists()[taskListUuid];
                if (existingTaskList) {
                  const updatedTaskList: TaskListDetail = {
                    ...existingTaskList,
                    tasks: existingTaskList.tasks.map((t: Task) =>
                      t.uuid === uuid ? updatedTask : t
                    ),
                  };
                  patchState(store, {
                    taskLists: { ...store.taskLists(), [taskListUuid]: updatedTaskList },
                  });
                }
              }),
              catchError((error: AppError) => {
                notificationService.error('Could not update task.');
                return EMPTY;
              })
            )
          )
        )
      ),

      deleteTask: rxMethod<{ uuid: string; taskListUuid: string }>(
        pipe(
          exhaustMap(({ uuid, taskListUuid }) =>
            taskService.deleteTask(uuid).pipe(
              tap(() => {
                const existingTaskList = store.taskLists()[taskListUuid];
                if (existingTaskList) {
                  const updatedTaskList: TaskListDetail = {
                    ...existingTaskList,
                    tasks: existingTaskList.tasks.filter((t: Task) => t.uuid !== uuid),
                    tasks_count: existingTaskList.tasks_count - 1,
                  };
                  patchState(store, {
                    taskLists: { ...store.taskLists(), [taskListUuid]: updatedTaskList },
                  });
                }
                notificationService.success('Task deleted.');
              }),
              catchError((error: AppError) => {
                notificationService.error('Could not delete task.');
                return EMPTY;
              })
            )
          )
        )
      ),

      clearTasks: () => patchState(store, initialState),
    })
  )
);

import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { of, throwError } from 'rxjs';
import { TaskStore } from './task.store';
import { TaskService } from '../../../core/services/task-service/task.service';
import { NotificationService } from '../../../core/services/notification-service/notification.service';
import { createTaskServiceMock } from '../../../shared/mocks/task-service.mock';
import { createNotificationServiceMock } from '../../../shared/mocks/notification-service.mock';
import {
  mockTask,
  mockTaskInProgress,
  mockTaskList,
  mockTaskListEmpty,
  mockCreateTaskListDto,
  mockUpdateTaskListDto,
  mockCreateTaskDto,
  mockUpdateTaskDto,
} from '../../../shared/mocks/models/task-models.mock';

describe('TaskStore', () => {
  let store: InstanceType<typeof TaskStore>;
  let taskServiceMock: ReturnType<typeof createTaskServiceMock>;
  let notificationServiceMock: ReturnType<typeof createNotificationServiceMock>;

  beforeEach(async () => {
    taskServiceMock = createTaskServiceMock();
    notificationServiceMock = createNotificationServiceMock();

    await TestBed.configureTestingModule({
      providers: [
        TaskStore,
        { provide: TaskService, useValue: taskServiceMock },
        { provide: NotificationService, useValue: notificationServiceMock },
      ],
    }).compileComponents();

    store = TestBed.inject(TaskStore);
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should be created with initial state', () => {
    expect(store).toBeTruthy();
    expect(store.taskLists()).toEqual({});
    expect(store.taskListIds()).toEqual([]);
    expect(store.loading()).toBe(false);
    expect(store.error()).toBeNull();
  });

  describe('computed allTaskLists', () => {
    it('should return task lists in id order', async () => {
      taskServiceMock.getAllTaskLists.mockReturnValue(of([mockTaskList, mockTaskListEmpty]));

      store.loadForProject('project-uuid-1');
      await new Promise((resolve) => setTimeout(resolve, 100));

      const allLists = store.allTaskLists();
      expect(allLists.length).toBe(2);
      expect(allLists[0].uuid).toBe(mockTaskList.uuid);
      expect(allLists[1].uuid).toBe(mockTaskListEmpty.uuid);
    });
  });

  describe('loadForProject', () => {
    it('should load task lists and update state on success', async () => {
      taskServiceMock.getAllTaskLists.mockReturnValue(of([mockTaskList]));

      store.loadForProject('project-uuid-1');
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(store.loading()).toBe(false);
      expect(store.error()).toBeNull();
      expect(store.taskListIds()).toContain(mockTaskList.uuid);
      expect(store.taskLists()[mockTaskList.uuid]).toEqual(mockTaskList);
      expect(taskServiceMock.getAllTaskLists).toHaveBeenCalledWith('project-uuid-1');
    });

    it('should show error notification and set error state on load failure', async () => {
      const error = new Error('Network error');
      taskServiceMock.getAllTaskLists.mockReturnValue(throwError(() => error));

      store.loadForProject('project-uuid-1');
      await new Promise((resolve) => setTimeout(resolve, 200));

      expect(store.loading()).toBe(false);
      expect(store.error()).toBe('Network error');
      expect(notificationServiceMock.error).toHaveBeenCalledWith('Could not load task lists.');
    });
  });

  describe('createTaskList', () => {
    it('should add new task list to state on success', async () => {
      taskServiceMock.createTaskList.mockReturnValue(of(mockTaskListEmpty));

      store.createTaskList(mockCreateTaskListDto);
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(store.taskListIds()).toContain(mockTaskListEmpty.uuid);
      expect(store.taskLists()[mockTaskListEmpty.uuid]).toEqual(mockTaskListEmpty);
      expect(notificationServiceMock.success).toHaveBeenCalledWith('Task list created.');
    });

    it('should show error notification on create task list failure', async () => {
      taskServiceMock.createTaskList.mockReturnValue(throwError(() => new Error('Failed')));

      store.createTaskList(mockCreateTaskListDto);
      await new Promise((resolve) => setTimeout(resolve, 200));

      expect(notificationServiceMock.error).toHaveBeenCalledWith('Could not create task list.');
    });
  });

  describe('updateTaskList', () => {
    beforeEach(async () => {
      taskServiceMock.getAllTaskLists.mockReturnValue(of([mockTaskList]));
      store.loadForProject('project-uuid-1');
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    it('should update task list in state on success', async () => {
      const updatedList = { ...mockTaskList, title: 'Updated Title' };
      taskServiceMock.updateTaskList.mockReturnValue(of(updatedList));

      store.updateTaskList({ uuid: mockTaskList.uuid, dto: mockUpdateTaskListDto });
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(store.taskLists()[mockTaskList.uuid].title).toBe('Updated Title');
      expect(notificationServiceMock.success).toHaveBeenCalledWith('Task list updated.');
    });

    it('should show error notification on update task list failure', async () => {
      taskServiceMock.updateTaskList.mockReturnValue(throwError(() => new Error('Failed')));

      store.updateTaskList({ uuid: mockTaskList.uuid, dto: mockUpdateTaskListDto });
      await new Promise((resolve) => setTimeout(resolve, 200));

      expect(notificationServiceMock.error).toHaveBeenCalledWith('Could not update task list.');
    });
  });

  describe('deleteTaskList', () => {
    beforeEach(async () => {
      taskServiceMock.getAllTaskLists.mockReturnValue(of([mockTaskList, mockTaskListEmpty]));
      store.loadForProject('project-uuid-1');
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    it('should remove task list from state on success', async () => {
      taskServiceMock.deleteTaskList.mockReturnValue(of(void 0));

      store.deleteTaskList(mockTaskList.uuid);
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(store.taskListIds()).not.toContain(mockTaskList.uuid);
      expect(store.taskLists()[mockTaskList.uuid]).toBeUndefined();
      expect(notificationServiceMock.success).toHaveBeenCalledWith('Task list deleted.');
    });

    it('should show error notification on delete task list failure', async () => {
      taskServiceMock.deleteTaskList.mockReturnValue(throwError(() => new Error('Failed')));

      store.deleteTaskList(mockTaskList.uuid);
      await new Promise((resolve) => setTimeout(resolve, 200));

      expect(store.taskListIds()).toContain(mockTaskList.uuid);
      expect(notificationServiceMock.error).toHaveBeenCalledWith('Could not delete task list.');
    });
  });

  describe('createTask', () => {
    beforeEach(async () => {
      taskServiceMock.getAllTaskLists.mockReturnValue(of([mockTaskListEmpty]));
      store.loadForProject('project-uuid-1');
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    it('should add task to correct task list on success', async () => {
      const newTask = { ...mockTask, task_list: mockTaskListEmpty.uuid };
      taskServiceMock.createTask.mockReturnValue(of(newTask));

      store.createTask({ ...mockCreateTaskDto, task_list_input: mockTaskListEmpty.uuid });
      await new Promise((resolve) => setTimeout(resolve, 100));

      const updatedList = store.taskLists()[mockTaskListEmpty.uuid];
      expect(updatedList.tasks).toContain(newTask);
      expect(updatedList.tasks_count).toBe(1);
      expect(notificationServiceMock.success).toHaveBeenCalledWith('Task created.');
    });

    it('should show error notification on create task failure', async () => {
      taskServiceMock.createTask.mockReturnValue(throwError(() => new Error('Failed')));

      store.createTask(mockCreateTaskDto);
      await new Promise((resolve) => setTimeout(resolve, 200));

      expect(notificationServiceMock.error).toHaveBeenCalledWith('Could not create task.');
    });
  });

  describe('updateTask', () => {
    beforeEach(async () => {
      taskServiceMock.getAllTaskLists.mockReturnValue(of([mockTaskList]));
      store.loadForProject('project-uuid-1');
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    it('should update task within its task list on success', async () => {
      const updatedTask = {
        ...mockTask,
        title: 'Updated Task Title',
        status: 'IN_PROGRESS' as const,
      };
      taskServiceMock.updateTask.mockReturnValue(of(updatedTask));

      store.updateTask({
        uuid: mockTask.uuid,
        taskListUuid: mockTaskList.uuid,
        dto: mockUpdateTaskDto,
      });
      await new Promise((resolve) => setTimeout(resolve, 100));

      const tasks = store.taskLists()[mockTaskList.uuid].tasks;
      const updated = tasks.find((t) => t.uuid === mockTask.uuid);
      expect(updated?.title).toBe('Updated Task Title');
      expect(updated?.status).toBe('IN_PROGRESS');
    });

    it('should show error notification on update task failure', async () => {
      taskServiceMock.updateTask.mockReturnValue(throwError(() => new Error('Failed')));

      store.updateTask({
        uuid: mockTask.uuid,
        taskListUuid: mockTaskList.uuid,
        dto: mockUpdateTaskDto,
      });
      await new Promise((resolve) => setTimeout(resolve, 200));

      expect(notificationServiceMock.error).toHaveBeenCalledWith('Could not update task.');
    });
  });

  describe('deleteTask', () => {
    beforeEach(async () => {
      taskServiceMock.getAllTaskLists.mockReturnValue(of([mockTaskList]));
      store.loadForProject('project-uuid-1');
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    it('should remove task from its task list on success', async () => {
      taskServiceMock.deleteTask.mockReturnValue(of(void 0));

      store.deleteTask({ uuid: mockTask.uuid, taskListUuid: mockTaskList.uuid });
      await new Promise((resolve) => setTimeout(resolve, 100));

      const tasks = store.taskLists()[mockTaskList.uuid].tasks;
      expect(tasks.find((t) => t.uuid === mockTask.uuid)).toBeUndefined();
      expect(store.taskLists()[mockTaskList.uuid].tasks_count).toBe(mockTaskList.tasks_count - 1);
      expect(notificationServiceMock.success).toHaveBeenCalledWith('Task deleted.');
    });

    it('should show error notification on delete task failure', async () => {
      taskServiceMock.deleteTask.mockReturnValue(throwError(() => new Error('Failed')));

      store.deleteTask({ uuid: mockTask.uuid, taskListUuid: mockTaskList.uuid });
      await new Promise((resolve) => setTimeout(resolve, 200));

      expect(notificationServiceMock.error).toHaveBeenCalledWith('Could not delete task.');
    });
  });

  describe('clearTasks', () => {
    it('should reset state to initial values', async () => {
      taskServiceMock.getAllTaskLists.mockReturnValue(of([mockTaskList]));
      store.loadForProject('project-uuid-1');
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(store.taskListIds().length).toBe(1);

      store.clearTasks();

      expect(store.taskLists()).toEqual({});
      expect(store.taskListIds()).toEqual([]);
      expect(store.loading()).toBe(false);
      expect(store.error()).toBeNull();
    });
  });
});

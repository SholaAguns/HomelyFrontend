import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { firstValueFrom } from 'rxjs';
import { of } from 'rxjs';
import { TaskService } from './task.service';
import { ApiService } from '../api-service/api.service';
import { createApiServiceMock } from '../../../shared/mocks/api-service.mock';
import {
  mockTask,
  mockTaskList,
  mockCreateTaskListDto,
  mockUpdateTaskListDto,
  mockCreateTaskDto,
  mockUpdateTaskDto,
} from '../../../shared/mocks/models/task-models.mock';

describe('TaskService', () => {
  let taskService: TaskService;
  let apiServiceMock: ReturnType<typeof createApiServiceMock>;

  beforeEach(() => {
    apiServiceMock = createApiServiceMock();

    TestBed.configureTestingModule({
      providers: [TaskService, { provide: ApiService, useValue: apiServiceMock }],
    });

    taskService = TestBed.inject(TaskService);
  });

  it('should be created', () => {
    expect(taskService).toBeTruthy();
  });

  describe('getAllTaskLists', () => {
    it('should call API get with project filter when projectUuid is provided', async () => {
      apiServiceMock.get.mockReturnValue(of([mockTaskList]));

      const response = await firstValueFrom(taskService.getAllTaskLists('project-uuid-1'));

      expect(apiServiceMock.get).toHaveBeenCalledWith(
        'property/task-lists/?project=project-uuid-1'
      );
      expect(response).toEqual([mockTaskList]);
    });

    it('should call API get without filter when no projectUuid provided', async () => {
      apiServiceMock.get.mockReturnValue(of([mockTaskList]));

      await firstValueFrom(taskService.getAllTaskLists());

      expect(apiServiceMock.get).toHaveBeenCalledWith('property/task-lists/');
    });
  });

  describe('getTaskList', () => {
    it('should call API get with task list uuid', async () => {
      apiServiceMock.get.mockReturnValue(of(mockTaskList));

      const response = await firstValueFrom(taskService.getTaskList('task-list-uuid-1'));

      expect(apiServiceMock.get).toHaveBeenCalledWith('property/task-lists/task-list-uuid-1/');
      expect(response).toEqual(mockTaskList);
    });
  });

  describe('createTaskList', () => {
    it('should call API post with create task list dto', async () => {
      apiServiceMock.post.mockReturnValue(of(mockTaskList));

      const response = await firstValueFrom(taskService.createTaskList(mockCreateTaskListDto));

      expect(apiServiceMock.post).toHaveBeenCalledWith(
        'property/task-lists/',
        mockCreateTaskListDto
      );
      expect(response).toEqual(mockTaskList);
    });
  });

  describe('updateTaskList', () => {
    it('should call API patch with uuid and update task list dto', async () => {
      const updatedList = { ...mockTaskList, ...mockUpdateTaskListDto };
      apiServiceMock.patch.mockReturnValue(of(updatedList));

      const response = await firstValueFrom(
        taskService.updateTaskList('task-list-uuid-1', mockUpdateTaskListDto)
      );

      expect(apiServiceMock.patch).toHaveBeenCalledWith(
        'property/task-lists/task-list-uuid-1/',
        mockUpdateTaskListDto
      );
      expect(response).toEqual(updatedList);
    });
  });

  describe('deleteTaskList', () => {
    it('should call API delete with task list uuid', async () => {
      apiServiceMock.delete.mockReturnValue(of(void 0));

      await firstValueFrom(taskService.deleteTaskList('task-list-uuid-1'));

      expect(apiServiceMock.delete).toHaveBeenCalledWith('property/task-lists/task-list-uuid-1/');
    });
  });

  describe('createTask', () => {
    it('should call API post with create task dto', async () => {
      apiServiceMock.post.mockReturnValue(of(mockTask));

      const response = await firstValueFrom(taskService.createTask(mockCreateTaskDto));

      expect(apiServiceMock.post).toHaveBeenCalledWith('property/tasks/', mockCreateTaskDto);
      expect(response).toEqual(mockTask);
    });
  });

  describe('updateTask', () => {
    it('should call API patch with uuid and update task dto', async () => {
      const updatedTask = { ...mockTask, ...mockUpdateTaskDto };
      apiServiceMock.patch.mockReturnValue(of(updatedTask));

      const response = await firstValueFrom(
        taskService.updateTask('task-uuid-1', mockUpdateTaskDto)
      );

      expect(apiServiceMock.patch).toHaveBeenCalledWith(
        'property/tasks/task-uuid-1/',
        mockUpdateTaskDto
      );
      expect(response).toEqual(updatedTask);
    });
  });

  describe('deleteTask', () => {
    it('should call API delete with task uuid', async () => {
      apiServiceMock.delete.mockReturnValue(of(void 0));

      await firstValueFrom(taskService.deleteTask('task-uuid-1'));

      expect(apiServiceMock.delete).toHaveBeenCalledWith('property/tasks/task-uuid-1/');
    });
  });
});

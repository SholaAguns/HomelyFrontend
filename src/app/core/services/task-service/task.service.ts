import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api-service/api.service';
import {
  TaskListDetail,
  Task,
  CreateTaskListDto,
  CreateTaskDto,
  UpdateTaskListDto,
  UpdateTaskDto,
} from '../../../shared/models/task-models';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private api = inject(ApiService);
  private readonly taskListEndpoint = 'property/task-lists/';
  private readonly taskEndpoint = 'property/tasks/';

  getAllTaskLists(projectUuid?: string): Observable<TaskListDetail[]> {
    const url = projectUuid
      ? `${this.taskListEndpoint}?project=${projectUuid}`
      : this.taskListEndpoint;
    return this.api.get<TaskListDetail[]>(url);
  }

  getTaskList(uuid: string): Observable<TaskListDetail> {
    return this.api.get<TaskListDetail>(`${this.taskListEndpoint}${uuid}/`);
  }

  createTaskList(data: CreateTaskListDto): Observable<TaskListDetail> {
    return this.api.post<TaskListDetail>(this.taskListEndpoint, data);
  }

  updateTaskList(uuid: string, data: UpdateTaskListDto): Observable<TaskListDetail> {
    return this.api.patch<TaskListDetail>(`${this.taskListEndpoint}${uuid}/`, data);
  }

  deleteTaskList(uuid: string): Observable<void> {
    return this.api.delete<void>(`${this.taskListEndpoint}${uuid}/`);
  }

  getAllTasks(taskListUuid?: string): Observable<Task[]> {
    const url = taskListUuid ? `${this.taskEndpoint}?task_list=${taskListUuid}` : this.taskEndpoint;
    return this.api.get<Task[]>(url);
  }

  getTask(uuid: string): Observable<Task> {
    return this.api.get<Task>(`${this.taskEndpoint}${uuid}/`);
  }

  createTask(data: CreateTaskDto): Observable<Task> {
    return this.api.post<Task>(this.taskEndpoint, data);
  }

  updateTask(uuid: string, data: UpdateTaskDto): Observable<Task> {
    return this.api.patch<Task>(`${this.taskEndpoint}${uuid}/`, data);
  }

  deleteTask(uuid: string): Observable<void> {
    return this.api.delete<void>(`${this.taskEndpoint}${uuid}/`);
  }
}

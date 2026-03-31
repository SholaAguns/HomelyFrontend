export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface TaskList {
  uuid: string;
  project: string;
  title: string;
  description: string;
  tasks_count: number;
  created_at: string;
  updated_at: string;
}

export interface Task {
  uuid: string;
  task_list: string;
  title: string;
  description: string;
  status: TaskStatus;
  status_display: string;
  priority: TaskPriority;
  priority_display: string;
  assigned_to: string | null;
  due_date: string | null;
  order: number;
  created_at: string;
  updated_at: string;
}

export interface CreateTaskListDto {
  project: string;
  title: string;
  description?: string;
}

export interface CreateTaskDto {
  task_list: string;
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assigned_to?: string | null;
  due_date?: string | null;
  order?: number;
}

export interface UpdateTaskListDto {
  title?: string;
  description?: string;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assigned_to?: string | null;
  due_date?: string | null;
  order?: number;
}

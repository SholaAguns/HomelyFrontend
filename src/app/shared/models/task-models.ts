export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface TaskList {
  uuid: string;
  project_uuid: string;
  title: string;
  description: string;
  tasks_count: number;
  created_at: string;
  updated_at: string;
}

export interface TaskListDetail extends TaskList {
  tasks: Task[];
}

export interface Task {
  uuid: string;
  task_list_uuid: string;
  title: string;
  description: string;
  status: TaskStatus;
  status_display: string;
  priority: TaskPriority;
  priority_display: string;
  assigned_to_email: string | null;
  due_date: string | null;
  order: number;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export interface CreateTaskListDto {
  project_input: string;
  title: string;
  description?: string;
}

export interface CreateTaskDto {
  task_list_input: string;
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assigned_to_input?: string | null;
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
  assigned_to_input?: string | null;
  due_date?: string | null;
  order?: number;
}

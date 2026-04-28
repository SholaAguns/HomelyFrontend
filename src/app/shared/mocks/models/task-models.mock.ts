import {
  Task,
  TaskListDetail,
  CreateTaskListDto,
  UpdateTaskListDto,
  CreateTaskDto,
  UpdateTaskDto,
} from '../../models/task-models';

export const mockTask: Task = {
  uuid: 'task-uuid-1',
  task_list_uuid: 'task-list-uuid-1',
  title: 'Book viewings',
  description: 'Contact agents to arrange viewings',
  status: 'TODO',
  status_display: 'To Do',
  priority: 'MEDIUM',
  priority_display: 'Medium',
  assigned_to: null,
  due_date: '2026-05-15',
  order: 0,
  created_at: '2026-04-01T10:00:00Z',
  updated_at: '2026-04-01T10:00:00Z',
  completed_at: null,
};

export const mockTaskInProgress: Task = {
  ...mockTask,
  uuid: 'task-uuid-2',
  title: 'Research schools nearby',
  status: 'IN_PROGRESS',
  status_display: 'In Progress',
  priority: 'HIGH',
  priority_display: 'High',
  order: 1,
};

export const mockTaskDone: Task = {
  ...mockTask,
  uuid: 'task-uuid-3',
  title: 'Check commute times',
  status: 'DONE',
  status_display: 'Done',
  priority: 'LOW',
  priority_display: 'Low',
  order: 2,
  completed_at: '2026-04-20T14:30:00Z',
};

export const mockTaskList: TaskListDetail = {
  uuid: 'task-list-uuid-1',
  project_uuid: 'project-uuid-1',
  title: 'Viewing Checklist',
  description: 'Tasks to complete before and after viewings',
  tasks_count: 2,
  tasks: [mockTask, mockTaskInProgress],
  created_at: '2026-04-01T09:00:00Z',
  updated_at: '2026-04-01T09:00:00Z',
};

export const mockTaskListEmpty: TaskListDetail = {
  uuid: 'task-list-uuid-2',
  project_uuid: 'project-uuid-1',
  title: 'Research Tasks',
  description: '',
  tasks_count: 0,
  tasks: [],
  created_at: '2026-04-02T09:00:00Z',
  updated_at: '2026-04-02T09:00:00Z',
};

export const mockCreateTaskListDto: CreateTaskListDto = {
  project_input: 'project-uuid-1',
  title: 'New Task List',
  description: 'A new task list',
};

export const mockUpdateTaskListDto: UpdateTaskListDto = {
  title: 'Updated Task List',
  description: 'Updated description',
};

export const mockCreateTaskDto: CreateTaskDto = {
  task_list_input: 'task-list-uuid-1',
  title: 'New Task',
  description: 'A new task',
  status: 'TODO',
  priority: 'MEDIUM',
  due_date: null,
};

export const mockUpdateTaskDto: UpdateTaskDto = {
  title: 'Updated Task',
  status: 'IN_PROGRESS',
  priority: 'HIGH',
};

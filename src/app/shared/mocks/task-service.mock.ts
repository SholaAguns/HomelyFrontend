import { vi } from 'vitest';

export function createTaskServiceMock() {
  return {
    getAllTaskLists: vi.fn(),
    getTaskList: vi.fn(),
    createTaskList: vi.fn(),
    updateTaskList: vi.fn(),
    deleteTaskList: vi.fn(),
    getAllTasks: vi.fn(),
    getTask: vi.fn(),
    createTask: vi.fn(),
    updateTask: vi.fn(),
    deleteTask: vi.fn(),
  };
}

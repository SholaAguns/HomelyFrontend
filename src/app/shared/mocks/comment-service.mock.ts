import { vi } from 'vitest';

export function createCommentServiceMock() {
  return {
    getComments: vi.fn(),
    createComment: vi.fn(),
    deleteComment: vi.fn(),
  };
}

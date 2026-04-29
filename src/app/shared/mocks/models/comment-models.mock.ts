import { ProjectComment, CreateCommentDto } from '../../models/comment-models';

export const mockComment: ProjectComment = {
  uuid: 'comment-uuid-1',
  body: 'This looks like a great area!',
  author_email: 'owner@test.com',
  author_name: 'Test Owner',
  created_at: '2026-04-28T10:00:00Z',
  updated_at: '2026-04-28T10:00:00Z',
};

export const mockCommentByOther: ProjectComment = {
  uuid: 'comment-uuid-2',
  body: 'Agreed, the commute is decent.',
  author_email: 'contributor@test.com',
  author_name: 'Test Contributor',
  created_at: '2026-04-28T11:00:00Z',
  updated_at: '2026-04-28T11:00:00Z',
};

export const mockCreateCommentDto: CreateCommentDto = {
  project_uuid: 'project-uuid-1',
  body: 'This looks like a great area!',
};

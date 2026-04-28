export interface ProjectComment {
  uuid: string;
  body: string;
  author_email: string;
  author_name: string;
  created_at: string;
  updated_at: string;
}

export interface CreateCommentDto {
  project_uuid: string;
  body: string;
}

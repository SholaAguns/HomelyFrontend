import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, exhaustMap, catchError, EMPTY } from 'rxjs';
import { CommentService } from '../../../core/services/comment-service/comment.service';
import { NotificationService } from '../../../core/services/notification-service/notification.service';
import { ProjectComment, CreateCommentDto } from '../../../shared/models/comment-models';
import { AppError } from '../../../shared/models/error-models';

type CommentState = {
  comments: ProjectComment[];
  loading: boolean;
  error: string | null;
};

const initialState: CommentState = {
  comments: [],
  loading: false,
  error: null,
};

export const CommentStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods(
    (
      store,
      commentService = inject(CommentService),
      notificationService = inject(NotificationService)
    ) => ({
      loadForProject: rxMethod<string>(
        pipe(
          tap(() => patchState(store, { loading: true, error: null })),
          switchMap((projectUuid) =>
            commentService.getComments(projectUuid).pipe(
              tap((comments) => patchState(store, { comments, loading: false })),
              catchError((err: AppError) => {
                patchState(store, { loading: false, error: err.message });
                return EMPTY;
              })
            )
          )
        )
      ),

      createComment: rxMethod<CreateCommentDto>(
        pipe(
          exhaustMap((dto) =>
            commentService.createComment(dto).pipe(
              tap((newComment) => {
                patchState(store, { comments: [newComment, ...store.comments()] });
              }),
              catchError((err: AppError) => {
                notificationService.error(err.message || 'Failed to add comment');
                return EMPTY;
              })
            )
          )
        )
      ),

      deleteComment: rxMethod<string>(
        pipe(
          exhaustMap((uuid) =>
            commentService.deleteComment(uuid).pipe(
              tap(() => {
                patchState(store, {
                  comments: store.comments().filter((c) => c.uuid !== uuid),
                });
              }),
              catchError((err: AppError) => {
                notificationService.error(err.message || 'Failed to delete comment');
                return EMPTY;
              })
            )
          )
        )
      ),

      addCommentIfNew(comment: ProjectComment) {
        const exists = store.comments().some((c) => c.uuid === comment.uuid);
        if (!exists) {
          patchState(store, { comments: [comment, ...store.comments()] });
        }
      },

      removeCommentByUuid(uuid: string) {
        patchState(store, { comments: store.comments().filter((c) => c.uuid !== uuid) });
      },

      clearComments() {
        patchState(store, initialState);
      },
    })
  )
);

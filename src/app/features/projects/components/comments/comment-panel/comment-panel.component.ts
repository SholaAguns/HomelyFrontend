import { Component, inject, input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { CommentStore } from '../../../store/comment.store';
import { AuthService } from '../../../../../core/services/auth-service/auth.service';
import { PropertySseService } from '../../../../../core/services/property-sse-service/property-sse.service';
import { ProjectComment } from '../../../../../shared/models/comment-models';
import { CommentItemComponent } from '../comment-item/comment-item.component';
import { CommentFormComponent } from '../comment-form/comment-form.component';

@Component({
  selector: 'app-comment-panel',
  standalone: true,
  imports: [CommonModule, CommentItemComponent, CommentFormComponent],
  templateUrl: './comment-panel.component.html',
})
export class CommentPanelComponent implements OnInit, OnDestroy {
  readonly commentStore = inject(CommentStore);
  private authService = inject(AuthService);
  private propertySseService = inject(PropertySseService);
  private sseSubscription?: Subscription;

  projectUuid = input.required<string>();

  get currentUserEmail(): string {
    return this.authService.currentUserEmail();
  }

  ngOnInit() {
    this.commentStore.loadForProject(this.projectUuid());
    this.sseSubscription = this.propertySseService
      .connectToProjectComments(this.projectUuid())
      .subscribe({
        next: (event) => {
          if (event.type === 'comment_created') {
            this.commentStore.addCommentIfNew(event.data as ProjectComment);
          } else if (event.type === 'comment_deleted') {
            this.commentStore.removeCommentByUuid(event.data.uuid);
          }
        },
        error: () => {},
      });
  }

  ngOnDestroy() {
    this.sseSubscription?.unsubscribe();
    this.commentStore.clearComments();
  }

  onCommentSubmitted(body: string) {
    this.commentStore.createComment({ project_uuid: this.projectUuid(), body });
  }

  onCommentDeleted(uuid: string) {
    this.commentStore.deleteComment(uuid);
  }
}

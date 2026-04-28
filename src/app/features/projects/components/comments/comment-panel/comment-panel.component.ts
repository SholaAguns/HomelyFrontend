import { Component, inject, input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommentStore } from '../../../store/comment.store';
import { AuthService } from '../../../../../core/services/auth-service/auth.service';
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

  projectUuid = input.required<string>();

  get currentUserEmail(): string {
    return this.authService.currentUserEmail();
  }

  ngOnInit() {
    this.commentStore.loadForProject(this.projectUuid());
  }

  ngOnDestroy() {
    this.commentStore.clearComments();
  }

  onCommentSubmitted(body: string) {
    this.commentStore.createComment({ project_uuid: this.projectUuid(), body });
  }

  onCommentDeleted(uuid: string) {
    this.commentStore.deleteComment(uuid);
  }
}

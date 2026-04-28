import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectComment } from '../../../../../shared/models/comment-models';

@Component({
  selector: 'app-comment-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './comment-item.component.html',
})
export class CommentItemComponent {
  comment = input.required<ProjectComment>();
  currentUserEmail = input.required<string>();
  commentDeleted = output<string>();

  get isOwn(): boolean {
    return this.comment().author_email === this.currentUserEmail();
  }

  onDelete() {
    this.commentDeleted.emit(this.comment().uuid);
  }
}

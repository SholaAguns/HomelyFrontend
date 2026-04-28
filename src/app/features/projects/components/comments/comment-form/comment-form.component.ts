import { Component, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-comment-form',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './comment-form.component.html',
})
export class CommentFormComponent {
  submitted = output<string>();
  cancelled = output<void>();

  body = '';

  onSubmit() {
    const trimmed = this.body.trim();
    if (!trimmed) return;
    this.submitted.emit(trimmed);
    this.body = '';
  }

  onCancel() {
    this.body = '';
    this.cancelled.emit();
  }
}

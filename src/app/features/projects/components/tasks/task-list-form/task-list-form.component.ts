import { Component, inject, input, output, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import {
  TaskListDetail,
  CreateTaskListDto,
  UpdateTaskListDto,
} from '../../../../../shared/models/task-models';

@Component({
  selector: 'app-task-list-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './task-list-form.component.html',
})
export class TaskListFormComponent {
  private fb = inject(FormBuilder);

  projectUuid = input.required<string>();
  existingTaskList = input<TaskListDetail | null>(null);

  submitted = output<CreateTaskListDto | UpdateTaskListDto>();
  cancelled = output<void>();

  form = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(255)]],
    description: [''],
  });

  get isEditing(): boolean {
    return !!this.existingTaskList();
  }

  constructor() {
    effect(() => {
      const existing = this.existingTaskList();
      if (existing) {
        this.form.patchValue({ title: existing.title, description: existing.description });
      }
    });
  }

  onSubmit() {
    if (this.form.invalid) return;

    const { title, description } = this.form.value;

    if (this.isEditing) {
      this.submitted.emit({ title: title!, description: description ?? '' } as UpdateTaskListDto);
    } else {
      this.submitted.emit({
        project_input: this.projectUuid(),
        title: title!,
        description: description ?? '',
      } as CreateTaskListDto);
    }
  }

  onCancel() {
    this.cancelled.emit();
  }
}

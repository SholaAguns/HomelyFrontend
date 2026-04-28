import { Component, inject, input, output, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import {
  Task,
  CreateTaskDto,
  UpdateTaskDto,
  TaskStatus,
  TaskPriority,
} from '../../../../../shared/models/task-models';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './task-form.component.html',
})
export class TaskFormComponent {
  private fb = inject(FormBuilder);

  taskListUuid = input.required<string>();
  existingTask = input<Task | null>(null);

  submitted = output<CreateTaskDto | UpdateTaskDto>();
  cancelled = output<void>();

  readonly statusOptions: { value: TaskStatus; label: string }[] = [
    { value: 'TODO', label: 'To Do' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'DONE', label: 'Done' },
    { value: 'CANCELLED', label: 'Cancelled' },
  ];

  readonly priorityOptions: { value: TaskPriority; label: string }[] = [
    { value: 'LOW', label: 'Low' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'HIGH', label: 'High' },
    { value: 'URGENT', label: 'Urgent' },
  ];

  form = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(255)]],
    description: [''],
    status: ['TODO' as TaskStatus],
    priority: ['MEDIUM' as TaskPriority],
    due_date: [null as string | null],
  });

  get isEditing(): boolean {
    return !!this.existingTask();
  }

  constructor() {
    effect(() => {
      const existing = this.existingTask();
      if (existing) {
        this.form.patchValue({
          title: existing.title,
          description: existing.description,
          status: existing.status,
          priority: existing.priority,
          due_date: existing.due_date,
        });
      }
    });
  }

  onSubmit() {
    if (this.form.invalid) return;

    const { title, description, status, priority, due_date } = this.form.value;

    if (this.isEditing) {
      this.submitted.emit({
        title: title!,
        description: description ?? '',
        status: status as TaskStatus,
        priority: priority as TaskPriority,
        due_date: due_date ?? null,
      } as UpdateTaskDto);
    } else {
      this.submitted.emit({
        task_list_input: this.taskListUuid(),
        title: title!,
        description: description ?? '',
        status: status as TaskStatus,
        priority: priority as TaskPriority,
        due_date: due_date ?? null,
      } as CreateTaskDto);
    }
  }

  onCancel() {
    this.cancelled.emit();
  }
}

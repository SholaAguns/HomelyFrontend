import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Task,
  UpdateTaskDto,
  CreateTaskDto,
  TaskStatus,
} from '../../../../../shared/models/task-models';
import { TaskFormComponent } from '../task-form/task-form.component';

@Component({
  selector: 'app-task-item',
  standalone: true,
  imports: [CommonModule, TaskFormComponent],
  templateUrl: './task-item.component.html',
})
export class TaskItemComponent {
  task = input.required<Task>();
  canEdit = input<boolean>(false);

  statusChanged = output<{ uuid: string; taskListUuid: string; dto: UpdateTaskDto }>();
  taskUpdated = output<{ uuid: string; taskListUuid: string; dto: UpdateTaskDto }>();
  taskDeleted = output<{ uuid: string; taskListUuid: string }>();

  isEditing = signal(false);

  readonly statusCycle: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'DONE'];

  readonly statusStyles: Record<TaskStatus, string> = {
    TODO: 'bg-gray-100 text-gray-700',
    IN_PROGRESS: 'bg-blue-100 text-blue-700',
    DONE: 'bg-green-100 text-green-700',
    CANCELLED: 'bg-red-100 text-red-700',
  };

  readonly priorityStyles: Record<string, string> = {
    LOW: 'bg-gray-50 text-gray-500',
    MEDIUM: 'bg-yellow-50 text-yellow-700',
    HIGH: 'bg-orange-50 text-orange-700',
    URGENT: 'bg-red-50 text-red-700',
  };

  cycleStatus() {
    if (!this.canEdit()) return;
    const currentTask = this.task();
    const currentIndex = this.statusCycle.indexOf(currentTask.status as TaskStatus);
    const nextStatus = this.statusCycle[(currentIndex + 1) % this.statusCycle.length];
    this.statusChanged.emit({
      uuid: currentTask.uuid,
      taskListUuid: currentTask.task_list,
      dto: { status: nextStatus },
    });
  }

  startEdit() {
    this.isEditing.set(true);
  }

  onEditSubmit(dto: UpdateTaskDto | CreateTaskDto) {
    this.taskUpdated.emit({
      uuid: this.task().uuid,
      taskListUuid: this.task().task_list,
      dto: dto as UpdateTaskDto,
    });
    this.isEditing.set(false);
  }

  onEditCancel() {
    this.isEditing.set(false);
  }

  onDelete() {
    this.taskDeleted.emit({ uuid: this.task().uuid, taskListUuid: this.task().task_list });
  }
}

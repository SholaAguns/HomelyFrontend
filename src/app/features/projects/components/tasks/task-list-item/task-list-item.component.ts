import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Task,
  TaskListDetail,
  CreateTaskDto,
  UpdateTaskDto,
  CreateTaskListDto,
  UpdateTaskListDto,
} from '../../../../../shared/models/task-models';
import { TaskItemComponent } from '../task-item/task-item.component';
import { TaskFormComponent } from '../task-form/task-form.component';
import { TaskListFormComponent } from '../task-list-form/task-list-form.component';

@Component({
  selector: 'app-task-list-item',
  standalone: true,
  imports: [CommonModule, TaskItemComponent, TaskFormComponent, TaskListFormComponent],
  templateUrl: './task-list-item.component.html',
})
export class TaskListItemComponent {
  taskList = input.required<TaskListDetail>();
  canEdit = input<boolean>(false);
  projectUuid = input.required<string>();

  taskListUpdated = output<{ uuid: string; dto: UpdateTaskListDto }>();
  taskListDeleted = output<string>();
  taskCreated = output<CreateTaskDto>();
  taskUpdated = output<{ uuid: string; taskListUuid: string; dto: UpdateTaskDto }>();
  taskDeleted = output<{ uuid: string; taskListUuid: string }>();

  isCollapsed = signal(false);
  showAddTaskForm = signal(false);
  isEditingList = signal(false);

  get sortedTasks(): Task[] {
    return [...this.taskList().tasks].sort((a, b) => a.order - b.order);
  }

  toggleCollapse() {
    this.isCollapsed.set(!this.isCollapsed());
  }

  startEditList() {
    this.isEditingList.set(true);
  }

  onListEditSubmit(dto: CreateTaskListDto | UpdateTaskListDto) {
    this.taskListUpdated.emit({ uuid: this.taskList().uuid, dto: dto as UpdateTaskListDto });
    this.isEditingList.set(false);
  }

  onListEditCancel() {
    this.isEditingList.set(false);
  }

  onDeleteList() {
    this.taskListDeleted.emit(this.taskList().uuid);
  }

  onAddTask() {
    this.showAddTaskForm.set(true);
    this.isCollapsed.set(false);
  }

  onTaskFormSubmit(dto: CreateTaskDto | UpdateTaskDto) {
    this.taskCreated.emit(dto as CreateTaskDto);
    this.showAddTaskForm.set(false);
  }

  onTaskFormCancel() {
    this.showAddTaskForm.set(false);
  }

  onTaskStatusChanged(event: { uuid: string; taskListUuid: string; dto: UpdateTaskDto }) {
    this.taskUpdated.emit(event);
  }

  onTaskUpdated(event: { uuid: string; taskListUuid: string; dto: UpdateTaskDto }) {
    this.taskUpdated.emit(event);
  }

  onTaskDeleted(event: { uuid: string; taskListUuid: string }) {
    this.taskDeleted.emit(event);
  }
}

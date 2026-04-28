import { Component, inject, input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskStore } from '../../../store/task.store';
import { TaskListItemComponent } from '../task-list-item/task-list-item.component';
import { TaskListFormComponent } from '../task-list-form/task-list-form.component';
import { signal } from '@angular/core';
import {
  CreateTaskDto,
  UpdateTaskDto,
  CreateTaskListDto,
  UpdateTaskListDto,
} from '../../../../../shared/models/task-models';

@Component({
  selector: 'app-task-panel',
  standalone: true,
  imports: [CommonModule, TaskListItemComponent, TaskListFormComponent],
  templateUrl: './task-panel.component.html',
})
export class TaskPanelComponent implements OnInit, OnDestroy {
  readonly taskStore = inject(TaskStore);

  projectUuid = input.required<string>();
  canEdit = input<boolean>(false);

  showAddListForm = signal(false);

  ngOnInit() {
    this.taskStore.loadForProject(this.projectUuid());
  }

  ngOnDestroy() {
    this.taskStore.clearTasks();
  }

  onAddList() {
    this.showAddListForm.set(true);
  }

  onListFormSubmit(dto: CreateTaskListDto | UpdateTaskListDto) {
    this.taskStore.createTaskList(dto as CreateTaskListDto);
    this.showAddListForm.set(false);
  }

  onListFormCancel() {
    this.showAddListForm.set(false);
  }

  onTaskListUpdated(event: { uuid: string; dto: UpdateTaskListDto }) {
    this.taskStore.updateTaskList(event);
  }

  onTaskListDeleted(uuid: string) {
    this.taskStore.deleteTaskList(uuid);
  }

  onTaskCreated(dto: CreateTaskDto) {
    this.taskStore.createTask(dto);
  }

  onTaskUpdated(event: { uuid: string; taskListUuid: string; dto: UpdateTaskDto }) {
    this.taskStore.updateTask(event);
  }

  onTaskDeleted(event: { uuid: string; taskListUuid: string }) {
    this.taskStore.deleteTask(event);
  }
}

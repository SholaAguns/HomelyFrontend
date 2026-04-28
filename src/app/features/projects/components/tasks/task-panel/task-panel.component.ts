import { Component, inject, input, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskStore } from '../../../store/task.store';
import { TaskListItemComponent } from '../task-list-item/task-list-item.component';
import { TaskListFormComponent } from '../task-list-form/task-list-form.component';
import { SharingService } from '../../../../../core/services/sharing-service/sharing.service';
import {
  CreateTaskDto,
  UpdateTaskDto,
  CreateTaskListDto,
  UpdateTaskListDto,
} from '../../../../../shared/models/task-models';
import { ProjectMember } from '../../../../../shared/models/project-models';

@Component({
  selector: 'app-task-panel',
  standalone: true,
  imports: [CommonModule, TaskListItemComponent, TaskListFormComponent],
  templateUrl: './task-panel.component.html',
})
export class TaskPanelComponent implements OnInit, OnDestroy {
  readonly taskStore = inject(TaskStore);
  private sharingService = inject(SharingService);

  projectUuid = input.required<string>();
  canEdit = input<boolean>(false);

  showAddListForm = signal(false);
  projectMembers = signal<ProjectMember[]>([]);

  ngOnInit() {
    this.taskStore.loadForProject(this.projectUuid());
    this.sharingService.getMembers(this.projectUuid()).subscribe({
      next: (members) => {
        const allMembers = [members.owner, ...members.contributors, ...members.viewers];
        this.projectMembers.set(allMembers);
      },
      error: () => {},
    });
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

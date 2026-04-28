import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TaskItemComponent } from './task-item.component';
import {
  mockTask,
  mockTaskDone,
  mockTaskInProgress,
} from '../../../../../shared/mocks/models/task-models.mock';

describe('TaskItemComponent', () => {
  let component: TaskItemComponent;
  let fixture: ComponentFixture<TaskItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskItemComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskItemComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('task', mockTask);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with editing state false', () => {
    expect(component.isEditing()).toBe(false);
  });

  describe('cycleStatus', () => {
    it('should not emit statusChanged when canEdit is false', () => {
      const spy = vi.fn();
      component.statusChanged.subscribe(spy);

      component.cycleStatus();

      expect(spy).not.toHaveBeenCalled();
    });

    it('should emit statusChanged with next status when canEdit is true', () => {
      fixture.componentRef.setInput('canEdit', true);
      fixture.componentRef.setInput('task', mockTask);
      fixture.detectChanges();

      const spy = vi.fn();
      component.statusChanged.subscribe(spy);

      component.cycleStatus();

      expect(spy).toHaveBeenCalledWith({
        uuid: mockTask.uuid,
        taskListUuid: mockTask.task_list,
        dto: { status: 'IN_PROGRESS' },
      });
    });

    it('should cycle from IN_PROGRESS to DONE', () => {
      fixture.componentRef.setInput('canEdit', true);
      fixture.componentRef.setInput('task', mockTaskInProgress);
      fixture.detectChanges();

      const spy = vi.fn();
      component.statusChanged.subscribe(spy);

      component.cycleStatus();

      expect(spy).toHaveBeenCalledWith(expect.objectContaining({ dto: { status: 'DONE' } }));
    });

    it('should cycle from DONE back to TODO', () => {
      fixture.componentRef.setInput('canEdit', true);
      fixture.componentRef.setInput('task', mockTaskDone);
      fixture.detectChanges();

      const spy = vi.fn();
      component.statusChanged.subscribe(spy);

      component.cycleStatus();

      expect(spy).toHaveBeenCalledWith(expect.objectContaining({ dto: { status: 'TODO' } }));
    });
  });

  describe('startEdit', () => {
    it('should set isEditing to true', () => {
      component.startEdit();
      expect(component.isEditing()).toBe(true);
    });
  });

  describe('onEditSubmit', () => {
    it('should emit taskUpdated and close edit form', () => {
      component.isEditing.set(true);
      const spy = vi.fn();
      component.taskUpdated.subscribe(spy);

      component.onEditSubmit({ title: 'Updated', status: 'DONE' });

      expect(spy).toHaveBeenCalledWith({
        uuid: mockTask.uuid,
        taskListUuid: mockTask.task_list,
        dto: { title: 'Updated', status: 'DONE' },
      });
      expect(component.isEditing()).toBe(false);
    });
  });

  describe('onEditCancel', () => {
    it('should set isEditing to false', () => {
      component.isEditing.set(true);
      component.onEditCancel();
      expect(component.isEditing()).toBe(false);
    });
  });

  describe('onDelete', () => {
    it('should emit taskDeleted with task uuid and task list uuid', () => {
      const spy = vi.fn();
      component.taskDeleted.subscribe(spy);

      component.onDelete();

      expect(spy).toHaveBeenCalledWith({
        uuid: mockTask.uuid,
        taskListUuid: mockTask.task_list,
      });
    });
  });
});

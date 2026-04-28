import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ReactiveFormsModule } from '@angular/forms';
import { TaskFormComponent } from './task-form.component';
import { mockTask } from '../../../../../shared/mocks/models/task-models.mock';

describe('TaskFormComponent', () => {
  let component: TaskFormComponent;
  let fixture: ComponentFixture<TaskFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskFormComponent, ReactiveFormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskFormComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('taskListUuid', 'task-list-uuid-1');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values in create mode', () => {
    expect(component.form.get('title')?.value).toBe('');
    expect(component.form.get('status')?.value).toBe('TODO');
    expect(component.form.get('priority')?.value).toBe('MEDIUM');
    expect(component.isEditing).toBe(false);
  });

  it('should expose all status options', () => {
    const statusValues = component.statusOptions.map((o) => o.value);
    expect(statusValues).toContain('TODO');
    expect(statusValues).toContain('IN_PROGRESS');
    expect(statusValues).toContain('DONE');
    expect(statusValues).toContain('CANCELLED');
  });

  it('should expose all priority options', () => {
    const priorityValues = component.priorityOptions.map((o) => o.value);
    expect(priorityValues).toContain('LOW');
    expect(priorityValues).toContain('MEDIUM');
    expect(priorityValues).toContain('HIGH');
    expect(priorityValues).toContain('URGENT');
  });

  describe('form validation', () => {
    it('should require title', () => {
      const titleControl = component.form.get('title');
      titleControl?.setValue('');
      titleControl?.markAsTouched();
      expect(titleControl?.hasError('required')).toBe(true);
    });

    it('should invalidate form when title is empty', () => {
      expect(component.form.valid).toBe(false);
    });

    it('should validate form when title is provided', () => {
      component.form.patchValue({ title: 'Book viewing' });
      expect(component.form.valid).toBe(true);
    });
  });

  describe('edit mode', () => {
    it('should return true when existingTask is set', () => {
      fixture.componentRef.setInput('existingTask', mockTask);
      fixture.detectChanges();
      expect(component.isEditing).toBe(true);
    });

    it('should populate form fields from existing task', async () => {
      fixture.componentRef.setInput('existingTask', mockTask);
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.form.get('title')?.value).toBe(mockTask.title);
      expect(component.form.get('description')?.value).toBe(mockTask.description);
      expect(component.form.get('status')?.value).toBe(mockTask.status);
      expect(component.form.get('priority')?.value).toBe(mockTask.priority);
    });
  });

  describe('onSubmit', () => {
    it('should not emit submitted when form is invalid', () => {
      const submitSpy = vi.fn();
      component.submitted.subscribe(submitSpy);

      component.onSubmit();

      expect(submitSpy).not.toHaveBeenCalled();
    });

    it('should emit CreateTaskDto with task_list_input in create mode', () => {
      const submitSpy = vi.fn();
      component.submitted.subscribe(submitSpy);

      component.form.patchValue({ title: 'New Task', status: 'TODO', priority: 'HIGH' });
      component.onSubmit();

      const emitted = submitSpy.mock.calls[0][0];
      expect(emitted.task_list_input).toBe('task-list-uuid-1');
      expect(emitted.title).toBe('New Task');
      expect(emitted.priority).toBe('HIGH');
    });

    it('should emit UpdateTaskDto without task_list_input in edit mode', () => {
      fixture.componentRef.setInput('existingTask', mockTask);
      fixture.detectChanges();

      const submitSpy = vi.fn();
      component.submitted.subscribe(submitSpy);

      component.form.patchValue({ title: 'Updated Task', status: 'DONE' });
      component.onSubmit();

      const emitted = submitSpy.mock.calls[0][0];
      expect(emitted.title).toBe('Updated Task');
      expect(emitted.status).toBe('DONE');
      expect('task_list_input' in emitted).toBe(false);
    });
  });

  describe('onCancel', () => {
    it('should emit cancelled event', () => {
      const cancelSpy = vi.fn();
      component.cancelled.subscribe(cancelSpy);

      component.onCancel();

      expect(cancelSpy).toHaveBeenCalled();
    });
  });
});

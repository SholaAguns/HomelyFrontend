import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ReactiveFormsModule } from '@angular/forms';
import { PropertyListFormComponent } from './property-list-form.component';
import { mockPropertyList } from '../../../../shared/mocks/models/property-list-models.mock';

describe('PropertyListFormComponent', () => {
  let component: PropertyListFormComponent;
  let fixture: ComponentFixture<PropertyListFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PropertyListFormComponent, ReactiveFormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(PropertyListFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty form', () => {
    expect(component.form.get('title')?.value).toBe('');
    expect(component.form.get('rating_criteria')?.value).toBeNull();
  });

  describe('form validation', () => {
    it('should require title', () => {
      const titleControl = component.form.get('title');
      titleControl?.setValue('');
      expect(titleControl?.hasError('required')).toBe(true);
    });

    it('should validate title minimum length', () => {
      const titleControl = component.form.get('title');
      titleControl?.setValue('ab');
      expect(titleControl?.hasError('minlength')).toBe(true);

      titleControl?.setValue('abc');
      expect(titleControl?.hasError('minlength')).toBe(false);
    });

    it('should allow rating_criteria to be null', () => {
      const criteriaControl = component.form.get('rating_criteria');
      expect(criteriaControl?.valid).toBe(true);
    });

    it('should invalidate form when title is empty', () => {
      expect(component.form.valid).toBe(false);
    });

    it('should validate form when title is valid', () => {
      component.form.setValue({
        title: 'Valid Title',
        rating_criteria: null,
      });
      expect(component.form.valid).toBe(true);
    });
  });

  describe('edit mode', () => {
    it('should return false when no list is provided', () => {
      expect(component.isEditMode).toBe(false);
    });

    it('should return true when list is provided', () => {
      fixture.componentRef.setInput('list', mockPropertyList);
      fixture.detectChanges();
      expect(component.isEditMode).toBe(true);
    });

    it('should populate form when list input is set', async () => {
      fixture.componentRef.setInput('list', mockPropertyList);
      fixture.detectChanges();

      await fixture.whenStable();

      expect(component.form.get('title')?.value).toBe(mockPropertyList.title);
      expect(component.form.get('rating_criteria')?.value).toBe(mockPropertyList.rating_criteria);
    });
  });

  describe('onSubmit', () => {
    it('should not emit when form is invalid', () => {
      const submitSpy = vi.fn();
      component.submit.subscribe(submitSpy);

      component.form.setValue({
        title: 'ab',
        rating_criteria: null,
      });

      component.onSubmit();

      expect(submitSpy).not.toHaveBeenCalled();
    });

    it('should emit form value when form is valid', () => {
      const submitSpy = vi.fn();
      component.submit.subscribe(submitSpy);

      const formData = {
        title: 'New Property List',
        rating_criteria: 'Location, Price',
      };
      component.form.setValue(formData);

      component.onSubmit();

      expect(submitSpy).toHaveBeenCalledWith(formData);
    });

    it('should set isSubmitting to true on submit', () => {
      component.form.setValue({
        title: 'Valid Title',
        rating_criteria: null,
      });

      expect(component.isSubmitting).toBe(false);

      component.onSubmit();

      expect(component.isSubmitting).toBe(true);
    });

    it('should not emit when already submitting', () => {
      const submitSpy = vi.fn();
      component.submit.subscribe(submitSpy);

      component.form.setValue({
        title: 'Valid Title',
        rating_criteria: null,
      });

      component.isSubmitting = true;
      component.onSubmit();

      expect(submitSpy).not.toHaveBeenCalled();
    });
  });

  describe('onCancel', () => {
    it('should emit cancel event', () => {
      const cancelSpy = vi.fn();
      component.cancel.subscribe(cancelSpy);

      component.onCancel();

      expect(cancelSpy).toHaveBeenCalled();
    });
  });
});

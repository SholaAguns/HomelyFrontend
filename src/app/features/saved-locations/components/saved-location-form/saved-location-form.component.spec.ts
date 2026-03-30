import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ReactiveFormsModule } from '@angular/forms';
import { SavedLocationFormComponent } from './saved-location-form.component';
import {
  mockSavedLocation,
  mockCreateSavedLocationDto,
} from '../../../../shared/mocks/models/saved-location-models.mock';

describe('SavedLocationFormComponent', () => {
  let component: SavedLocationFormComponent;
  let fixture: ComponentFixture<SavedLocationFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SavedLocationFormComponent, ReactiveFormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(SavedLocationFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty form', () => {
    expect(component.form.get('name')?.value).toBe('');
    expect(component.form.get('postcode')?.value).toBe('');
    expect(component.form.get('address_line_1')?.value).toBe('');
  });

  describe('form validation', () => {
    it('should require name', () => {
      const nameControl = component.form.get('name');
      nameControl?.setValue('');
      expect(nameControl?.hasError('required')).toBe(true);
    });

    it('should require postcode', () => {
      const postcodeControl = component.form.get('postcode');
      postcodeControl?.setValue('');
      expect(postcodeControl?.hasError('required')).toBe(true);
    });

    it('should require address_line_1', () => {
      const addressControl = component.form.get('address_line_1');
      addressControl?.setValue('');
      expect(addressControl?.hasError('required')).toBe(true);
    });

    it('should not require address_line_2', () => {
      const addressControl = component.form.get('address_line_2');
      addressControl?.setValue('');
      expect(addressControl?.valid).toBe(true);
    });

    it('should not require city', () => {
      const cityControl = component.form.get('city');
      cityControl?.setValue('');
      expect(cityControl?.valid).toBe(true);
    });

    it('should invalidate form when required fields are empty', () => {
      expect(component.form.valid).toBe(false);
    });

    it('should validate form when all required fields are filled', () => {
      component.form.setValue({
        name: 'Home',
        postcode: 'SW1A 1AA',
        address_line_1: '10 Downing Street',
        address_line_2: '',
        city: '',
      });
      expect(component.form.valid).toBe(true);
    });
  });

  describe('initialData input', () => {
    it('should populate form when initialData is provided', async () => {
      fixture.componentRef.setInput('initialData', mockCreateSavedLocationDto);
      component.ngOnInit();
      fixture.detectChanges();

      await fixture.whenStable();

      expect(component.form.get('name')?.value).toBe(mockCreateSavedLocationDto.name);
      expect(component.form.get('postcode')?.value).toBe(mockCreateSavedLocationDto.postcode);
      expect(component.form.get('address_line_1')?.value).toBe(
        mockCreateSavedLocationDto.address_line_1
      );
    });
  });

  describe('mode input', () => {
    it('should default to create mode', () => {
      expect(component.mode()).toBe('create');
    });

    it('should accept edit mode', () => {
      fixture.componentRef.setInput('mode', 'edit');
      fixture.detectChanges();
      expect(component.mode()).toBe('edit');
    });
  });

  describe('onSubmit', () => {
    it('should not emit when form is invalid', () => {
      const submitSpy = vi.fn();
      component.formSubmit.subscribe(submitSpy);

      component.form.setValue({
        name: '',
        postcode: 'SW1A 1AA',
        address_line_1: '10 Downing Street',
        address_line_2: '',
        city: '',
      });

      component.onSubmit();

      expect(submitSpy).not.toHaveBeenCalled();
    });

    it('should emit CreateSavedLocationDto when form is valid', () => {
      const submitSpy = vi.fn();
      component.formSubmit.subscribe(submitSpy);

      component.form.setValue({
        name: 'Home',
        postcode: 'SW1A 1AA',
        address_line_1: '10 Downing Street',
        address_line_2: '',
        city: 'London',
      });

      component.onSubmit();

      expect(submitSpy).toHaveBeenCalledWith({
        name: 'Home',
        postcode: 'SW1A 1AA',
        address_line_1: '10 Downing Street',
        address_line_2: undefined,
        city: 'London',
      });
    });

    it('should handle optional fields correctly', () => {
      const submitSpy = vi.fn();
      component.formSubmit.subscribe(submitSpy);

      component.form.setValue({
        name: 'Office',
        postcode: 'EC1A 1BB',
        address_line_1: '1 Example Street',
        address_line_2: 'Floor 3',
        city: '',
      });

      component.onSubmit();

      expect(submitSpy).toHaveBeenCalledWith({
        name: 'Office',
        postcode: 'EC1A 1BB',
        address_line_1: '1 Example Street',
        address_line_2: 'Floor 3',
        city: undefined,
      });
    });
  });

  describe('onCancel', () => {
    it('should emit cancel event', () => {
      const cancelSpy = vi.fn();
      component.formCancel.subscribe(cancelSpy);

      component.onCancel();

      expect(cancelSpy).toHaveBeenCalled();
    });
  });

  describe('isValid getter', () => {
    it('should return false when form is invalid', () => {
      component.form.setValue({
        name: '',
        postcode: '',
        address_line_1: '',
        address_line_2: '',
        city: '',
      });
      expect(component.isValid).toBe(false);
    });

    it('should return true when form is valid', () => {
      component.form.setValue({
        name: 'Home',
        postcode: 'SW1A 1AA',
        address_line_1: '10 Downing Street',
        address_line_2: '',
        city: '',
      });
      expect(component.isValid).toBe(true);
    });
  });
});

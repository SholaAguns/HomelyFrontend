import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ReactiveFormsModule } from '@angular/forms';
import { SearchCriteriaFormComponent } from './search-criteria-form.component';
import { SearchCriteria } from '../../models/property-models';

describe('SearchCriteriaFormComponent', () => {
  let component: SearchCriteriaFormComponent;
  let fixture: ComponentFixture<SearchCriteriaFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchCriteriaFormComponent, ReactiveFormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(SearchCriteriaFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with default values', () => {
    expect(component.searchForm.value).toEqual({
      area: '',
      bedrooms_min: null,
      bedrooms_max: null,
      price_min: null,
      price_max: null,
      radius: 5,
      property_types: '',
      max_days_since_added: null,
    });
  });

  it('should mark area as required', () => {
    const areaControl = component.searchForm.get('area');
    expect(areaControl?.hasError('required')).toBe(true);

    areaControl?.setValue('London');
    expect(areaControl?.hasError('required')).toBe(false);
  });

  it('should emit searchSubmit on valid form submission', () => {
    const emitSpy = vi.spyOn(component.searchSubmit, 'emit');

    component.searchForm.patchValue({
      area: 'Manchester',
      bedrooms_min: 2,
      bedrooms_max: 3,
      price_min: 1000,
      price_max: 2000,
      radius: 10,
      property_types: 'house',
      max_days_since_added: 7,
    });

    component.onSubmit();

    expect(emitSpy).toHaveBeenCalledWith({
      area: 'Manchester',
      bedrooms_min: 2,
      bedrooms_max: 3,
      price_min: 1000,
      price_max: 2000,
      radius: 10,
      property_types: 'house',
      max_days_since_added: 7,
    });
  });

  it('should not emit searchSubmit on invalid form submission', () => {
    const emitSpy = vi.spyOn(component.searchSubmit, 'emit');

    component.searchForm.patchValue({
      area: '', // Invalid - required field
    });

    component.onSubmit();

    expect(emitSpy).not.toHaveBeenCalled();
  });

  it('should emit cancel on onCancel', () => {
    const emitSpy = vi.spyOn(component.cancel, 'emit');

    component.onCancel();

    expect(emitSpy).toHaveBeenCalled();
  });

  it('should return correct isFormValid status', () => {
    expect(component.isFormValid).toBe(false);

    component.searchForm.patchValue({ area: 'London' });
    expect(component.isFormValid).toBe(true);
  });

  it('should convert null values to undefined in searchSubmit', () => {
    const emitSpy = vi.spyOn(component.searchSubmit, 'emit');

    component.searchForm.patchValue({
      area: 'London',
      bedrooms_min: null,
      price_min: null,
    });

    component.onSubmit();

    const emittedValue = emitSpy.mock.calls[0][0];
    expect(emittedValue.bedrooms_min).toBeUndefined();
    expect(emittedValue.price_min).toBeUndefined();
  });

  it('should have correct property types options', () => {
    expect(component.propertyTypes).toEqual([
      { value: '', label: 'Any' },
      { value: 'house', label: 'House' },
      { value: 'flat', label: 'Flat/Apartment' },
      { value: 'bungalow', label: 'Bungalow' },
      { value: 'land', label: 'Land' },
      { value: 'commercial-property', label: 'Commercial' },
      { value: 'other', label: 'Other' },
    ]);
  });

  it('should patch form values from input searchCriteria', () => {
    const existingCriteria: SearchCriteria = {
      area: 'Birmingham',
      bedrooms_min: 3,
      bedrooms_max: 4,
      price_min: 1500,
      price_max: 2500,
      radius: 15,
      property_types: 'flat',
      max_days_since_added: 3,
    };

    fixture.componentRef.setInput('searchCriteria', existingCriteria);
    fixture.detectChanges();

    expect(component.searchForm.value.area).toBe('Birmingham');
    expect(component.searchForm.value.bedrooms_min).toBe(3);
    expect(component.searchForm.value.radius).toBe(15);
    expect(component.searchForm.value.property_types).toBe('flat');
  });

  it('should use default button text when not provided', () => {
    expect(component.submitButtonText()).toBe('Create List');
  });

  it('should use custom button text when provided', () => {
    fixture.componentRef.setInput('submitButtonText', 'Start Search');
    fixture.detectChanges();

    expect(component.submitButtonText()).toBe('Start Search');
  });

  it('should show cancel button by default', () => {
    expect(component.showCancelButton()).toBe(true);
  });

  it('should hide cancel button when set to false', () => {
    fixture.componentRef.setInput('showCancelButton', false);
    fixture.detectChanges();

    expect(component.showCancelButton()).toBe(false);
  });
});

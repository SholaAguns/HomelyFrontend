import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ReactiveFormsModule } from '@angular/forms';
import { SearchCriteriaForm } from './search-criteria-form';

describe('SearchCriteriaForm', () => {
  let component: SearchCriteriaForm;
  let fixture: ComponentFixture<SearchCriteriaForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchCriteriaForm, ReactiveFormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(SearchCriteriaForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with default values', () => {
    expect(component.searchForm.get('area')?.value).toBe('');
    expect(component.searchForm.get('bedrooms_min')?.value).toBeNull();
    expect(component.searchForm.get('bedrooms_max')?.value).toBeNull();
    expect(component.searchForm.get('price_min')?.value).toBeNull();
    expect(component.searchForm.get('price_max')?.value).toBeNull();
    expect(component.searchForm.get('radius')?.value).toBe(5);
    expect(component.searchForm.get('max_days_since_added')?.value).toBe(14);
  });

  it('should initialize property_types with house and flat checked', () => {
    const propertyTypes = component.searchForm.get('property_types')?.value;
    expect(propertyTypes.house).toBe(true);
    expect(propertyTypes.flat).toBe(true);
    expect(propertyTypes.bungalow).toBe(false);
    expect(propertyTypes.land).toBe(false);
    expect(propertyTypes['commercial-property']).toBe(false);
    expect(propertyTypes.other).toBe(false);
  });

  describe('form validation', () => {
    it('should require area', () => {
      const areaControl = component.searchForm.get('area');
      areaControl?.setValue('');
      expect(areaControl?.hasError('required')).toBe(true);
    });

    it('should be invalid when area is empty', () => {
      component.searchForm.patchValue({ area: '' });
      expect(component.searchForm.valid).toBe(false);
    });

    it('should be valid when area is provided', () => {
      component.searchForm.patchValue({ area: 'Manchester' });
      expect(component.searchForm.valid).toBe(true);
    });
  });

  describe('onSubmit', () => {
    it('should not emit searchSubmit when form invalid', () => {
      const submitSpy = vi.fn();
      component.searchSubmit.subscribe(submitSpy);

      component.searchForm.patchValue({ area: '' });
      component.onSubmit();

      expect(submitSpy).not.toHaveBeenCalled();
    });

    it('should emit searchSubmit with criteria when form valid', () => {
      const submitSpy = vi.fn();
      component.searchSubmit.subscribe(submitSpy);

      component.searchForm.patchValue({
        area: 'Manchester',
        bedrooms_min: 2,
        bedrooms_max: 4,
        price_min: 1000,
        price_max: 2000,
        radius: 10,
        max_days_since_added: 7,
      });

      component.onSubmit();

      expect(submitSpy).toHaveBeenCalledWith({
        area: 'Manchester',
        bedrooms_min: 2,
        bedrooms_max: 4,
        price_min: 1000,
        price_max: 2000,
        radius: 10,
        property_types: ['house', 'flat'],
        max_days_since_added: 7,
      });
    });

    it('should convert property_types object to array of selected types', () => {
      const submitSpy = vi.fn();
      component.searchSubmit.subscribe(submitSpy);

      component.searchForm.patchValue({
        area: 'London',
        property_types: {
          house: false,
          flat: true,
          bungalow: true,
          land: false,
          'commercial-property': false,
          other: false,
        },
      });

      component.onSubmit();

      const emittedCriteria = submitSpy.mock.calls[0][0];
      expect(emittedCriteria.property_types).toEqual(['flat', 'bungalow']);
    });

    it('should omit property_types when none selected', () => {
      const submitSpy = vi.fn();
      component.searchSubmit.subscribe(submitSpy);

      component.searchForm.patchValue({
        area: 'Birmingham',
        property_types: {
          house: false,
          flat: false,
          bungalow: false,
          land: false,
          'commercial-property': false,
          other: false,
        },
      });

      component.onSubmit();

      const emittedCriteria = submitSpy.mock.calls[0][0];
      expect(emittedCriteria.property_types).toBeUndefined();
    });

    it('should convert null values to undefined in criteria', () => {
      const submitSpy = vi.fn();
      component.searchSubmit.subscribe(submitSpy);

      component.searchForm.patchValue({
        area: 'Leeds',
        bedrooms_min: null,
        bedrooms_max: null,
        price_min: null,
        price_max: null,
        radius: null,
        max_days_since_added: null,
      });

      component.onSubmit();

      const emittedCriteria = submitSpy.mock.calls[0][0];
      expect(emittedCriteria.bedrooms_min).toBeUndefined();
      expect(emittedCriteria.bedrooms_max).toBeUndefined();
      expect(emittedCriteria.price_min).toBeUndefined();
      expect(emittedCriteria.price_max).toBeUndefined();
      expect(emittedCriteria.radius).toBeUndefined();
      expect(emittedCriteria.max_days_since_added).toBeUndefined();
    });
  });

  describe('isFormValid getter', () => {
    it('should return false when form invalid', () => {
      component.searchForm.patchValue({ area: '' });
      expect(component.isFormValid).toBe(false);
    });

    it('should return true when form valid', () => {
      component.searchForm.patchValue({ area: 'Manchester' });
      expect(component.isFormValid).toBe(true);
    });
  });

  describe('propertyTypes array', () => {
    it('should have correct property type options', () => {
      expect(component.propertyTypes).toEqual([
        { value: 'house', label: 'House' },
        { value: 'flat', label: 'Flat/Apartment' },
        { value: 'bungalow', label: 'Bungalow' },
        { value: 'land', label: 'Land' },
        { value: 'commercial-property', label: 'Commercial' },
        { value: 'other', label: 'Other' },
      ]);
    });
  });
});

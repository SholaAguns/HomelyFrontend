import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ReactiveFormsModule } from '@angular/forms';
import { PropertyFormComponent } from './property-form.component';
import { mockCreatePropertyDto } from '../../../../shared/mocks/models/property-models.mock';

describe('PropertyFormComponent', () => {
  let component: PropertyFormComponent;
  let fixture: ComponentFixture<PropertyFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PropertyFormComponent, ReactiveFormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(PropertyFormComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('propertyListUuid', 'list-uuid-1');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty form in create mode', () => {
    expect(component.form.get('title')?.value).toBe('');
    expect(component.form.get('address_line_1')?.value).toBe('');
    expect(component.form.get('postcode')?.value).toBe('');
    expect(component.form.get('price')?.value).toBeNull();
    expect(component.form.get('bedrooms')?.value).toBeNull();
    expect(component.form.get('bathrooms')?.value).toBeNull();
  });

  describe('form validation', () => {
    it('should require title', () => {
      const titleControl = component.form.get('title');
      titleControl?.setValue('');
      expect(titleControl?.hasError('required')).toBe(true);
    });

    it('should require address_line_1', () => {
      const addressControl = component.form.get('address_line_1');
      addressControl?.setValue('');
      expect(addressControl?.hasError('required')).toBe(true);
    });

    it('should require postcode', () => {
      const postcodeControl = component.form.get('postcode');
      postcodeControl?.setValue('');
      expect(postcodeControl?.hasError('required')).toBe(true);
    });

    it('should require price', () => {
      const priceControl = component.form.get('price');
      priceControl?.setValue(null);
      expect(priceControl?.hasError('required')).toBe(true);
    });

    it('should validate price minimum value', () => {
      const priceControl = component.form.get('price');
      priceControl?.setValue(-100);
      expect(priceControl?.hasError('min')).toBe(true);

      priceControl?.setValue(0);
      expect(priceControl?.hasError('min')).toBe(false);
    });

    it('should require bedrooms', () => {
      const bedroomsControl = component.form.get('bedrooms');
      bedroomsControl?.setValue(null);
      expect(bedroomsControl?.hasError('required')).toBe(true);
    });

    it('should validate bedrooms minimum value', () => {
      const bedroomsControl = component.form.get('bedrooms');
      bedroomsControl?.setValue(-1);
      expect(bedroomsControl?.hasError('min')).toBe(true);

      bedroomsControl?.setValue(0);
      expect(bedroomsControl?.hasError('min')).toBe(false);
    });

    it('should require bathrooms', () => {
      const bathroomsControl = component.form.get('bathrooms');
      bathroomsControl?.setValue(null);
      expect(bathroomsControl?.hasError('required')).toBe(true);
    });

    it('should validate bathrooms minimum value', () => {
      const bathroomsControl = component.form.get('bathrooms');
      bathroomsControl?.setValue(-1);
      expect(bathroomsControl?.hasError('min')).toBe(true);

      bathroomsControl?.setValue(0);
      expect(bathroomsControl?.hasError('min')).toBe(false);
    });

    it('should validate square_area minimum value', () => {
      const squareAreaControl = component.form.get('square_area');
      squareAreaControl?.setValue(-100);
      expect(squareAreaControl?.hasError('min')).toBe(true);

      squareAreaControl?.setValue(0);
      expect(squareAreaControl?.hasError('min')).toBe(false);
    });

    it('should validate lease_length minimum value', () => {
      const leaseLengthControl = component.form.get('lease_length');
      leaseLengthControl?.setValue(-1);
      expect(leaseLengthControl?.hasError('min')).toBe(true);

      leaseLengthControl?.setValue(0);
      expect(leaseLengthControl?.hasError('min')).toBe(false);
    });

    it('should invalidate form when required fields are empty', () => {
      expect(component.form.valid).toBe(false);
    });

    it('should validate form when all required fields are filled', () => {
      component.form.patchValue({
        title: '2 Bedroom Flat',
        address_line_1: '123 Main Street',
        postcode: 'SW1A 1AA',
        price: 450000,
        bedrooms: 2,
        bathrooms: 1,
      });

      expect(component.form.valid).toBe(true);
    });
  });

  describe('initialData input', () => {
    it('should populate form when initialData is provided', async () => {
      const newFixture = TestBed.createComponent(PropertyFormComponent);
      const newComponent = newFixture.componentInstance;

      newFixture.componentRef.setInput('propertyListUuid', 'list-uuid-1');
      newFixture.componentRef.setInput('initialData', mockCreatePropertyDto);
      newFixture.detectChanges();

      expect(newComponent.form.get('title')?.value).toBe(mockCreatePropertyDto.title);
      expect(newComponent.form.get('address_line_1')?.value).toBe(
        mockCreatePropertyDto.address_line_1
      );
      expect(newComponent.form.get('postcode')?.value).toBe(mockCreatePropertyDto.postcode);
      expect(newComponent.form.get('price')?.value).toBe(mockCreatePropertyDto.price);
      expect(newComponent.form.get('bedrooms')?.value).toBe(mockCreatePropertyDto.bedrooms);
      expect(newComponent.form.get('bathrooms')?.value).toBe(mockCreatePropertyDto.bathrooms);
    });
  });

  describe('readOnly input', () => {
    it('should disable form when readOnly is true', () => {
      const newFixture = TestBed.createComponent(PropertyFormComponent);
      const newComponent = newFixture.componentInstance;

      newFixture.componentRef.setInput('propertyListUuid', 'list-uuid-1');
      newFixture.componentRef.setInput('readOnly', true);
      newFixture.detectChanges();

      expect(newComponent.form.disabled).toBe(true);
    });

    it('should keep form enabled when readOnly is false', () => {
      fixture.componentRef.setInput('readOnly', false);
      fixture.detectChanges();

      expect(component.form.disabled).toBe(false);
    });
  });

  describe('onSubmit', () => {
    it('should not emit when form is invalid', () => {
      const submitSpy = vi.fn();
      component.formSubmit.subscribe(submitSpy);

      component.onSubmit();

      expect(submitSpy).not.toHaveBeenCalled();
    });

    it('should emit formSubmit with property data when form is valid', () => {
      const submitSpy = vi.fn();
      component.formSubmit.subscribe(submitSpy);

      const formData = {
        title: '2 Bedroom Flat',
        address_line_1: '123 Main Street',
        address_line_2: '',
        city: '',
        postcode: 'SW1A 1AA',
        latitude: null,
        longitude: null,
        price: 450000,
        bedrooms: 2,
        bathrooms: 1,
        square_area: null,
        garden: false,
        parking: false,
        furnished_status: 'UNFURNISHED',
        council_tax_band: '',
        epc_rating: '',
        lease_length: null,
        floor_level: null,
        child_suitable: false,
        completion_date: null,
        external_id: '',
        external_url: '',
      };

      component.form.patchValue(formData);
      component.onSubmit();

      expect(submitSpy).toHaveBeenCalledWith({
        ...formData,
        property_lists_input: ['list-uuid-1'],
      });
    });

    it('should not emit when form is disabled (readOnly)', () => {
      const submitSpy = vi.fn();
      component.formSubmit.subscribe(submitSpy);

      fixture.componentRef.setInput('readOnly', true);
      fixture.detectChanges();

      component.form.patchValue({
        title: '2 Bedroom Flat',
        address_line_1: '123 Main Street',
        postcode: 'SW1A 1AA',
        price: 450000,
        bedrooms: 2,
        bathrooms: 1,
      });

      component.onSubmit();

      expect(submitSpy).not.toHaveBeenCalled();
    });
  });

  describe('onCancel', () => {
    it('should emit formCancel event', () => {
      const cancelSpy = vi.fn();
      component.formCancel.subscribe(cancelSpy);

      component.onCancel();

      expect(cancelSpy).toHaveBeenCalled();
    });
  });

  describe('isValid getter', () => {
    it('should return false when form is invalid', () => {
      expect(component.isValid).toBe(false);
    });

    it('should return true when form is valid', () => {
      component.form.patchValue({
        title: '2 Bedroom Flat',
        address_line_1: '123 Main Street',
        postcode: 'SW1A 1AA',
        price: 450000,
        bedrooms: 2,
        bathrooms: 1,
      });

      expect(component.isValid).toBe(true);
    });
  });

  describe('mode input', () => {
    it('should accept create mode', () => {
      fixture.componentRef.setInput('mode', 'create');
      fixture.detectChanges();

      expect(component.mode()).toBe('create');
    });

    it('should accept edit mode', () => {
      fixture.componentRef.setInput('mode', 'edit');
      fixture.detectChanges();

      expect(component.mode()).toBe('edit');
    });

    it('should accept review mode', () => {
      fixture.componentRef.setInput('mode', 'review');
      fixture.detectChanges();

      expect(component.mode()).toBe('review');
    });
  });

  describe('default values', () => {
    it('should set default furnished_status to UNFURNISHED', () => {
      expect(component.form.get('furnished_status')?.value).toBe('UNFURNISHED');
    });

    it('should set default garden to false', () => {
      expect(component.form.get('garden')?.value).toBe(false);
    });

    it('should set default parking to false', () => {
      expect(component.form.get('parking')?.value).toBe(false);
    });

    it('should set default child_suitable to false', () => {
      expect(component.form.get('child_suitable')?.value).toBe(false);
    });
  });
});

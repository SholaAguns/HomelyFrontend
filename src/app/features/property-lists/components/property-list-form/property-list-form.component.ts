import { Component, inject, input, output, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  PropertyList,
  CreatePropertyListDto,
} from '../../../../shared/models/property-list-models';
import {
  SearchCriteria,
  SEARCH_CRITERIA_PRICES,
  SEARCH_CRITERIA_BEDROOMS,
  SEARCH_CRITERIA_RADII,
  SEARCH_CRITERIA_DAYS_SINCE_ADDED,
} from '../../../../shared/models/property-models';

@Component({
  selector: 'app-property-list-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './property-list-form.component.html',
  styleUrl: './property-list-form.component.css',
})
export class PropertyListFormComponent {
  private fb = inject(FormBuilder);

  list = input<PropertyList | null>(null);
  submit = output<CreatePropertyListDto>();
  cancel = output<void>();

  form: FormGroup = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
  });

  searchCriteriaGroup: FormGroup = this.fb.group({
    area: [''],
    bedrooms_min: [null],
    bedrooms_max: [null],
    price_min: [null],
    price_max: [null],
    radius: [null],
    property_types: [''],
    max_days_since_added: [null],
  });

  criteriaExpanded = signal(false);
  isSubmitting = false;

  priceOptions = SEARCH_CRITERIA_PRICES;
  bedroomOptions = SEARCH_CRITERIA_BEDROOMS;
  radiusOptions = SEARCH_CRITERIA_RADII;
  daysSinceAddedOptions = SEARCH_CRITERIA_DAYS_SINCE_ADDED;

  propertyTypes = [
    { value: '', label: 'Any' },
    { value: 'house', label: 'House' },
    { value: 'flat', label: 'Flat/Apartment' },
    { value: 'bungalow', label: 'Bungalow' },
    { value: 'land', label: 'Land' },
    { value: 'commercial-property', label: 'Commercial' },
    { value: 'other', label: 'Other' },
  ];

  constructor() {
    effect(() => {
      const listValue = this.list();
      if (listValue) {
        this.form.patchValue({ title: listValue.title });
        if (listValue.search_criteria) {
          this.criteriaExpanded.set(true);
          this.searchCriteriaGroup.patchValue({
            area: listValue.search_criteria.area || '',
            bedrooms_min: listValue.search_criteria.bedrooms_min ?? null,
            bedrooms_max: listValue.search_criteria.bedrooms_max ?? null,
            price_min: listValue.search_criteria.price_min ?? null,
            price_max: listValue.search_criteria.price_max ?? null,
            radius: listValue.search_criteria.radius ?? null,
            property_types: listValue.search_criteria.property_types || '',
            max_days_since_added: listValue.search_criteria.max_days_since_added ?? null,
          });
        }
      }
    });
  }

  toggleCriteria() {
    this.criteriaExpanded.update((v) => !v);
  }

  onSubmit() {
    if (this.form.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      const formData: CreatePropertyListDto = { title: this.form.value.title };

      const criteriaAreaValue = this.searchCriteriaGroup.get('area')?.value;
      if (this.criteriaExpanded() && criteriaAreaValue) {
        const c = this.searchCriteriaGroup.value;
        const searchCriteria: SearchCriteria = {
          area: c.area,
          bedrooms_min: c.bedrooms_min || undefined,
          bedrooms_max: c.bedrooms_max || undefined,
          price_min: c.price_min || undefined,
          price_max: c.price_max || undefined,
          radius: c.radius || undefined,
          property_types: c.property_types || undefined,
          max_days_since_added: c.max_days_since_added || undefined,
        };
        formData.search_criteria = searchCriteria;
      }

      this.submit.emit(formData);
    }
  }

  onCancel() {
    this.cancel.emit();
  }

  get isEditMode() {
    return !!this.list();
  }
}

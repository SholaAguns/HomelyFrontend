import { Component, output, input, effect } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SearchCriteria } from '../../models/property-models';

@Component({
  selector: 'app-search-criteria-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './search-criteria-form.component.html',
  styleUrl: './search-criteria-form.component.css',
})
export class SearchCriteriaFormComponent {
  private formBuilder = new FormBuilder();

  searchCriteria = input<SearchCriteria | null>(null);
  submitButtonText = input<string>('Create List');
  showCancelButton = input<boolean>(true);
  searchForm: FormGroup;
  searchSubmit = output<SearchCriteria>();
  cancel = output<void>();

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
    this.searchForm = this.formBuilder.group({
      area: ['', [Validators.required]],
      bedrooms_min: [null],
      bedrooms_max: [null],
      price_min: [null],
      price_max: [null],
      radius: [5],
      property_types: [''],
      max_days_since_added: [null],
    });

    effect(() => {
      const criteria = this.searchCriteria();
      if (criteria) {
        this.searchForm.patchValue({
          area: criteria.area || '',
          bedrooms_min: criteria.bedrooms_min || null,
          bedrooms_max: criteria.bedrooms_max || null,
          price_min: criteria.price_min || null,
          price_max: criteria.price_max || null,
          radius: criteria.radius || 5,
          property_types: criteria.property_types || '',
          max_days_since_added: criteria.max_days_since_added || null,
        });
      }
    });
  }

  onSubmit(): void {
    if (this.searchForm.valid) {
      const formValue = this.searchForm.value;

      const searchCriteria: SearchCriteria = {
        area: formValue.area,
        bedrooms_min: formValue.bedrooms_min || undefined,
        bedrooms_max: formValue.bedrooms_max || undefined,
        price_min: formValue.price_min || undefined,
        price_max: formValue.price_max || undefined,
        radius: formValue.radius || undefined,
        property_types: formValue.property_types || undefined,
        max_days_since_added: formValue.max_days_since_added || undefined,
      };

      this.searchSubmit.emit(searchCriteria);
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }

  get isFormValid(): boolean {
    return this.searchForm.valid;
  }
}

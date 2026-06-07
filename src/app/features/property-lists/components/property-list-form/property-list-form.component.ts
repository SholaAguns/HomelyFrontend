import { Component, inject, input, output, effect, signal, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  PropertyList,
  CreatePropertyListDto,
} from '../../../../shared/models/property-list-models';
import { SearchCriteria } from '../../../../shared/models/property-models';
import { SearchCriteriaFormComponent } from '../../../../shared/components/search-criteria-form/search-criteria-form.component';

@Component({
  selector: 'app-property-list-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SearchCriteriaFormComponent],
  templateUrl: './property-list-form.component.html',
  styleUrl: './property-list-form.component.css',
})
export class PropertyListFormComponent {
  private fb = inject(FormBuilder);

  list = input<PropertyList | null>(null);
  submit = output<CreatePropertyListDto>();
  cancel = output<void>();

  searchCriteriaFormRef = viewChild(SearchCriteriaFormComponent);

  form: FormGroup = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
  });

  criteriaExpanded = signal(false);
  isSubmitting = false;

  constructor() {
    effect(() => {
      const listValue = this.list();
      if (listValue) {
        this.form.patchValue({ title: listValue.title });
        if (listValue.search_criteria) {
          this.criteriaExpanded.set(true);
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

      const criteriaForm = this.searchCriteriaFormRef()?.searchForm;
      if (this.criteriaExpanded() && criteriaForm?.get('area')?.value) {
        const c = criteriaForm.value;
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

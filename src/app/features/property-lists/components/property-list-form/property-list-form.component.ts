import { Component, inject, input, output, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  PropertyList,
  CreatePropertyListDto,
  UpdatePropertyListDto,
} from '../../../../shared/models/property-list-models';

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
    rating_criteria: [null],
  });

  constructor() {
    effect(() => {
      const listValue = this.list();
      if (listValue) {
        this.form.patchValue({
          title: listValue.title,
          rating_criteria: listValue.rating_criteria,
        });
      }
    });
  }

  onSubmit() {
    if (this.form.valid) {
      this.submit.emit(this.form.value);
    }
  }

  onCancel() {
    this.cancel.emit();
  }

  get isEditMode() {
    return !!this.list();
  }
}

import { Component, input, output, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CreateSavedLocationDto } from '../../../../shared/models/saved-location-models';

export type SavedLocationFormMode = 'create' | 'edit';

@Component({
  selector: 'app-saved-location-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './saved-location-form.component.html',
  styleUrl: './saved-location-form.component.css',
})
export class SavedLocationFormComponent implements OnInit {
  private formBuilder = inject(FormBuilder);

  // Inputs
  initialData = input<Partial<CreateSavedLocationDto>>();
  mode = input<SavedLocationFormMode>('create');

  // Outputs
  formSubmit = output<CreateSavedLocationDto>();
  formCancel = output<void>();

  // State
  form!: FormGroup;
  loading = signal(false);

  ngOnInit() {
    this.initForm();
  }

  private initForm() {
    const data = this.initialData() || {};

    this.form = this.formBuilder.group({
      name: [data.name || '', Validators.required],
      postcode: [data.postcode || '', Validators.required],
      address_line_1: [data.address_line_1 || '', Validators.required],
      address_line_2: [data.address_line_2 || ''],
      city: [data.city || ''],
    });
  }

  onSubmit() {
    if (this.form.valid) {
      const formValue = this.form.value;
      const locationData: CreateSavedLocationDto = {
        name: formValue.name,
        postcode: formValue.postcode,
        address_line_1: formValue.address_line_1,
        address_line_2: formValue.address_line_2 || undefined,
        city: formValue.city || undefined,
      };
      this.formSubmit.emit(locationData);
    }
  }

  onCancel() {
    this.formCancel.emit();
  }

  get isValid() {
    return this.form.valid;
  }
}

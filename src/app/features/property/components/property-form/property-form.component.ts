import {
  Component,
  input,
  output,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CreatePropertyDto } from '../../../../shared/models/property-models';

export type PropertyFormMode = 'create' | 'edit' | 'review';

@Component({
  selector: 'app-property-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './property-form.component.html',
  styleUrl: './property-form.component.css',
})
export class PropertyFormComponent implements OnInit {
  private fb = inject(FormBuilder);

  // Inputs
  initialData = input<Partial<CreatePropertyDto>>();
  readOnly = input<boolean>(false);
  mode = input<PropertyFormMode>('create');
  propertyListUuid = input.required<string>();

  // Outputs
  formSubmit = output<CreatePropertyDto>();
  formCancel = output<void>();

  // State
  form!: FormGroup;
  loading = signal(false);

  furnishedStatusOptions = [
    { value: 'FURNISHED', label: 'Furnished' },
    { value: 'UNFURNISHED', label: 'Unfurnished' },
    { value: 'PART_FURNISHED', label: 'Part Furnished' },
  ];

  councilTaxBands = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  epcRatings = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

  ngOnInit() {
    this.initForm();
  }

  private initForm() {
    const data = this.initialData() || {};

    this.form = this.fb.group({
      title: [data.title || '', Validators.required],
      address_line_1: [data.address_line_1 || '', Validators.required],
      address_line_2: [data.address_line_2 || ''],
      city: [data.city || ''],
      postcode: [data.postcode || '', Validators.required],
      latitude: [data.latitude || null],
      longitude: [data.longitude || null],
      price: [
        data.price || null,
        [Validators.required, Validators.min(0)],
      ],
      bedrooms: [
        data.bedrooms || null,
        [Validators.required, Validators.min(0)],
      ],
      bathrooms: [
        data.bathrooms || null,
        [Validators.required, Validators.min(0)],
      ],
      square_area: [data.square_area || null, Validators.min(0)],
      garden: [data.garden ?? false],
      parking: [data.parking ?? false],
      furnished_status: [data.furnished_status || 'UNFURNISHED'],
      council_tax_band: [data.council_tax_band || ''],
      epc_rating: [data.epc_rating || ''],
      lease_length: [data.lease_length || null, Validators.min(0)],
      floor_level: [data.floor_level || null],
      child_suitable: [data.child_suitable ?? false],
      completion_date: [data.completion_date || null],
      external_id: [data.external_id || ''],
      external_url: [data.external_url || ''],
    });

    if (this.readOnly()) {
      this.form.disable();
    }
  }

  onSubmit() {
    if (this.form.valid && !this.readOnly()) {
      const formValue = this.form.value;
      const propertyData: CreatePropertyDto = {
        ...formValue,
        property_list: this.propertyListUuid(),
      };
      this.formSubmit.emit(propertyData);
    }
  }

  onCancel() {
    this.formCancel.emit();
  }

  get isValid() {
    return this.form.valid;
  }
}

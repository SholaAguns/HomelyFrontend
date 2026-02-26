import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PropertyService } from '../../../../../core/services/property-service/property.service';
import { PropertyStore } from '../../../store/property.store';
import { PropertyFormComponent } from '../../property-form/property-form.component';
import { CreateFromInputRequest } from '../../../../../shared/models/property-models';

type InputMode = 'url' | 'text';

@Component({
  selector: 'app-url-text-creation',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './url-text-creation.component.html',
  styleUrl: './url-text-creation.component.css',
})
export class UrlTextCreationComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private propertyService = inject(PropertyService);
  private propertyStore = inject(PropertyStore);

  // State
  propertyListUuid = signal<string>('');
  inputMode = signal<InputMode>('url');
  loading = signal(false);
  error = signal<string | null>(null);

  // Form
  inputForm!: FormGroup;

  ngOnInit() {
    const uuid = this.route.parent?.snapshot.paramMap.get('uuid');
    if (uuid) {
      this.propertyListUuid.set(uuid);
    }

    this.initInputForm();
  }

  private initInputForm() {
    this.inputForm = this.formBuilder.group({
      inputData: ['', Validators.required],
    });
  }

  toggleInputMode(mode: InputMode) {
    this.inputMode.set(mode);
    this.inputForm.reset();
    this.error.set(null);
  }

  onExtract() {
    if (!this.inputForm.valid) return;

    this.loading.set(true);
    this.error.set(null);

    const request: CreateFromInputRequest = {
      input_data: this.inputForm.value.inputData,
      input_type: this.inputMode(),
      property_list_uuid: this.propertyListUuid(),
    };

    this.propertyService.createFromInput(request).subscribe({
      next: (response) => {
        this.loading.set(false);

        if (response.success && response.property) {
          // Add property to store
          this.propertyStore.addProperty(response.property);

          // Navigate to property detail page
          this.router.navigate([
            '/lists',
            this.propertyListUuid(),
            'properties',
            response.property.uuid,
          ]);
        } else {
          this.error.set(response.message || 'Failed to create property');
        }
      },
      error: (error) => {
        this.loading.set(false);
        this.error.set(error.message || 'Failed to create property');
      },
    });
  }

  onCancel() {
    this.router.navigate(['/lists', this.propertyListUuid()]);
  }
}

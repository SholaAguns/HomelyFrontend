import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PropertyService } from '../../../../../core/services/property-service/property.service';
import { PropertyStore } from '../../../store/property.store';
import { PropertyFormComponent } from '../../property-form/property-form.component';
import {
  DeduplicationWarningComponent,
  DeduplicationAction,
} from '../../deduplication-warning/deduplication-warning.component';
import {
  CreatePropertyDto,
  CreateFromInputRequest,
  Property,
} from '../../../../../shared/models/property-models';

type ExtractionStep = 'input' | 'review';
type InputMode = 'url' | 'text';

@Component({
  selector: 'app-url-text-creation',
  standalone: true,
  imports: [
    CommonModule,
    PropertyFormComponent,
    ReactiveFormsModule,
    DeduplicationWarningComponent,
  ],
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
  currentStep = signal<ExtractionStep>('input');
  inputMode = signal<InputMode>('url');
  loading = signal(false);
  error = signal<string | null>(null);
  extractedData = signal<Partial<CreatePropertyDto> | undefined>(undefined);
  duplicateProperty = signal<Property | null>(null);
  showDuplicateModal = signal(false);

  // Form
  inputForm!: FormGroup;

  ngOnInit() {
    const uuid = this.route.parent?.parent?.snapshot.paramMap.get('uuid');
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

        if (response.success && response.property_data) {
          this.extractedData.set(response.property_data);

          // Check for duplicates if external_id exists
          if (response.property_data.external_id) {
            const duplicate = this.propertyStore.checkDuplicate(response.property_data.external_id);
            if (duplicate) {
              this.duplicateProperty.set(duplicate);
              this.showDuplicateModal.set(true);
              return;
            }
          }

          this.currentStep.set('review');
        } else {
          this.error.set(response.message || 'Failed to extract property data');
        }
      },
      error: (error) => {
        this.loading.set(false);
        this.error.set(error.message || 'Failed to extract property data');
      },
    });
  }

  onFormSubmit(propertyData: CreatePropertyDto) {
    this.loading.set(true);
    this.error.set(null);

    this.propertyService.create(propertyData).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/lists', this.propertyListUuid()]);
      },
      error: (error) => {
        this.loading.set(false);
        this.error.set(error.message || 'Failed to create property');
      },
    });
  }

  onFormCancel() {
    if (this.currentStep() === 'review') {
      // Go back to input step
      this.currentStep.set('input');
      this.extractedData.set(undefined);
      this.error.set(null);
    } else {
      // Navigate back to property list
      this.router.navigate(['/lists', this.propertyListUuid()]);
    }
  }

  onDeduplicationAction(action: DeduplicationAction) {
    this.showDuplicateModal.set(false);

    switch (action) {
      case 'view': {
        // Navigate to existing property
        const duplicate = this.duplicateProperty();
        if (duplicate) {
          this.router.navigate(['/lists', this.propertyListUuid(), 'properties', duplicate.uuid]);
        }
        break;
      }

      case 'force_create':
        // Proceed to review step anyway
        this.currentStep.set('review');
        break;

      case 'cancel':
        // Reset to input step
        this.currentStep.set('input');
        this.extractedData.set(undefined);
        this.duplicateProperty.set(null);
        break;
    }
  }
}

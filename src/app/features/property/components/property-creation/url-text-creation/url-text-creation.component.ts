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
  CreateFromInputRequest,
  CreatePropertyDto,
  Property,
} from '../../../../../shared/models/property-models';

type InputMode = 'url' | 'text';
type Step = 'input' | 'review';

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
  currentStep = signal<Step>('input');
  extractedData = signal<CreatePropertyDto | undefined>(undefined);
  showDuplicateModal = signal(false);
  duplicateProperty = signal<Property | null>(null);

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

        if (response.success && response.property) {
          const extractedPropertyDto = this.mapPropertyToCreateDto(response.property);

          if (extractedPropertyDto.external_id) {
            const duplicateProperty = this.propertyStore.checkDuplicate(
              extractedPropertyDto.external_id
            );
            if (duplicateProperty) {
              this.duplicateProperty.set(duplicateProperty);
              this.showDuplicateModal.set(true);
              return;
            }
          }

          this.extractedData.set(extractedPropertyDto);
          this.currentStep.set('review');
        } else {
          this.error.set(response.message || 'Extraction failed');
        }
      },
      error: (err) => {
        this.loading.set(false);
        const errorMessage = err.error?.message || err.message || 'Failed to create property';
        this.error.set(errorMessage);
      },
    });
  }

  onFormSubmit(data: CreatePropertyDto) {
    this.loading.set(true);
    this.error.set(null);

    this.propertyService.create(data).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/lists', this.propertyListUuid()]);
      },
      error: (err) => {
        this.loading.set(false);
        const errorMessage = err.error?.message || err.message || 'Failed to create property';
        this.error.set(errorMessage);
      },
    });
  }

  onFormCancel() {
    if (this.currentStep() === 'review') {
      this.currentStep.set('input');
      this.extractedData.set(undefined);
      this.error.set(null);
    } else {
      this.router.navigate(['/lists', this.propertyListUuid()]);
    }
  }

  onDeduplicationAction(action: DeduplicationAction) {
    this.showDuplicateModal.set(false);

    if (action === 'view') {
      const duplicateProperty = this.duplicateProperty();
      if (duplicateProperty) {
        this.router.navigate([
          '/lists',
          this.propertyListUuid(),
          'properties',
          duplicateProperty.uuid,
        ]);
      }
    } else if (action === 'force_create') {
      this.currentStep.set('review');
    } else if (action === 'cancel') {
      this.currentStep.set('input');
      this.extractedData.set(undefined);
      this.duplicateProperty.set(null);
    }
  }

  private mapPropertyToCreateDto(property: Property): CreatePropertyDto {
    return {
      property_lists_input: [this.propertyListUuid()],
      title: property.title,
      address_line_1: property.address_line_1,
      address_line_2: property.address_line_2,
      city: property.city,
      postcode: property.postcode,
      latitude: property.latitude,
      longitude: property.longitude,
      price: property.price,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      square_area: property.square_area,
      garden: property.garden,
      parking: property.parking,
      furnished_status: property.furnished_status,
      council_tax_band: property.council_tax_band,
      epc_rating: property.epc_rating,
      lease_length: property.lease_length,
      floor_level: property.floor_level,
      child_suitable: property.child_suitable,
      completion_date: property.completion_date,
      external_id: property.external_id || undefined,
      external_url: property.external_url || undefined,
    };
  }
}

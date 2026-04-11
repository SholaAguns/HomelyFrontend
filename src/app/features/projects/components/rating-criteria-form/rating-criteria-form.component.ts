import { Component, inject, OnInit, effect, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RatingCriteriaStore } from '../../store/rating-criteria.store';
import {
  Criterion,
  RatingCriteria,
  WEIGHT_LABELS,
  WEIGHT_VALUES,
} from '../../../../shared/models/rating-criteria.models';
import { PoiType, POI_TYPE_LABELS } from '../../../../shared/models/context-options.models';
import { SavedLocation } from '../../../../shared/models/saved-location-models';
import { SavedLocationService } from '../../../../core/services/saved-location.service';

@Component({
  selector: 'app-rating-criteria-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './rating-criteria-form.component.html',
  styleUrl: './rating-criteria-form.component.css',
})
export class RatingCriteriaFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  protected ratingCriteriaStore = inject(RatingCriteriaStore);
  private savedLocationService = inject(SavedLocationService);

  uuid = signal<string | null>(null);
  isEditMode = signal(false);
  projectUuid = signal<string | null>(null);
  loadingSavedLocations = signal(false);
  availableSavedLocations = signal<SavedLocation[]>([]);
  selectedSavedLocationUuids = signal<string[]>([]);

  isPOITypeEnabled = signal<boolean>(false);
  isSavedLocationTypeEnabled = signal<boolean>(false);

  private formPatched = signal<boolean>(false);
  private previousSaving = signal<boolean>(false);

  readonly weightLabels = WEIGHT_LABELS;
  readonly weightValues = WEIGHT_VALUES;

  // System criteria (built-in) - enabled by default
  defaultCriteria = signal<Criterion[]>([
    {
      name: 'Price',
      source: 'property',
      field_name: 'price',
      enabled: true,
      weight: 1.0,
      is_dealbreaker: false,
    },
    {
      name: 'Bedrooms',
      source: 'property',
      field_name: 'bedrooms',
      enabled: true,
      weight: 1.0,
      is_dealbreaker: false,
    },
    {
      name: 'Bathrooms',
      source: 'property',
      field_name: 'bathrooms',
      enabled: true,
      weight: 1.0,
      is_dealbreaker: false,
    },
  ]);

  // User criteria (configurable) - disabled by default
  additionalCriteria = signal<Criterion[]>([
    {
      name: 'Garden',
      source: 'property',
      field_name: 'garden',
      enabled: false,
      weight: 0.5,
      is_dealbreaker: false,
    },
    {
      name: 'Council Tax Band',
      source: 'context_report',
      field_name: 'council_tax',
      enabled: true,
      weight: 0.5,
      is_dealbreaker: false,
    },
    {
      name: 'Crime Rating',
      source: 'context_report',
      field_name: 'crime',
      enabled: true,
      weight: 1.0,
      is_dealbreaker: false,
    },
    {
      name: 'Broadband Speed',
      source: 'context_report',
      field_name: 'broadband',
      enabled: false,
      weight: 0.5,
      is_dealbreaker: false,
    },
    {
      name: 'Mobile Coverage',
      source: 'context_report',
      field_name: 'mobile',
      enabled: false,
      weight: 0.5,
      is_dealbreaker: false,
    },
    {
      name: 'School Rating',
      source: 'context_report',
      field_name: 'schools',
      enabled: false,
      weight: 0.5,
      is_dealbreaker: false,
    },
  ]);

  savedLocationCriteria = signal<Criterion[]>([]);
  poiCriteria = signal<Criterion[]>([]);
  selectedPoiCategories = signal<string[]>([]);

  readonly POI_TYPE_LABELS = POI_TYPE_LABELS;
  readonly poiTypeKeys = Object.keys(POI_TYPE_LABELS) as PoiType[];

  form: FormGroup = this.fb.group({
    name: ['', Validators.required],
  });

  saving = computed(() => this.ratingCriteriaStore.saving());
  error = computed(() => this.ratingCriteriaStore.error());

  constructor() {
    effect(() => {
      const uuid = this.uuid();
      if (uuid && !this.formPatched()) {
        const criteria = this.ratingCriteriaStore.getByUuid()(uuid);
        if (criteria) {
          this.formPatched.set(true);
          this.patchForm(criteria);
        }
      }
    });

    effect(() => {
      const currentSaving = this.ratingCriteriaStore.saving();
      const currentError = this.ratingCriteriaStore.error();

      if (this.previousSaving() && !currentSaving && !currentError) {
        const projectUuid = this.projectUuid();
        if (projectUuid) {
          this.router.navigate(['/projects', projectUuid, 'settings']);
        } else {
          this.router.navigate(['/projects']);
        }
      }

      this.previousSaving.set(currentSaving);
    });
  }

  ngOnInit(): void {
    const uuid = this.route.snapshot.paramMap.get('uuid');
    const projectUuid = this.route.snapshot.queryParamMap.get('project');

    if (uuid) {
      this.uuid.set(uuid);
      this.isEditMode.set(true);
      this.ratingCriteriaStore.loadById(uuid);
    }
    // In create mode, system criteria already have enabled: true by default

    if (projectUuid) {
      this.projectUuid.set(projectUuid);
    }

    this.loadSavedLocations();
  }

  private loadSavedLocations(): void {
    this.loadingSavedLocations.set(true);
    this.savedLocationService.getAll().subscribe({
      next: (locations) => {
        this.availableSavedLocations.set(locations);
        this.loadingSavedLocations.set(false);
      },
      error: (err) => {
        console.error('Error loading saved locations:', err);
        this.loadingSavedLocations.set(false);
      },
    });
  }

  private patchForm(criteria: RatingCriteria): void {
    this.form.patchValue({
      name: criteria.name,
    });

    // Update criterion properties from loaded data
    criteria.criteria.forEach((criterion: Criterion) => {
      // Ensure weight is a number
      const normalizedCriterion: Criterion = {
        ...criterion,
        weight: Number(criterion.weight),
        is_dealbreaker: Boolean(criterion.is_dealbreaker),
        enabled: Boolean(criterion.enabled),
      };

      // Check if it's a saved location criterion
      if (
        criterion.source === 'context_report' &&
        criterion.field_name === 'saved_locations' &&
        criterion.saved_location_uuid
      ) {
        this.savedLocationCriteria.update((list) => [...list, normalizedCriterion]);
        this.selectedSavedLocationUuids.update((uuids) => [
          ...uuids,
          criterion.saved_location_uuid!,
        ]);
        this.isSavedLocationTypeEnabled.set(true);
        return;
      }

      // Check if it's a POI criterion
      if (
        criterion.source === 'context_report' &&
        criterion.field_name === 'poi' &&
        criterion.poi_category
      ) {
        this.poiCriteria.update((list) => [...list, normalizedCriterion]);
        this.selectedPoiCategories.update((categories) => [...categories, criterion.poi_category!]);
        this.isPOITypeEnabled.set(true);
        return;
      }

      // Find in default criteria
      const defaultIndex = this.defaultCriteria().findIndex((c) => c.name === criterion.name);
      if (defaultIndex >= 0) {
        this.defaultCriteria.update((list) => {
          const updated = [...list];
          updated[defaultIndex] = { ...updated[defaultIndex], ...normalizedCriterion };
          return updated;
        });
      }

      // Find in user criteria
      const additonalIndex = this.additionalCriteria().findIndex((c) => c.name === criterion.name);
      if (additonalIndex >= 0) {
        this.additionalCriteria.update((list) => {
          const updated = [...list];
          updated[additonalIndex] = { ...updated[additonalIndex], ...normalizedCriterion };
          return updated;
        });
      }
    });
  }

  get availableLocationsForSelection(): SavedLocation[] {
    return this.availableSavedLocations().filter(
      (loc) => !this.selectedSavedLocationUuids().includes(loc.uuid)
    );
  }

  getSelectedLocation(uuid: string): SavedLocation | undefined {
    return this.availableSavedLocations().find((loc) => loc.uuid === uuid);
  }

  addSavedLocationCriterion(uuid: string, name: string): void {
    console.log(`Adding ${name}`);
    console.log(`Addig id ${uuid}`);

    let savedLocationCriterion: Criterion = {
      name: 'Distance to ' + name,
      source: 'context_report',
      field_name: 'saved_locations',
      saved_location_uuid: uuid,
      enabled: true,
      weight: 1.0,
      is_dealbreaker: false,
    };
    console.log('Saved Location Criterion:');
    console.log('%j', savedLocationCriterion);

    this.savedLocationCriteria.update((list) => [...list, savedLocationCriterion]);
    this.selectedSavedLocationUuids.update((uuids) => [...uuids, uuid]);
  }

  removeSavedLocationCriterion(uuid: string): void {
    this.savedLocationCriteria.update((criteria) =>
      criteria.filter((c) => c.saved_location_uuid !== uuid)
    );
    this.selectedSavedLocationUuids.update((uuids) => uuids.filter((id) => id !== uuid));
  }

  get availablePoiTypesForSelection(): PoiType[] {
    return this.poiTypeKeys.filter((type) => !this.selectedPoiCategories().includes(type));
  }

  addPoiCriterion(poiCategory: PoiType): void {
    const poiCriterion: Criterion = {
      name: `Distance to ${POI_TYPE_LABELS[poiCategory]}`,
      source: 'context_report',
      field_name: 'poi',
      poi_category: poiCategory,
      enabled: true,
      weight: 1.0,
      is_dealbreaker: false,
    };

    this.poiCriteria.update((list) => [...list, poiCriterion]);
    this.selectedPoiCategories.update((categories) => [...categories, poiCategory]);
  }

  removePoiCriterion(poiCategory: string): void {
    this.poiCriteria.update((criteria) => criteria.filter((c) => c.poi_category !== poiCategory));
    this.selectedPoiCategories.update((categories) =>
      categories.filter((cat) => cat !== poiCategory)
    );
  }

  updateCriterionWeight(criterion: Criterion, weight: number, criterionListType: string): void {
    switch (criterionListType) {
      case 'default':
        this.defaultCriteria.update((list) =>
          list.map((c) => (c.name === criterion.name ? { ...c, weight } : c))
        );
        break;
      case 'additional':
        this.additionalCriteria.update((list) =>
          list.map((c) => (c.name === criterion.name ? { ...c, weight } : c))
        );
        break;
      case 'savedLocation':
        this.savedLocationCriteria.update((list) =>
          list.map((c) => (c.name === criterion.name ? { ...c, weight } : c))
        );
        break;
      case 'poi':
        this.poiCriteria.update((list) =>
          list.map((c) => (c.name === criterion.name ? { ...c, weight } : c))
        );
        break;
    }
  }

  updateCriterionDealbreaker(
    criterion: Criterion,
    isDealbreaker: boolean,
    criterionListType: string
  ): void {
    switch (criterionListType) {
      case 'default':
        this.defaultCriteria.update((list) =>
          list.map((c) => (c.name === criterion.name ? { ...c, is_dealbreaker: isDealbreaker } : c))
        );
        break;
      case 'additional':
        this.additionalCriteria.update((list) =>
          list.map((c) => (c.name === criterion.name ? { ...c, is_dealbreaker: isDealbreaker } : c))
        );
        break;
      case 'savedLocation':
        this.savedLocationCriteria.update((list) =>
          list.map((c) => (c.name === criterion.name ? { ...c, is_dealbreaker: isDealbreaker } : c))
        );
        break;
      case 'poi':
        this.poiCriteria.update((list) =>
          list.map((c) => (c.name === criterion.name ? { ...c, is_dealbreaker: isDealbreaker } : c))
        );
        break;
    }
  }

  toggleCriterionEnabled(criterion: Criterion, isDefault: boolean): void {
    if (isDefault) {
      this.defaultCriteria.update((list) =>
        list.map((c) => (c.name === criterion.name ? { ...c, enabled: !c.enabled } : c))
      );
    } else {
      this.additionalCriteria.update((list) =>
        list.map((c) => (c.name === criterion.name ? { ...c, enabled: !c.enabled } : c))
      );
    }
  }

  toggleIsPOITypeEnabled(): void {
    this.isPOITypeEnabled.set(!this.isPOITypeEnabled());
  }

  toggleIsSavedLocationTypeEnabled(): void {
    this.isSavedLocationTypeEnabled.set(!this.isSavedLocationTypeEnabled());
  }

  isCriterionEnabled(criterion: Criterion): boolean {
    return criterion.enabled;
  }

  onSubmit(): void {
    if (!this.form.valid) {
      return;
    }

    // Send all criteria (both enabled and disabled)
    const allCriteria = [
      ...this.defaultCriteria(),
      ...this.additionalCriteria(),
      ...this.savedLocationCriteria(),
      ...this.poiCriteria(),
    ];

    const data = {
      name: this.form.value.name,
      criteria: allCriteria.map((c) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id: _id, created_at: _created_at, updated_at: _updated_at, ...rest } = c;
        return rest;
      }),
    };

    if (this.isEditMode()) {
      this.ratingCriteriaStore.update({ uuid: this.uuid()!, data });
    } else {
      this.ratingCriteriaStore.create(data);
    }
  }

  onCancel(): void {
    const projectUuid = this.projectUuid();
    if (projectUuid) {
      this.router.navigate(['/projects', projectUuid, 'settings']);
    } else {
      this.router.navigate(['/projects']);
    }
  }
}

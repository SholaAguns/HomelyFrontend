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
  SCORING_STRATEGY_LABELS,
} from '../../../../shared/models/rating-criteria.models';

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

  uuid = signal<string | null>(null);
  isEditMode = signal(false);
  projectUuid = signal<string | null>(null);

  readonly weightLabels = WEIGHT_LABELS;
  readonly weightValues = WEIGHT_VALUES;
  readonly scoringStrategyLabels = SCORING_STRATEGY_LABELS;

  // System criteria (built-in) - enabled by default
  systemCriteria = signal<Criterion[]>([
    {
      name: 'Price',
      source: 'property',
      field_name: 'price',
      scoring_strategy: 'inverted',
      enabled: true,
      weight: 1.0,
      is_dealbreaker: false,
    },
    {
      name: 'Bedrooms',
      source: 'property',
      field_name: 'bedrooms',
      scoring_strategy: 'min_max',
      enabled: true,
      weight: 1.0,
      is_dealbreaker: false,
    },
    {
      name: 'Bathrooms',
      source: 'property',
      field_name: 'bathrooms',
      scoring_strategy: 'min_max',
      enabled: true,
      weight: 1.0,
      is_dealbreaker: false,
    },
    {
      name: 'Council Tax Band',
      source: 'context',
      field_name: 'council_tax_band',
      scoring_strategy: 'ordinal',
      ordinal_mapping: { A: 100, B: 90, C: 80, D: 70, E: 60, F: 50, G: 40, H: 30 },
      enabled: true,
      weight: 0.5,
      is_dealbreaker: false,
    },
    {
      name: 'Crime Rating',
      source: 'context',
      field_name: 'crime',
      data_path: 'rating',
      scoring_strategy: 'ordinal',
      ordinal_mapping: { Low: 100, Medium: 50, High: 0 },
      enabled: true,
      weight: 1.0,
      is_dealbreaker: false,
    },
    {
      name: 'EPC Rating',
      source: 'property',
      field_name: 'epc_rating',
      scoring_strategy: 'ordinal',
      ordinal_mapping: { A: 100, B: 90, C: 80, D: 70, E: 60, F: 50, G: 40 },
      enabled: true,
      weight: 0.5,
      is_dealbreaker: false,
    },
    {
      name: 'Square Area',
      source: 'property',
      field_name: 'square_area',
      scoring_strategy: 'min_max',
      enabled: true,
      weight: 0.5,
      is_dealbreaker: false,
    },
  ]);

  // User criteria (configurable) - disabled by default
  userCriteria = signal<Criterion[]>([
    {
      name: 'Garden',
      source: 'property',
      field_name: 'garden',
      scoring_strategy: 'boolean',
      boolean_true_is_better: true,
      enabled: false,
      weight: 0.5,
      is_dealbreaker: false,
    },
    {
      name: 'Furnished Status',
      source: 'property',
      field_name: 'furnished_status',
      scoring_strategy: 'boolean',
      boolean_true_is_better: true,
      enabled: false,
      weight: 0.5,
      is_dealbreaker: false,
    },
    {
      name: 'Child Suitable',
      source: 'property',
      field_name: 'child_suitable',
      scoring_strategy: 'boolean',
      boolean_true_is_better: true,
      enabled: false,
      weight: 0.5,
      is_dealbreaker: false,
    },
    {
      name: 'Broadband Speed',
      source: 'context',
      field_name: 'broadband',
      data_path: 'avg_download_speed',
      scoring_strategy: 'min_max',
      enabled: false,
      weight: 0.5,
      is_dealbreaker: false,
    },
    {
      name: 'Mobile Coverage',
      source: 'context',
      field_name: 'mobile',
      data_path: 'scores.overall',
      scoring_strategy: 'ordinal',
      ordinal_mapping: { Excellent: 100, Good: 75, Fair: 50, Poor: 25, None: 0 },
      enabled: false,
      weight: 0.5,
      is_dealbreaker: false,
    },
    {
      name: 'School Rating',
      source: 'context',
      field_name: 'schools',
      data_path: 'ofsted_rating',
      scoring_strategy: 'ordinal',
      ordinal_mapping: { Outstanding: 100, Good: 75, 'Requires Improvement': 50, Inadequate: 25 },
      enabled: false,
      weight: 0.5,
      is_dealbreaker: false,
    },
    {
      name: 'Parking',
      source: 'property',
      field_name: 'parking',
      scoring_strategy: 'boolean',
      boolean_true_is_better: true,
      enabled: false,
      weight: 0.5,
      is_dealbreaker: false,
    },
    {
      name: 'Distance to Saved Location',
      source: 'calculated',
      field_name: 'saved_locations',
      data_path: 'closest_location.distance_km',
      scoring_strategy: 'inverted',
      enabled: false,
      weight: 1.0,
      is_dealbreaker: false,
    },
    {
      name: 'Energy Efficiency',
      source: 'property',
      field_name: 'epc_rating',
      scoring_strategy: 'min_max',
      enabled: false,
      weight: 0.5,
      is_dealbreaker: false,
    },
    {
      name: 'Lease Length',
      source: 'property',
      field_name: 'lease_length',
      scoring_strategy: 'min_max',
      enabled: false,
      weight: 0.5,
      is_dealbreaker: false,
    },
    {
      name: 'Floor Level',
      source: 'property',
      field_name: 'floor_level',
      scoring_strategy: 'min_max',
      enabled: false,
      weight: 0.5,
      is_dealbreaker: false,
    },
  ]);

  form: FormGroup = this.fb.group({
    name: ['', Validators.required],
  });

  saving = computed(() => this.ratingCriteriaStore.saving());
  error = computed(() => this.ratingCriteriaStore.error());

  private formPatched = false;
  private previousSaving = false;

  constructor() {
    effect(() => {
      const uuid = this.uuid();
      if (uuid && !this.formPatched) {
        const criteria = this.ratingCriteriaStore.getByUuid()(uuid);
        if (criteria) {
          this.formPatched = true;
          this.patchForm(criteria);
        }
      }
    });

    effect(() => {
      const currentSaving = this.ratingCriteriaStore.saving();
      const currentError = this.ratingCriteriaStore.error();

      if (this.previousSaving && !currentSaving && !currentError) {
        const projectUuid = this.projectUuid();
        if (projectUuid) {
          this.router.navigate(['/projects', projectUuid, 'settings']);
        } else {
          this.router.navigate(['/projects']);
        }
      }

      this.previousSaving = currentSaving;
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

      // Find in system criteria
      const systemIndex = this.systemCriteria().findIndex((c) => c.name === criterion.name);
      if (systemIndex >= 0) {
        this.systemCriteria.update((list) => {
          const updated = [...list];
          updated[systemIndex] = { ...updated[systemIndex], ...normalizedCriterion };
          return updated;
        });
      }

      // Find in user criteria
      const userIndex = this.userCriteria().findIndex((c) => c.name === criterion.name);
      if (userIndex >= 0) {
        this.userCriteria.update((list) => {
          const updated = [...list];
          updated[userIndex] = { ...updated[userIndex], ...normalizedCriterion };
          return updated;
        });
      }
    });
  }

  updateCriterionWeight(criterion: Criterion, weight: number, isSystem: boolean): void {
    if (isSystem) {
      this.systemCriteria.update((list) =>
        list.map((c) => (c.name === criterion.name ? { ...c, weight } : c))
      );
    } else {
      this.userCriteria.update((list) =>
        list.map((c) => (c.name === criterion.name ? { ...c, weight } : c))
      );
    }
  }

  updateCriterionDealbreaker(
    criterion: Criterion,
    isDealbreaker: boolean,
    isSystem: boolean
  ): void {
    if (isSystem) {
      this.systemCriteria.update((list) =>
        list.map((c) => (c.name === criterion.name ? { ...c, is_dealbreaker: isDealbreaker } : c))
      );
    } else {
      this.userCriteria.update((list) =>
        list.map((c) => (c.name === criterion.name ? { ...c, is_dealbreaker: isDealbreaker } : c))
      );
    }
  }

  toggleCriterionEnabled(criterion: Criterion, isSystem: boolean): void {
    if (isSystem) {
      this.systemCriteria.update((list) =>
        list.map((c) => (c.name === criterion.name ? { ...c, enabled: !c.enabled } : c))
      );
    } else {
      this.userCriteria.update((list) =>
        list.map((c) => (c.name === criterion.name ? { ...c, enabled: !c.enabled } : c))
      );
    }
  }

  isCriterionEnabled(criterion: Criterion): boolean {
    return criterion.enabled;
  }

  onSubmit(): void {
    if (!this.form.valid) {
      return;
    }

    // Send all criteria (both enabled and disabled)
    const allCriteria = [...this.systemCriteria(), ...this.userCriteria()];

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

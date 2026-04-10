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

  // System criteria (built-in) - enabled by default
  systemCriteria = signal<Criterion[]>([
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
  userCriteria = signal<Criterion[]>([
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
    {
      name: 'Distance to a Saved Location',
      source: 'context_report',
      field_name: 'saved_locations',
      enabled: false,
      weight: 1.0,
      is_dealbreaker: false,
    },
    {
      name: 'Distance to a Place of Interest',
      source: 'context_report',
      field_name: 'saved_locations',
      enabled: false,
      weight: 1.0,
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

import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Criterion,
  WEIGHT_LABELS,
  WEIGHT_VALUES,
} from '../../../../../../shared/models/rating-criteria.models';

@Component({
  selector: 'app-bathrooms-criterion',
  imports: [CommonModule],
  templateUrl: './bathrooms-criterion.html',
  styleUrl: './bathrooms-criterion.css',
})
export class BathroomsCriterion {
  bathroomsCriterion = input.required<Criterion>();
  bathroomsCriterionChanges = output<Criterion>();

  defaultCriterion = signal<Criterion>({
    name: 'Bathrooms',
    source: 'property',
    field_name: 'bathrooms',
    enabled: true,
    weight: 1.0,
    is_dealbreaker: false,
  });

  protected readonly weightLabels = WEIGHT_LABELS;
  protected readonly weightValues = WEIGHT_VALUES;

  isCriterionEnabled(criterion: Criterion): boolean {
    return criterion.enabled;
  }

  toggleCriterionEnabled(): void {
    const current = this.bathroomsCriterion();

    const updated: Criterion = {
      ...current,
      enabled: !current.enabled,
    };

    this.bathroomsCriterionChanges.emit(updated);
  }

  updateCriterionWeight(weight: number): void {
    const current = this.bathroomsCriterion();

    const updated: Criterion = {
      ...current,
      weight: weight,
    };

    this.bathroomsCriterionChanges.emit(updated);
  }

  updateCriterionIsDealbreaker(isDealbreaker: boolean): void {
    const current = this.bathroomsCriterion();

    const updated: Criterion = {
      ...current,
      is_dealbreaker: isDealbreaker,
    };

    this.bathroomsCriterionChanges.emit(updated);
  }
}

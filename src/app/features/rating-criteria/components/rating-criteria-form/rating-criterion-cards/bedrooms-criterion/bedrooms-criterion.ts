import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Criterion,
  WEIGHT_LABELS,
  WEIGHT_VALUES,
} from '../../../../../../shared/models/rating-criteria.models';

@Component({
  selector: 'app-bedrooms-criterion',
  imports: [CommonModule],
  templateUrl: './bedrooms-criterion.html',
  styleUrl: './bedrooms-criterion.css',
})
export class BedroomsCriterion {
  bedroomsCriterion = input.required<Criterion>();
  bedroomsCriterionChanges = output<Criterion>();

  defaultCriterion = signal<Criterion>({
    name: 'Bedrooms',
    source: 'property',
    field_name: 'bedrooms',
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
    const current = this.bedroomsCriterion();

    const updated: Criterion = {
      ...current,
      enabled: !current.enabled,
    };

    this.bedroomsCriterionChanges.emit(updated);
  }

  updateCriterionWeight(weight: number): void {
    const current = this.bedroomsCriterion();

    const updated: Criterion = {
      ...current,
      weight: weight,
    };

    this.bedroomsCriterionChanges.emit(updated);
  }

  updateCriterionIsDealbreaker(isDealbreaker: boolean): void {
    const current = this.bedroomsCriterion();

    const updated: Criterion = {
      ...current,
      is_dealbreaker: isDealbreaker,
    };

    this.bedroomsCriterionChanges.emit(updated);
  }
}

import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Criterion,
  WEIGHT_LABELS,
  WEIGHT_VALUES,
} from '../../../../../../shared/models/rating-criteria.models';

@Component({
  selector: 'app-garden-criterion',
  imports: [CommonModule],
  templateUrl: './garden-criterion.html',
  styleUrl: './garden-criterion.css',
})
export class GardenCriterion {
  gardenCriterion = input.required<Criterion>();
  gardenCriterionChanges = output<Criterion>();

  protected readonly weightLabels = WEIGHT_LABELS;
  protected readonly weightValues = WEIGHT_VALUES;

  isCriterionEnabled(criterion: Criterion): boolean {
    return criterion.enabled;
  }

  toggleCriterionEnabled(): void {
    const current = this.gardenCriterion();
    const updated: Criterion = { ...current, enabled: !current.enabled };
    this.gardenCriterionChanges.emit(updated);
  }

  updateCriterionWeight(weight: number): void {
    const current = this.gardenCriterion();
    const updated: Criterion = { ...current, weight };
    this.gardenCriterionChanges.emit(updated);
  }

  updateCriterionIsDealbreaker(isDealbreaker: boolean): void {
    const current = this.gardenCriterion();
    const updated: Criterion = { ...current, is_dealbreaker: isDealbreaker };
    this.gardenCriterionChanges.emit(updated);
  }
}

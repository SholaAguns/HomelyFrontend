import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Criterion,
  WEIGHT_LABELS,
  WEIGHT_VALUES,
} from '../../../../../../shared/models/rating-criteria.models';

@Component({
  selector: 'app-crime-criterion',
  imports: [CommonModule],
  templateUrl: './crime-criterion.html',
  styleUrl: './crime-criterion.css',
})
export class CrimeCriterion {
  crimeCriterion = input.required<Criterion>();
  crimeCriterionChanges = output<Criterion>();

  protected readonly weightLabels = WEIGHT_LABELS;
  protected readonly weightValues = WEIGHT_VALUES;

  isCriterionEnabled(criterion: Criterion): boolean {
    return criterion.enabled;
  }

  toggleCriterionEnabled(): void {
    const current = this.crimeCriterion();
    this.crimeCriterionChanges.emit({ ...current, enabled: !current.enabled });
  }

  updateCriterionWeight(weight: number): void {
    this.crimeCriterionChanges.emit({ ...this.crimeCriterion(), weight });
  }

  updateCriterionIsDealbreaker(isDealbreaker: boolean): void {
    this.crimeCriterionChanges.emit({ ...this.crimeCriterion(), is_dealbreaker: isDealbreaker });
  }
}

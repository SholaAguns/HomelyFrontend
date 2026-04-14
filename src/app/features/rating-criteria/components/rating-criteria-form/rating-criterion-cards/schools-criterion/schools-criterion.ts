import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Criterion,
  WEIGHT_LABELS,
  WEIGHT_VALUES,
} from '../../../../../../shared/models/rating-criteria.models';

@Component({
  selector: 'app-schools-criterion',
  imports: [CommonModule],
  templateUrl: './schools-criterion.html',
  styleUrl: './schools-criterion.css',
})
export class SchoolsCriterion {
  schoolsCriterion = input.required<Criterion>();
  schoolsCriterionChanges = output<Criterion>();

  protected readonly weightLabels = WEIGHT_LABELS;
  protected readonly weightValues = WEIGHT_VALUES;

  isCriterionEnabled(criterion: Criterion): boolean {
    return criterion.enabled;
  }

  toggleCriterionEnabled(): void {
    const current = this.schoolsCriterion();
    this.schoolsCriterionChanges.emit({ ...current, enabled: !current.enabled });
  }

  updateCriterionWeight(weight: number): void {
    this.schoolsCriterionChanges.emit({ ...this.schoolsCriterion(), weight });
  }

  updateCriterionIsDealbreaker(isDealbreaker: boolean): void {
    this.schoolsCriterionChanges.emit({
      ...this.schoolsCriterion(),
      is_dealbreaker: isDealbreaker,
    });
  }
}

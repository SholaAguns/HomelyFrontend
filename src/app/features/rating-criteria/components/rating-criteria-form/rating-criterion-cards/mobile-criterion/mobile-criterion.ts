import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Criterion,
  WEIGHT_LABELS,
  WEIGHT_VALUES,
} from '../../../../../../shared/models/rating-criteria.models';

@Component({
  selector: 'app-mobile-criterion',
  imports: [CommonModule],
  templateUrl: './mobile-criterion.html',
  styleUrl: './mobile-criterion.css',
})
export class MobileCriterion {
  mobileCriterion = input.required<Criterion>();
  mobileCriterionChanges = output<Criterion>();

  protected readonly weightLabels = WEIGHT_LABELS;
  protected readonly weightValues = WEIGHT_VALUES;

  isCriterionEnabled(criterion: Criterion): boolean {
    return criterion.enabled;
  }

  toggleCriterionEnabled(): void {
    const current = this.mobileCriterion();
    this.mobileCriterionChanges.emit({ ...current, enabled: !current.enabled });
  }

  updateCriterionWeight(weight: number): void {
    this.mobileCriterionChanges.emit({ ...this.mobileCriterion(), weight });
  }

  updateCriterionIsDealbreaker(isDealbreaker: boolean): void {
    this.mobileCriterionChanges.emit({ ...this.mobileCriterion(), is_dealbreaker: isDealbreaker });
  }
}

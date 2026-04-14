import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Criterion,
  WEIGHT_LABELS,
  WEIGHT_VALUES,
} from '../../../../../../shared/models/rating-criteria.models';

@Component({
  selector: 'app-broadband-criterion',
  imports: [CommonModule],
  templateUrl: './broadband-criterion.html',
  styleUrl: './broadband-criterion.css',
})
export class BroadbandCriterion {
  broadbandCriterion = input.required<Criterion>();
  broadbandCriterionChanges = output<Criterion>();

  protected readonly weightLabels = WEIGHT_LABELS;
  protected readonly weightValues = WEIGHT_VALUES;

  isCriterionEnabled(criterion: Criterion): boolean {
    return criterion.enabled;
  }

  toggleCriterionEnabled(): void {
    const current = this.broadbandCriterion();
    this.broadbandCriterionChanges.emit({ ...current, enabled: !current.enabled });
  }

  updateCriterionWeight(weight: number): void {
    this.broadbandCriterionChanges.emit({ ...this.broadbandCriterion(), weight });
  }

  updateCriterionIsDealbreaker(isDealbreaker: boolean): void {
    this.broadbandCriterionChanges.emit({
      ...this.broadbandCriterion(),
      is_dealbreaker: isDealbreaker,
    });
  }
}

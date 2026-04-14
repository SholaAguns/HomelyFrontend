import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Criterion,
  WEIGHT_LABELS,
  WEIGHT_VALUES,
} from '../../../../../../shared/models/rating-criteria.models';

@Component({
  selector: 'app-council-tax-criterion',
  imports: [CommonModule],
  templateUrl: './council-tax-criterion.html',
  styleUrl: './council-tax-criterion.css',
})
export class CouncilTaxCriterion {
  councilTaxCriterion = input.required<Criterion>();
  councilTaxCriterionChanges = output<Criterion>();

  protected readonly weightLabels = WEIGHT_LABELS;
  protected readonly weightValues = WEIGHT_VALUES;

  isCriterionEnabled(criterion: Criterion): boolean {
    return criterion.enabled;
  }

  toggleCriterionEnabled(): void {
    const current = this.councilTaxCriterion();
    this.councilTaxCriterionChanges.emit({ ...current, enabled: !current.enabled });
  }

  updateCriterionWeight(weight: number): void {
    this.councilTaxCriterionChanges.emit({ ...this.councilTaxCriterion(), weight });
  }

  updateCriterionIsDealbreaker(isDealbreaker: boolean): void {
    this.councilTaxCriterionChanges.emit({
      ...this.councilTaxCriterion(),
      is_dealbreaker: isDealbreaker,
    });
  }
}

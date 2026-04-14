import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Criterion,
  WEIGHT_LABELS,
  WEIGHT_VALUES,
} from '../../../../../../shared/models/rating-criteria.models';
import { SEARCH_CRITERIA_PRICES } from '../../../../../../shared/models/property-models';

@Component({
  selector: 'app-price-criterion',
  imports: [CommonModule],
  templateUrl: './price-criterion.html',
  styleUrl: './price-criterion.css',
})
export class PriceCriterion {
  priceCriterion = input.required<Criterion>();
  priceCriterionChanges = output<Criterion>();
  pricesOptions = SEARCH_CRITERIA_PRICES;

  defaultCriterion = signal<Criterion>({
    name: 'Price',
    source: 'property',
    field_name: 'price',
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
    const current = this.priceCriterion();

    const updated: Criterion = {
      ...current,
      enabled: !current.enabled,
    };

    this.priceCriterionChanges.emit(updated);
  }

  updateCriterionWeight(weight: number): void {
    const current = this.priceCriterion();

    const updated: Criterion = {
      ...current,
      weight: weight,
    };

    this.priceCriterionChanges.emit(updated);
  }

  updateCriterionIsDealbreaker(isDealbreaker: boolean): void {
    const current = this.priceCriterion();

    const updated: Criterion = {
      ...current,
      is_dealbreaker: isDealbreaker,
    };

    this.priceCriterionChanges.emit(updated);
  }

  updateCriterionBelowPriceThreshold(below_price_threshold: number): void {
    const current = this.priceCriterion();
    const currentThreshold = current.dealbreaker_threshold || {};

    const updated: Criterion = {
      ...current,
      dealbreaker_threshold: {
        ...currentThreshold,
        below_price_threshold: below_price_threshold,
      },
    };

    this.priceCriterionChanges.emit(updated);
  }

  updateCriterionAbovePriceThreshold(above_price_threshold: number): void {
    const current = this.priceCriterion();
    const currentThreshold = current.dealbreaker_threshold || {};

    const updated: Criterion = {
      ...current,
      dealbreaker_threshold: {
        ...currentThreshold,
        above_price_threshold: above_price_threshold,
      },
    };

    this.priceCriterionChanges.emit(updated);
  }
}

import { Component, input, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PoiReportData } from '../../../../shared/models/context-data.models';

@Component({
  selector: 'app-poi-report',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './poi-report.component.html',
  styleUrl: './poi-report.component.css',
})
export class PoiReportComponent {
  data = input.required<PoiReportData>();

  // Track which categories are collapsed (Set of category names)
  collapsedCategories = signal<Set<string>>(new Set());

  constructor() {
    // Initialize all categories as collapsed when data loads
    effect(() => {
      const categories = this.data().categories || [];
      this.collapsedCategories.set(new Set(categories));
    });
  }

  toggleCategory(category: string): void {
    this.collapsedCategories.update((collapsed) => {
      const newSet = new Set(collapsed);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  }

  isCategoryCollapsed(category: string): boolean {
    return this.collapsedCategories().has(category);
  }

  getCategoryIcon(category: string): string {
    const iconMap: Record<string, string> = {
      gym: '💪',
      hospital: '🏥',
      school: '🏫',
      restaurant: '🍽️',
      cafe: '☕',
      park: '🌳',
      shopping: '🛍️',
      supermarket: '🛒',
      pharmacy: '💊',
      bank: '🏦',
      atm: '💳',
      gas_station: '⛽',
      parking: '🅿️',
      library: '📚',
      museum: '🏛️',
      cinema: '🎬',
      bar: '🍺',
      nightclub: '🎵',
      transit_station: '🚉',
      bus_station: '🚌',
    };
    return iconMap[category.toLowerCase()] || '📍';
  }
}

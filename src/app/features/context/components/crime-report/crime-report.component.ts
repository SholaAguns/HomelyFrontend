import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-crime-report',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './crime-report.component.html',
  styleUrl: './crime-report.component.css',
})
export class CrimeReportComponent {
  data = input.required<unknown>();

  ratingClass = computed(() => {
    const rating = this.data().crime_rating?.toLowerCase();
    return {
      'rating-very-low': rating === 'very low',
      'rating-low': rating === 'low',
      'rating-moderate': rating === 'moderate',
      'rating-high': rating === 'high',
      'rating-very-high': rating === 'very high',
    };
  });
}

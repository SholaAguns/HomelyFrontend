import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-schools-report',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './schools-report.component.html',
  styleUrl: './schools-report.component.css',
})
export class SchoolsReportComponent {
  data = input.required<unknown>();

  stats = computed(() => this.data().statistics);
}

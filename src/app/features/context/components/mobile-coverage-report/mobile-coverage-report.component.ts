import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-mobile-coverage-report',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mobile-coverage-report.component.html',
  styleUrl: './mobile-coverage-report.component.css',
})
export class MobileCoverageReportComponent {
  data = input.required<unknown>();
}

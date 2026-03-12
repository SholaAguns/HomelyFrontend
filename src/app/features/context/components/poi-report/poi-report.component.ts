import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-poi-report',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './poi-report.component.html',
  styleUrl: './poi-report.component.css',
})
export class PoiReportComponent {
  data = input.required<unknown>();
}

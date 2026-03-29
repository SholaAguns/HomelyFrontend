import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CouncilTaxReportData } from '../../../../shared/models/context-data.models';

@Component({
  selector: 'app-council-tax-report',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './council-tax-report.component.html',
  styleUrl: './council-tax-report.component.css',
})
export class CouncilTaxReportComponent {
  data = input.required<CouncilTaxReportData>();
}

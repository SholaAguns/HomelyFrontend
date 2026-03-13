import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BroadbandReportData } from '../../../../shared/models/context-data.models';

@Component({
  selector: 'app-broadband-report',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './broadband-report.component.html',
  styleUrl: './broadband-report.component.css',
})
export class BroadbandReportComponent {
  data = input.required<BroadbandReportData>();
}

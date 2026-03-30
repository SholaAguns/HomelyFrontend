import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SavedLocationReportData } from '../../../../shared/models/context-data.models';

@Component({
  selector: 'app-saved-location-report',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './saved-location-report.html',
  styleUrl: './saved-location-report.css',
})
export class SavedLocationReportComponent {
  data = input.required<SavedLocationReportData>();
}

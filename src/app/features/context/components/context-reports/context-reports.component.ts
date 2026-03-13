import { Component, inject, input, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContextDataStore } from '../../store/context-data.store';
import { CrimeReportComponent } from '../crime-report/crime-report.component';
import { SchoolsReportComponent } from '../schools-report/schools-report.component';
import { BroadbandReportComponent } from '../broadband-report/broadband-report.component';
import { MobileCoverageReportComponent } from '../mobile-coverage-report/mobile-coverage-report.component';
import { PoiReportComponent } from '../poi-report/poi-report.component';

@Component({
  selector: 'app-context-reports',
  standalone: true,
  imports: [
    CommonModule,
    CrimeReportComponent,
    SchoolsReportComponent,
    BroadbandReportComponent,
    MobileCoverageReportComponent,
    PoiReportComponent,
  ],
  templateUrl: './context-reports.component.html',
  styleUrl: './context-reports.component.css',
})
export class ContextReportsComponent {
  propertyId = input.required<string>();

  private contextDataStore = inject(ContextDataStore);

  constructor() {
    effect(() => {
      const currentPropertyId = this.propertyId();
      if (currentPropertyId) {
        this.contextDataStore.load(currentPropertyId);
      }
    });
  }

  contextData = computed(() => this.contextDataStore.forProperty()(this.propertyId()));

  progress = computed(() => this.contextDataStore.progressFor()(this.propertyId()));

  hasStarted = computed(() => this.contextData().length > 0);

  triggerStage2(): void {
    this.contextDataStore.triggerStage2(this.propertyId());
  }

  getServiceStatus(serviceName: string): string | null {
    const contextData = this.contextData().find((d) => d.service_name === serviceName);
    return contextData?.status || null;
  }

  getServiceData(serviceName: string): unknown {
    const contextData = this.contextData().find((d) => d.service_name === serviceName);
    return contextData?.status === 'COMPLETE' ? contextData.data : null;
  }

  getServiceError(serviceName: string): string | null {
    const contextData = this.contextData().find((d) => d.service_name === serviceName);
    return contextData?.error_message || null;
  }

  retryService(serviceName: string): void {
    this.contextDataStore.retry({
      propertyId: this.propertyId(),
      service: serviceName,
    });
  }
}

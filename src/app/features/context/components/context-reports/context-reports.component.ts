import { Component, inject, input, computed, effect, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ContextDataStore } from '../../store/context-data.store';
import { PropertyWebSocketService } from '../../../../core/services/property-websocket-service/property-websocket.service';
import { CrimeReportComponent } from '../crime-report/crime-report.component';
import { SchoolsReportComponent } from '../schools-report/schools-report.component';
import { BroadbandReportComponent } from '../broadband-report/broadband-report.component';
import { MobileCoverageReportComponent } from '../mobile-coverage-report/mobile-coverage-report.component';
import { PoiReportComponent } from '../poi-report/poi-report.component';
import {
  CrimeReportData,
  SchoolsReportData,
  BroadbandReportData,
  MobileCoverageReportData,
  PoiReportData,
  ContextData,
} from '../../../../shared/models/context-data.models';

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
export class ContextReportsComponent implements OnDestroy {
  propertyId = input.required<string>();

  private contextDataStore = inject(ContextDataStore);
  private propertyWebSocketService = inject(PropertyWebSocketService);
  private wsSubscription?: Subscription;

  // Collapsed state for each service (true = collapsed)
  crimeCollapsed = signal(true);
  schoolsCollapsed = signal(true);
  broadbandCollapsed = signal(true);
  mobileCollapsed = signal(true);
  poiCollapsed = signal(true);

  constructor() {
    effect(() => {
      const currentPropertyId = this.propertyId();
      if (currentPropertyId) {
        this.contextDataStore.load(currentPropertyId);
        this.subscribeToUpdates(currentPropertyId);
      }
    });
  }

  ngOnDestroy(): void {
    this.wsSubscription?.unsubscribe();
    this.propertyWebSocketService.disconnect();
  }

  private subscribeToUpdates(propertyId: string): void {
    this.wsSubscription?.unsubscribe();

    this.wsSubscription = this.propertyWebSocketService.connectToProperty(propertyId).subscribe({
      next: (update) => {
        if (update.type === 'service_update' && update.service && update.status) {
          const contextData: ContextData = {
            id: `${propertyId}-${update.service}`,
            property_id: propertyId,
            service_name: update.service as any,
            status: update.status as any,
            data: update.data,
            error_message: null,
            started_at: null,
            completed_at: update.status === 'COMPLETE' ? new Date().toISOString() : null,
            cached: false,
          };
          this.contextDataStore.updateService(propertyId, contextData);
        } else if (update.type === 'stage2_complete') {
          this.contextDataStore.load(propertyId);
        }
      },
      error: (err) => console.error('WebSocket error:', err),
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

  getServiceData<T = unknown>(serviceName: string): T | null {
    const contextData = this.contextData().find((d) => d.service_name === serviceName);
    return contextData?.status === 'COMPLETE' ? (contextData.data as T) : null;
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

  getCrimeData(): CrimeReportData | null {
    return this.getServiceData<CrimeReportData>('crime');
  }

  getSchoolsData(): SchoolsReportData | null {
    return this.getServiceData<SchoolsReportData>('schools');
  }

  getBroadbandData(): BroadbandReportData | null {
    return this.getServiceData<BroadbandReportData>('broadband');
  }

  getMobileData(): MobileCoverageReportData | null {
    return this.getServiceData<MobileCoverageReportData>('mobile');
  }

  getPoiData(): PoiReportData | null {
    return this.getServiceData<PoiReportData>('poi');
  }

  toggleCollapsed(serviceName: string): void {
    switch (serviceName) {
      case 'crime':
        this.crimeCollapsed.update((v) => !v);
        break;
      case 'schools':
        this.schoolsCollapsed.update((v) => !v);
        break;
      case 'broadband':
        this.broadbandCollapsed.update((v) => !v);
        break;
      case 'mobile':
        this.mobileCollapsed.update((v) => !v);
        break;
      case 'poi':
        this.poiCollapsed.update((v) => !v);
        break;
    }
  }
}

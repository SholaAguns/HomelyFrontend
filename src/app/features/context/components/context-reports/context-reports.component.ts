import { Component, inject, input, computed, effect, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ContextDataStore } from '../../store/context-data.store';
import { PropertyStore } from '../../../property/store/property.store';
import { PropertyWebSocketService } from '../../../../core/services/property-websocket-service/property-websocket.service';
import { CrimeReportComponent } from '../crime-report/crime-report.component';
import { SchoolsReportComponent } from '../schools-report/schools-report.component';
import { BroadbandReportComponent } from '../broadband-report/broadband-report.component';
import { MobileCoverageReportComponent } from '../mobile-coverage-report/mobile-coverage-report.component';
import { CouncilTaxReportComponent } from '../council-tax-report/council-tax-report.component';
import { PoiReportComponent } from '../poi-report/poi-report.component';
import { SavedLocationReportComponent } from '../saved-location-report/saved-location-report';
import {
  CrimeReportData,
  SchoolsReportData,
  BroadbandReportData,
  MobileCoverageReportData,
  CouncilTaxReportData,
  PoiReportData,
  SavedLocationReportData,
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
    CouncilTaxReportComponent,
    PoiReportComponent,
    SavedLocationReportComponent,
  ],
  templateUrl: './context-reports.component.html',
  styleUrl: './context-reports.component.css',
})
export class ContextReportsComponent implements OnDestroy {
  propertyId = input.required<string>();

  private contextDataStore = inject(ContextDataStore);
  private propertyStore = inject(PropertyStore);
  private propertyWebSocketService = inject(PropertyWebSocketService);
  private wsSubscription?: Subscription;

  // Collapsed state for each service (true = collapsed)
  crimeCollapsed = signal(true);
  schoolsCollapsed = signal(true);
  broadbandCollapsed = signal(true);
  mobileCollapsed = signal(true);
  councilTaxCollapsed = signal(true);
  poiCollapsed = signal(true);
  savedLocationsCollapsed = signal(true);

  constructor() {
    effect(() => {
      const currentPropertyId = this.propertyId();
      if (currentPropertyId) {
        this.contextDataStore.load(currentPropertyId);
      }
    });
  }

  ngOnDestroy(): void {
    this.wsSubscription?.unsubscribe();
    this.propertyWebSocketService.disconnect();
  }

  private subscribeToUpdates(propertyId: string, onConnected?: () => void): void {
    this.wsSubscription?.unsubscribe();

    console.log('🔌 WEBSOCKET: Connecting to property channel immediately...', propertyId);

    this.wsSubscription = this.propertyWebSocketService.connectToProperty(propertyId).subscribe({
      next: (update) => {
        console.log('📨 WEBSOCKET UPDATE RECEIVED:', update.type, update);

        if (update.type === 'service_update' && update.service && update.status) {
          console.log(`✅ SERVICE UPDATE: ${update.service} → ${update.status}`);
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
          console.log('🎉 STAGE 2 COMPLETE - Reloading context data and updating property state');
          this.contextDataStore.load(propertyId);
          this.propertyStore.updatePropertyState(propertyId, 'STAGE2_COMPLETE');
          // Wait for load to complete before disconnecting
          setTimeout(() => {
            console.log('🔌 CLOSING WEBSOCKET CONNECTION (Stage 2 complete)');
            this.wsSubscription?.unsubscribe();
            this.propertyWebSocketService.disconnect();
          }, 1000);
        }
      },
      error: (err) => {
        console.error('❌ WEBSOCKET ERROR:', err);
      },
      complete: () => {
        console.log('🔌 WEBSOCKET CONNECTION CLOSED');
      },
    });

    // Call the callback after a short delay to ensure connection is established
    if (onConnected) {
      setTimeout(() => {
        console.log('🔌 WEBSOCKET: Connection ready, calling callback');
        onConnected();
      }, 200);
    }
  }

  contextData = computed(() => this.contextDataStore.forProperty()(this.propertyId()));

  progress = computed(() => this.contextDataStore.progressFor()(this.propertyId()));

  hasStarted = computed(() => this.contextData().length > 0);

  property = computed(() => this.propertyStore.entities()[this.propertyId()]);

  showTriggerButton = computed(() => {
    const currentProperty = this.property();
    return !this.hasStarted() || currentProperty?.state === 'STAGE2_COMPLETE';
  });

  triggerStage2(services?: string[]): void {
    const propertyId = this.propertyId();
    // Subscribe FIRST, then trigger stage 2 after connection established
    this.subscribeToUpdates(propertyId, () => {
      console.log(
        '🚀 TRIGGERING STAGE 2',
        services ? `for services: ${services.join(', ')}` : '(all services)'
      );
      this.contextDataStore.triggerStage2({ propertyId, services });
    });
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
    const propertyId = this.propertyId();
    // Subscribe FIRST, then retry service after connection established
    this.subscribeToUpdates(propertyId, () => {
      console.log('🔄 RETRYING SERVICE:', serviceName);
      this.contextDataStore.retry({
        propertyId,
        service: serviceName,
      });
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

  getCouncilTaxData(): CouncilTaxReportData | null {
    return this.getServiceData<CouncilTaxReportData>('council_tax');
  }

  getPoiData(): PoiReportData | null {
    return this.getServiceData<PoiReportData>('poi');
  }

  getSavedLocationsData(): SavedLocationReportData | null {
    return this.getServiceData<SavedLocationReportData>('saved_locations');
  }

  retryAllFailed(): void {
    const failedServices = this.contextData()
      .filter((d) => d.status === 'FAILED')
      .map((d) => d.service_name);

    if (failedServices.length > 0) {
      console.log('🔄 RETRYING ALL FAILED SERVICES:', failedServices);
      this.triggerStage2(failedServices);
    }
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
      case 'council_tax':
        this.councilTaxCollapsed.update((v) => !v);
        break;
      case 'poi':
        this.poiCollapsed.update((v) => !v);
        break;
      case 'saved_locations':
        this.savedLocationsCollapsed.update((v) => !v);
        break;
    }
  }
}

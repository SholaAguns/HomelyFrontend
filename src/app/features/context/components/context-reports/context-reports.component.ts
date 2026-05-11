import {
  Component,
  inject,
  input,
  computed,
  effect,
  signal,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription, TimeoutError, timeout, catchError, EMPTY } from 'rxjs';
import { ContextDataStore } from '../../store/context-data.store';
import { PropertyStore } from '../../../property/store/property.store';
import { PropertySseService } from '../../../../core/services/property-sse-service/property-sse.service';
import { NotificationService } from '../../../../core/services/notification-service/notification.service';
import { AuthService } from '../../../../core/services/auth-service/auth.service';
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
import { ProjectRole } from '../../../../shared/models/auth-models';

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
export class ContextReportsComponent implements OnInit, OnDestroy {
  propertyId = input.required<string>();
  projectUuid = input.required<string>();

  private contextDataStore = inject(ContextDataStore);
  private propertyStore = inject(PropertyStore);
  private propertySseService = inject(PropertySseService);
  private notificationService = inject(NotificationService);
  private authService = inject(AuthService);
  private wsSubscription?: Subscription;
  userRole = signal<ProjectRole>(null);

  canEdit = computed(() => {
    const pUuid = this.projectUuid();
    if (!pUuid) return false;
    return this.authService.canEdit(pUuid, this.userRole());
  });

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

    effect(() => {
      const pUuid = this.projectUuid();
      if (pUuid) {
        this.authService.getUserRole(pUuid).subscribe({
          next: (roleResponse) => {
            this.userRole.set(roleResponse.role);
          },
          error: () => {},
        });
      }
    });
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.wsSubscription?.unsubscribe();
  }

  private subscribeToPropertyUpdates(propertyId: string, onConnected: () => void): Subscription {
    return this.propertySseService
      .connectToProperty(propertyId)
      .pipe(
        timeout(5 * 60 * 1000),
        catchError((err) => {
          if (err instanceof TimeoutError) {
            this.notificationService.error('Stage 2 timed out. Please retry.');
          }
          return EMPTY;
        })
      )
      .subscribe({
        next: (event) => {
          if (event.type === 'connected') {
            onConnected();
            return;
          }
          if (event.type === 'service_update' && event.data?.service && event.data?.status) {
            const contextData: ContextData = {
              id: `${propertyId}-${event.data.service}`,
              property_id: propertyId,
              service_name: event.data.service,
              status: event.data.status,
              data: event.data.data,
              error_message: event.data.error ?? null,
              started_at: null,
              completed_at: event.data.status === 'COMPLETE' ? new Date().toISOString() : null,
              cached: false,
              project_uuid: this.projectUuid(),
            };
            this.contextDataStore.updateService(propertyId, contextData);
          } else if (event.type === 'stage2_complete') {
            this.contextDataStore.load(propertyId);
            this.propertyStore.updatePropertyState(propertyId, 'STAGE2_COMPLETE');
            this.wsSubscription?.unsubscribe();
          }
        },
        error: () => {},
      });
  }

  contextData = computed(() => this.contextDataStore.forProperty()(this.propertyId()));

  progress = computed(() => this.contextDataStore.progressFor()(this.propertyId()));

  hasStarted = computed(() => this.contextData().length > 0);

  property = computed(() => this.propertyStore.entities()[this.propertyId()]);

  showTriggerButton = computed(() => {
    const currentProperty = this.property();
    return (
      !this.hasStarted() ||
      currentProperty?.state === 'STAGE2_COMPLETE' ||
      currentProperty?.state === 'STAGE3_IN_PROGRESS' ||
      currentProperty?.state === 'STAGE3_COMPLETE'
    );
  });

  triggerStage2(services?: string[]): void {
    const propertyId = this.propertyId();
    this.wsSubscription?.unsubscribe();
    this.wsSubscription = this.subscribeToPropertyUpdates(propertyId, () => {
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
    this.wsSubscription?.unsubscribe();
    this.wsSubscription = this.subscribeToPropertyUpdates(propertyId, () => {
      this.contextDataStore.retry({ propertyId, service: serviceName });
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

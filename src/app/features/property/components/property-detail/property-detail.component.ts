import { Component, inject, OnInit, OnDestroy, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subscription, TimeoutError, timeout, catchError, EMPTY } from 'rxjs';
import { PropertyService } from '../../../../core/services/property-service/property.service';
import { PropertyStore } from '../../store/property.store';
import { ContextDataStore } from '../../../context/store/context-data.store';
import { NotificationService } from '../../../../core/services/notification-service/notification.service';
import { PropertySseService } from '../../../../core/services/property-sse-service/property-sse.service';
import { FavoritesService } from '../../../../core/services/favorites-service/favorites.service';
import { ShortlistService } from '../../../../core/services/shortlist-service/shortlist.service';
import { PropertyDetail, PropertyState } from '../../../../shared/models/property-models';
import {
  RatingCompleteData,
  CrimeReportData,
  SchoolsReportData,
  School,
  BroadbandReportData,
  MobileCoverageReportData,
  ProviderCoverage,
  CouncilTaxReportData,
  SavedLocationReportData,
  PoiReportData,
} from '../../../../shared/models/context-data.models';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { ImageGalleryComponent } from '../../../../shared/components/image-gallery/image-gallery.component';
import { ContextReportsComponent } from '../../../context/components/context-reports/context-reports.component';
import { AuthService } from '../../../../core/services/auth-service/auth.service';
import { PropertyListService } from '../../../../core/services/property-list-service/property-list.service';
import { ProjectRole } from '../../../../shared/models/auth-models';

@Component({
  selector: 'app-property-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    LoadingSpinnerComponent,
    ImageGalleryComponent,
    ContextReportsComponent,
  ],
  templateUrl: './property-detail.component.html',
  styleUrl: './property-detail.component.css',
})
export class PropertyDetailComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private propertyService = inject(PropertyService);
  private propertyStore = inject(PropertyStore);
  private notificationService = inject(NotificationService);
  private propertySseService = inject(PropertySseService);
  private favoritesService = inject(FavoritesService);
  private shortlistService = inject(ShortlistService);
  private authService = inject(AuthService);
  private propertyListService = inject(PropertyListService);
  private contextDataStore = inject(ContextDataStore);

  property = signal<PropertyDetail | null>(null);
  loading = signal(true);
  galleryOpen = signal(false);
  galleryInitialIndex = signal(0);
  userRole = signal<ProjectRole>(null);
  projectUuid = signal<string>('');
  private wsSubscription?: Subscription;

  canEdit = computed(() => {
    const pUuid = this.projectUuid();
    if (!pUuid) return false;
    return this.authService.canEdit(pUuid, this.userRole());
  });

  canEnrich = computed(() => {
    const p = this.property();
    if (!p?.external_url || p.is_enriched) return false;
    return p.external_url.includes('zoopla') || p.external_url.includes('rightmove');
  });

  propertySource = computed((): 'Rightmove' | 'Zoopla' | null => {
    const externalUrl = this.property()?.external_url;
    if (!externalUrl) return null;
    if (externalUrl.includes('rightmove')) return 'Rightmove';
    if (externalUrl.includes('zoopla')) return 'Zoopla';
    return null;
  });

  shortlistingListUuid = signal<string | null>(null);
  enriching = signal(false);
  showParseHtmlModal = signal(false);
  parsingFromHtml = signal(false);
  parseHtmlSource = signal<'auto' | 'rightmove' | 'zoopla'>('auto');
  parseHtmlInput = signal('');
  disqualifying = signal(false);
  showDisqualifyInput = signal(false);
  disqualifyReason = signal('');

  displayedImages = computed(() => {
    const propertyData = this.property();
    if (!propertyData?.images || propertyData.images.length <= 1) return [];

    // Get images excluding primary, then take first 3
    const otherImages = propertyData.images.filter(
      (img) => img.id !== propertyData.primary_image?.id
    );
    return otherImages.slice(0, 3);
  });

  hasMoreImages = computed(() => {
    const propertyData = this.property();
    if (!propertyData?.images) return false;
    return propertyData.images.length > 4;
  });

  sortedRatingBreakdown = computed(() => {
    const breakdown = this.property()?.rating_breakdown;
    if (!breakdown) return [];
    return Object.entries(breakdown).sort(([, a], [, b]) => b.weighted_score - a.weighted_score);
  });

  private readonly stateRank: Record<string, number> = {
    NEW: 0,
    STAGE2_IN_PROGRESS: 1,
    STAGE2_COMPLETE: 2,
    STAGE3_IN_PROGRESS: 3,
    STAGE3_COMPLETE: 4,
  };

  constructor() {
    effect(() => {
      const localProperty = this.property();
      if (!localProperty) return;
      const storeEntity = this.propertyStore.entities()[localProperty.uuid];
      if (!storeEntity || storeEntity.state === localProperty.state) return;
      const storeRank = this.stateRank[storeEntity.state] ?? -1;
      const localRank = this.stateRank[localProperty.state] ?? -1;
      if (storeRank > localRank) {
        this.property.update((current) =>
          current ? { ...current, state: storeEntity.state } : null
        );
      }
    });
  }

  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe();

    const uuid = this.route.snapshot.paramMap.get('uuid');
    if (uuid) {
      this.loadProperty(uuid);
    } else {
      this.notificationService.error('No property UUID provided');
      this.loading.set(false);
    }
  }

  loadProperty(uuid: string): void {
    this.loading.set(true);

    this.propertyService.getByUuid(uuid).subscribe({
      next: (property) => {
        this.property.set(property);
        this.propertyStore.addProperty(property);
        this.loading.set(false);

        // Get project_uuid from one of the property lists
        const propertyListUuids = Object.keys(property.property_lists);
        if (propertyListUuids.length > 0) {
          this.propertyListService.getByUuid(propertyListUuids[0]).subscribe({
            next: (list) => {
              this.projectUuid.set(list.project);
              this.authService.getUserRole(list.project).subscribe({
                next: (role) => this.userRole.set(role.role),
                error: () => {},
              });
            },
            error: () => {},
          });
        }
      },
      error: (err) => {
        this.notificationService.error(err.message || 'Failed to load property');
        this.loading.set(false);
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/lists']);
  }

  runStage2(): void {
    const propertyValue = this.property();
    if (!propertyValue) return;

    this.wsSubscription?.unsubscribe();

    this.wsSubscription = this.propertySseService
      .connectToProperty(propertyValue.uuid)
      .pipe(
        timeout(5 * 60 * 1000),
        catchError((err) => {
          if (err instanceof TimeoutError) {
            this.notificationService.error('Stage 2 timed out. Please try again.');
          }
          return EMPTY;
        })
      )
      .subscribe({
        next: (event) => {
          if (event.type === 'connected') {
            this.propertyService.runStage2(propertyValue.uuid).subscribe({
              next: () => this.notificationService.success('Stage 2 started successfully'),
              error: (err) => {
                this.notificationService.error(err.message || 'Failed to run stage 2');
                this.wsSubscription?.unsubscribe();
              },
            });
            return;
          }

          if (event.type === 'stage2_complete') {
            this.propertyStore.updatePropertyState(propertyValue.uuid, 'STAGE2_COMPLETE');
            this.property.update((current) =>
              current ? { ...current, state: 'STAGE2_COMPLETE' } : null
            );
            this.notificationService.success('Context retrieval complete!');
            this.wsSubscription?.unsubscribe();
          }
        },
        error: () => {},
      });
  }

  runStage3(): void {
    const propertyValue = this.property();
    if (!propertyValue) return;

    this.wsSubscription?.unsubscribe();

    this.wsSubscription = this.propertySseService
      .connectToProperty(propertyValue.uuid)
      .pipe(
        timeout(5 * 60 * 1000),
        catchError((err) => {
          if (err instanceof TimeoutError) {
            this.notificationService.error('Rating timed out. Please try again.');
          }
          return EMPTY;
        })
      )
      .subscribe({
        next: (event) => {
          if (event.type === 'connected') {
            this.propertyService.runStage3(propertyValue.uuid).subscribe({
              next: () => {
                this.property.update((current) =>
                  current ? { ...current, state: 'STAGE3_IN_PROGRESS' } : null
                );
              },
              error: (err) => {
                this.notificationService.error(err.message || 'Failed to run stage 3');
                this.wsSubscription?.unsubscribe();
              },
            });
            return;
          }

          if (event.type === 'rating_complete' && event.data) {
            const ratingData = event.data as RatingCompleteData;
            this.property.update((current) =>
              current
                ? {
                    ...current,
                    state: (ratingData.property_state || 'STAGE3_COMPLETE') as PropertyState,
                    overall_rating: ratingData.overall_rating,
                    rating_breakdown: ratingData.rating_breakdown,
                    disqualified: ratingData.disqualified,
                    disqualification_reason: ratingData.disqualification_reason,
                  }
                : null
            );
            this.propertyStore.updatePropertyState(
              propertyValue.uuid,
              ratingData.property_state || 'STAGE3_COMPLETE'
            );
            this.notificationService.success('Rating calculation complete!');
            this.wsSubscription?.unsubscribe();
          }

          if (event.type === 'rating_failed') {
            this.notificationService.error(
              event.data?.error || 'Rating calculation failed. Please try again.'
            );
            this.wsSubscription?.unsubscribe();
          }
        },
        error: () => {},
      });
  }

  ngOnDestroy(): void {
    this.wsSubscription?.unsubscribe();
  }

  openGallery(index: number = 0): void {
    this.galleryInitialIndex.set(index);
    this.galleryOpen.set(true);
  }

  closeGallery(): void {
    this.galleryOpen.set(false);
  }

  enrichProperty(): void {
    const p = this.property();
    if (!p) return;
    this.enriching.set(true);
    this.propertyService
      .enrich(p.uuid)
      .pipe(
        catchError((err) => {
          this.notificationService.error(err.message || 'Failed to fetch full details');
          this.enriching.set(false);
          return EMPTY;
        })
      )
      .subscribe((res) => {
        this.property.set(res.property);
        this.propertyStore.upsertOne(res.property);
        this.notificationService.success('Property details updated');
        this.enriching.set(false);
      });
  }

  parseFromHtml(): void {
    const p = this.property();
    const htmlContent = this.parseHtmlInput().trim();
    if (!p || !htmlContent) return;
    this.parsingFromHtml.set(true);
    const selectedSource = this.parseHtmlSource();
    const source = selectedSource === 'auto' ? undefined : selectedSource;
    this.propertyService
      .enrichFromHtml(p.uuid, htmlContent, source)
      .pipe(
        catchError((err) => {
          this.notificationService.error(err.error?.error || err.message || 'Failed to parse HTML');
          this.parsingFromHtml.set(false);
          return EMPTY;
        })
      )
      .subscribe((res) => {
        this.property.set(res.property);
        this.propertyStore.upsertOne(res.property);
        this.notificationService.success('Property updated from HTML');
        this.parsingFromHtml.set(false);
        this.showParseHtmlModal.set(false);
        this.parseHtmlInput.set('');
      });
  }

  disqualify(): void {
    const p = this.property();
    if (!p) return;
    const reason = this.disqualifyReason() || 'Manually disqualified';
    this.disqualifying.set(true);
    this.propertyService
      .disqualify(p.uuid, reason)
      .pipe(
        catchError((err) => {
          this.notificationService.error(err.message || 'Failed to disqualify property');
          this.disqualifying.set(false);
          return EMPTY;
        })
      )
      .subscribe((updatedProperty) => {
        this.property.update((current) =>
          current ? { ...current, disqualified: true, disqualification_reason: reason } : null
        );
        this.propertyStore.upsertOne(updatedProperty);
        this.showDisqualifyInput.set(false);
        this.disqualifyReason.set('');
        this.disqualifying.set(false);
        this.notificationService.success('Property disqualified');
      });
  }

  undisqualify(): void {
    const p = this.property();
    if (!p) return;
    this.disqualifying.set(true);
    this.propertyService
      .undisqualify(p.uuid)
      .pipe(
        catchError((err) => {
          this.notificationService.error(err.message || 'Failed to undo disqualification');
          this.disqualifying.set(false);
          return EMPTY;
        })
      )
      .subscribe((updatedProperty) => {
        this.property.update((current) =>
          current ? { ...current, disqualified: false, disqualification_reason: null } : null
        );
        this.propertyStore.upsertOne(updatedProperty);
        this.disqualifying.set(false);
        this.notificationService.success('Disqualification removed');
      });
  }

  toggleShortlist(propertyListUuid: string): void {
    const propertyValue = this.property();
    if (!propertyValue) return;

    const isCurrentlyShortlisted =
      propertyValue.shortlisted_in_lists?.includes(propertyListUuid) ?? false;
    this.shortlistingListUuid.set(propertyListUuid);

    const action = isCurrentlyShortlisted
      ? this.shortlistService.removeFromShortlist(propertyListUuid, propertyValue.uuid)
      : this.shortlistService.addToShortlist(propertyListUuid, propertyValue.uuid);

    action.subscribe({
      next: () => {
        this.property.update((current) => {
          if (!current) return null;
          const currentLists = current.shortlisted_in_lists ?? [];
          const updatedLists = isCurrentlyShortlisted
            ? currentLists.filter((listUuid) => listUuid !== propertyListUuid)
            : [...currentLists, propertyListUuid];
          return { ...current, shortlisted_in_lists: updatedLists };
        });
        this.notificationService.success(
          isCurrentlyShortlisted ? 'Removed from shortlist' : 'Added to shortlist'
        );
        this.shortlistingListUuid.set(null);
      },
      error: () => {
        this.notificationService.error('Failed to update shortlist');
        this.shortlistingListUuid.set(null);
      },
    });
  }

  exportToHtml(): void {
    const p = this.property();
    if (!p) return;

    const currencySymbol = p.currency_code === 'GBP' ? '£' : p.currency_code || '£';
    const priceText = `${currencySymbol}${p.price.toLocaleString()}${p.price_frequency ? ' ' + p.price_frequency : ''}`;
    const address = [p.address_line_1, p.address_line_2, p.city, p.postcode]
      .filter(Boolean)
      .join(', ');

    const imageHtml = p.primary_image
      ? `<img src="${p.primary_image.source_url}" alt="${p.title}" style="width:100%;max-height:400px;object-fit:cover;border-radius:8px;margin-bottom:16px;" />`
      : '';

    const thumbnailsHtml =
      p.images && p.images.length > 1
        ? `<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:16px;">
          ${p.images
            .slice(1, 7)
            .map(
              (img) =>
                `<img src="${img.source_url}" alt="${img.caption || 'Property image'}" style="width:100%;height:100px;object-fit:cover;border-radius:4px;" />`
            )
            .join('')}
         </div>`
        : '';

    const formatDate = (dateStr: string | null) =>
      dateStr
        ? new Date(dateStr).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })
        : '';

    const keyFeaturesRows = [
      p.property_type ? `<tr><td>Property Type</td><td>${p.property_type}</td></tr>` : '',
      `<tr><td>Bedrooms</td><td>${p.bedrooms}</td></tr>`,
      `<tr><td>Bathrooms</td><td>${p.bathrooms}</td></tr>`,
      p.display_size
        ? `<tr><td>Size</td><td>${p.display_size}</td></tr>`
        : p.square_area
          ? `<tr><td>Area</td><td>${p.square_area} sq ft</td></tr>`
          : '',
      `<tr><td>Furnished</td><td>${p.furnished_status || 'N/A'}</td></tr>`,
      `<tr><td>Garden</td><td>${p.garden ? 'Yes' : 'No'}</td></tr>`,
      `<tr><td>Parking</td><td>${p.parking ? 'Yes' : 'No'}</td></tr>`,
      p.let_available_date
        ? `<tr><td>Available From</td><td>${formatDate(p.let_available_date)}</td></tr>`
        : '',
    ]
      .filter(Boolean)
      .join('');

    const additionalRows = [
      p.council_tax_band ? `<tr><td>Council Tax Band</td><td>${p.council_tax_band}</td></tr>` : '',
      p.epc_rating ? `<tr><td>EPC Rating</td><td>${p.epc_rating}</td></tr>` : '',
      p.floor_level != null ? `<tr><td>Floor Level</td><td>${p.floor_level}</td></tr>` : '',
      p.lease_length ? `<tr><td>Lease Length</td><td>${p.lease_length} years</td></tr>` : '',
      p.deposit ? `<tr><td>Deposit</td><td>${p.deposit}</td></tr>` : '',
      `<tr><td>Child Suitable</td><td>${p.child_suitable ? 'Yes' : 'No'}</td></tr>`,
      p.first_visible_date
        ? `<tr><td>First Listed</td><td>${formatDate(p.first_visible_date)}</td></tr>`
        : '',
      p.listing_update_date
        ? `<tr><td>Last Updated</td><td>${formatDate(p.listing_update_date)}</td></tr>`
        : '',
      p.listing_update_reason
        ? `<tr><td>Update Reason</td><td>${p.listing_update_reason}</td></tr>`
        : '',
    ]
      .filter(Boolean)
      .join('');

    const keyFeaturesListHtml =
      p.key_features && p.key_features.length > 0
        ? `<ul style="list-style:disc;padding-left:20px;margin:0 0 16px;">${p.key_features.map((f) => `<li>${f.description}</li>`).join('')}</ul>`
        : '';

    const contextReportsHtml = this.buildContextReportsHtml(
      this.contextDataStore.forProperty()(p.uuid)
    );

    const ratingHtml =
      p.overall_rating != null && p.rating_breakdown
        ? `<div style="background:#f3f0ff;border-radius:8px;padding:16px;margin-bottom:16px;">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <div><p style="color:#666;font-size:14px;margin:0;">Overall Rating</p><p style="font-size:48px;font-weight:bold;color:#7c3aed;margin:4px 0 0;">${p.overall_rating.toFixed(2)}</p></div>
            <div style="text-align:right;"><p style="color:#666;font-size:14px;margin:0;">Out of</p><p style="font-size:24px;font-weight:600;margin:4px 0 0;">100</p></div>
          </div>
         </div>
         <table style="width:100%;border-collapse:collapse;">
           <thead><tr style="background:#f9fafb;"><th style="text-align:left;padding:8px 16px;font-size:14px;">Criterion</th><th style="padding:8px;font-size:14px;">Raw Value</th><th style="padding:8px;font-size:14px;">Score</th><th style="padding:8px;font-size:14px;">Weight</th><th style="padding:8px;font-size:14px;">Weighted</th></tr></thead>
           <tbody>${Object.entries(p.rating_breakdown)
             .sort(([, a], [, b]) => b.weighted_score - a.weighted_score)
             .map(
               ([key, val]) =>
                 `<tr style="border-top:1px solid #eee;"><td style="padding:8px 16px;font-size:14px;">${key}</td><td style="padding:8px;text-align:center;font-size:14px;">${val.raw_value ?? '-'}</td><td style="padding:8px;text-align:center;font-size:14px;">${val.normalized_score.toFixed(2)}</td><td style="padding:8px;text-align:center;font-size:14px;">${val.weight}</td><td style="padding:8px;text-align:center;font-size:14px;font-weight:600;color:#7c3aed;">${val.weighted_score.toFixed(2)}</td></tr>`
             )
             .join('')}</tbody>
         </table>`
        : '';

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${p.title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 900px; margin: 40px auto; padding: 0 20px; color: #111; }
    h1 { font-size: 28px; font-weight: 700; margin: 0 0 8px; }
    h2 { font-size: 20px; font-weight: 600; margin: 0 0 16px; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; }
    .section { background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 24px; margin-bottom: 20px; }
    .price { font-size: 32px; font-weight: 700; color: #16a34a; }
    .address { color: #6b7280; font-size: 18px; margin: 0 0 12px; }
    table { width: 100%; border-collapse: collapse; }
    td { padding: 8px 0; vertical-align: top; }
    td:first-child { color: #6b7280; font-size: 14px; width: 40%; }
    td:last-child { font-size: 16px; font-weight: 500; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 4px; font-size: 13px; font-weight: 500; background: #f3f4f6; color: #374151; margin-right: 8px; }
    a { color: #2563eb; }
    .generated { font-size: 13px; color: #9ca3af; margin-top: 32px; border-top: 1px solid #e5e7eb; padding-top: 16px; }
  </style>
</head>
<body>
  <h1>${p.title}</h1>
  <p class="address">${address}</p>
  <div style="margin-bottom:16px;">
    <span class="badge">${p.state_display}</span>
    ${p.external_url ? `<a href="${p.external_url}" target="_blank">View on ${this.propertySource() || 'external site'}</a>` : ''}
  </div>
  ${imageHtml}
  ${thumbnailsHtml}
  <div class="section">
    <div class="price">${priceText}</div>
    ${p.added_or_reduced ? `<div style="color:#6b7280;font-size:14px;margin-top:4px;">${p.added_or_reduced}</div>` : ''}
    ${p.summary ? `<p style="margin-top:16px;color:#374151;">${p.summary}</p>` : ''}
  </div>
  <div class="section">
    <h2>Key Features</h2>
    <table><tbody>${keyFeaturesRows}</tbody></table>
  </div>
  ${p.description ? `<div class="section"><h2>Description</h2><p style="white-space:pre-line;color:#374151;">${p.description}</p></div>` : ''}
  ${keyFeaturesListHtml || additionalRows ? `<div class="section"><h2>Additional Details</h2>${keyFeaturesListHtml}<table><tbody>${additionalRows}</tbody></table></div>` : ''}
  ${contextReportsHtml}
  ${ratingHtml ? `<div class="section"><h2>Property Rating</h2>${ratingHtml}</div>` : ''}
  <p class="generated">Exported from Homely on ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = objectUrl;
    const filenameParts = [p.title, p.address_line_1].filter(Boolean).join(' ');
    anchor.download = `${filenameParts.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.html`;
    anchor.click();
    URL.revokeObjectURL(objectUrl);
  }

  private buildContextReportsHtml(contextData: any[]): string {
    const getServiceData = <T>(serviceName: string): T | null => {
      const service = contextData.find(
        (c) => c.service_name === serviceName && c.status === 'COMPLETE'
      );
      return service ? (service.data as T) : null;
    };

    const tdStyle = 'padding:6px 12px;font-size:13px;';
    const thStyle = 'padding:6px 12px;font-size:13px;text-align:left;';
    const trBorder = 'border-top:1px solid #eee;';
    const tableHead = (cols: string[]) =>
      `<thead><tr style="background:#f9fafb;">${cols.map((c) => `<th style="${thStyle}">${c}</th>`).join('')}</tr></thead>`;

    const sections: string[] = [];

    const crime = getServiceData<CrimeReportData>('crime');
    if (crime) {
      const topCatsHtml =
        crime.top_categories?.length > 0
          ? `<div style="margin-top:12px;">
              <table style="width:100%;border-collapse:collapse;">
                ${tableHead(['Category', 'Count'])}
                <tbody>${crime.top_categories.map((c) => `<tr style="${trBorder}"><td style="${tdStyle}">${c.category}</td><td style="${tdStyle};text-align:right;">${c.count}</td></tr>`).join('')}</tbody>
              </table>
             </div>`
          : '';
      sections.push(`<div class="section">
        <h2>Crime Data</h2>
        <table><tbody>
          <tr><td>Total Crimes</td><td>${crime.total_crimes}</td></tr>
          <tr><td>Period</td><td>${crime.period}</td></tr>
          <tr><td>Crime Rating</td><td>${crime.crime_rating}</td></tr>
          <tr><td>Area</td><td>${crime.postcode_sector}</td></tr>
        </tbody></table>
        ${topCatsHtml}
      </div>`);
    }

    const schools = getServiceData<SchoolsReportData>('schools');
    if (schools) {
      const statsRows = [
        schools.statistics.primary_count != null
          ? `<tr><td>Primary Schools</td><td>${schools.statistics.primary_count}</td></tr>`
          : '',
        schools.statistics.secondary_count != null
          ? `<tr><td>Secondary Schools</td><td>${schools.statistics.secondary_count}</td></tr>`
          : '',
        schools.statistics.nursery_count != null
          ? `<tr><td>Nursery Schools</td><td>${schools.statistics.nursery_count}</td></tr>`
          : '',
        schools.statistics.closest_primary_km != null
          ? `<tr><td>Closest Primary</td><td>${schools.statistics.closest_primary_km.toFixed(2)} km</td></tr>`
          : '',
        schools.statistics.closest_secondary_km != null
          ? `<tr><td>Closest Secondary</td><td>${schools.statistics.closest_secondary_km.toFixed(2)} km</td></tr>`
          : '',
      ]
        .filter(Boolean)
        .join('');

      const renderSchoolList = (label: string, schoolList: School[] | undefined) => {
        if (!schoolList?.length) return '';
        return `<div style="margin-top:12px;">
          <h4 style="font-size:15px;font-weight:600;margin:0 0 8px;">${label}</h4>
          <table style="width:100%;border-collapse:collapse;">
            ${tableHead(['Name', 'Type', 'Distance'])}
            <tbody>${schoolList.map((s) => `<tr style="${trBorder}"><td style="${tdStyle}">${s.ofsted_url ? `<a href="${s.ofsted_url}" target="_blank">${s.name}</a>` : s.name}</td><td style="${tdStyle}">${s.type}</td><td style="${tdStyle};text-align:right;">${s.distance_miles.toFixed(2)} mi</td></tr>`).join('')}</tbody>
          </table>
        </div>`;
      };

      sections.push(`<div class="section">
        <h2>School Ratings</h2>
        <table><tbody>${statsRows}</tbody></table>
        ${renderSchoolList('Primary Schools', schools.primary_schools)}
        ${renderSchoolList('Secondary Schools', schools.secondary_schools)}
        ${renderSchoolList('Nursery Schools', schools.nursery_schools)}
        ${renderSchoolList('All-Through Schools', schools.all_through_schools)}
      </div>`);
    }

    const broadband = getServiceData<BroadbandReportData>('broadband');
    if (broadband) {
      sections.push(`<div class="section">
        <h2>Broadband Speeds</h2>
        <table><tbody>
          <tr><td>Max Download</td><td>${broadband.max_download_mbps} Mbps</td></tr>
          <tr><td>Max Upload</td><td>${broadband.max_upload_mbps} Mbps</td></tr>
          ${broadband.full_fibre ? `<tr><td>Full Fibre Availability</td><td>${broadband.full_fibre.availability_pct}%</td></tr>` : ''}
          <tr><td>Data Source</td><td>${broadband.data_source}</td></tr>
        </tbody></table>
      </div>`);
    }

    const mobile = getServiceData<MobileCoverageReportData>('mobile');
    if (mobile) {
      const providerRowsHtml = mobile.providers
        ? (['ee', 'three', 'o2', 'vodafone'] as const)
            .map((provider) => {
              const pData = mobile.providers![provider] as ProviderCoverage;
              return `<tr style="${trBorder}"><td style="${tdStyle};text-transform:uppercase;">${provider}</td><td style="${tdStyle};text-align:center;">${pData.voice_outdoor}%</td><td style="${tdStyle};text-align:center;">${pData.voice_indoor}%</td><td style="${tdStyle};text-align:center;">${pData.data_outdoor}%</td><td style="${tdStyle};text-align:center;">${pData.data_indoor}%</td></tr>`;
            })
            .join('')
        : '';

      sections.push(`<div class="section">
        <h2>Mobile Coverage</h2>
        <table><tbody>
          <tr><td>4G Coverage</td><td>${mobile.scores.four_g_coverage}%</td></tr>
          <tr><td>5G Coverage</td><td>${mobile.scores.five_g_coverage}%</td></tr>
          <tr><td>Overall Coverage</td><td>${mobile.scores.overall_coverage}%</td></tr>
        </tbody></table>
        ${providerRowsHtml ? `<div style="margin-top:12px;"><h4 style="font-size:15px;font-weight:600;margin:0 0 8px;">Provider Breakdown</h4><table style="width:100%;border-collapse:collapse;">${tableHead(['Provider', 'Voice Outdoor', 'Voice Indoor', 'Data Outdoor', 'Data Indoor'])}<tbody>${providerRowsHtml}</tbody></table></div>` : ''}
      </div>`);
    }

    const councilTax = getServiceData<CouncilTaxReportData>('council_tax');
    if (councilTax) {
      sections.push(`<div class="section">
        <h2>Council Tax</h2>
        <table><tbody>
          ${councilTax.band ? `<tr><td>Band</td><td>${councilTax.band}</td></tr>` : ''}
          ${councilTax.band_range ? `<tr><td>Band Range</td><td>${councilTax.band_range}</td></tr>` : ''}
          ${councilTax.local_authority ? `<tr><td>Local Authority</td><td>${councilTax.local_authority}</td></tr>` : ''}
          <tr><td>Country</td><td>${councilTax.country}</td></tr>
          <tr><td>Exact Match</td><td>${councilTax.is_exact_match ? 'Yes' : 'No'}</td></tr>
        </tbody></table>
      </div>`);
    }

    const savedLocations = getServiceData<SavedLocationReportData>('saved_locations');
    if (savedLocations?.distances?.length) {
      const distanceRows = savedLocations.distances
        .map(
          (loc) =>
            `<tr style="${trBorder}"><td style="${tdStyle}">${loc.location_name}</td><td style="${tdStyle}">${loc.address}</td><td style="${tdStyle};text-align:right;">${loc.distance_miles.toFixed(2)} mi</td><td style="${tdStyle};text-align:right;">${loc.driving_time_mins != null ? loc.driving_time_mins + ' min' : '-'}</td><td style="${tdStyle};text-align:right;">${loc.walking_time_mins != null ? loc.walking_time_mins + ' min' : '-'}</td></tr>`
        )
        .join('');
      sections.push(`<div class="section">
        <h2>Saved Locations</h2>
        <table style="width:100%;border-collapse:collapse;">
          ${tableHead(['Location', 'Address', 'Distance', 'Driving', 'Walking'])}
          <tbody>${distanceRows}</tbody>
        </table>
      </div>`);
    }

    const poi = getServiceData<PoiReportData>('poi');
    if (poi?.by_category) {
      const categoryHtml = Object.entries(poi.by_category)
        .map(([category, places]) => {
          const placesHtml = places
            .slice(0, 5)
            .map(
              (place) =>
                `<tr style="${trBorder}"><td style="${tdStyle}">${place.google_maps_url ? `<a href="${place.google_maps_url}" target="_blank">${place.name}</a>` : place.name}</td><td style="${tdStyle}">${place.address || '-'}</td><td style="${tdStyle};text-align:right;">${place.distance_km.toFixed(2)} km</td><td style="${tdStyle};text-align:right;">${place.driving_time_min != null ? place.driving_time_min + ' min' : '-'}</td><td style="${tdStyle};text-align:right;">${place.walking_time_min != null ? place.walking_time_min + ' min' : '-'}</td></tr>`
            )
            .join('');
          return `<div style="margin-bottom:16px;">
          <h4 style="font-size:15px;font-weight:600;margin:0 0 8px;text-transform:capitalize;">${category} (${places.length})</h4>
          <table style="width:100%;border-collapse:collapse;">
            ${tableHead(['Name', 'Address', 'Distance', 'Drive', 'Walk'])}
            <tbody>${placesHtml}</tbody>
          </table>
          ${places.length > 5 ? `<p style="font-size:12px;color:#9ca3af;margin-top:4px;">Showing 5 of ${places.length}</p>` : ''}
        </div>`;
        })
        .join('');
      sections.push(`<div class="section">
        <h2>Places of Interest</h2>
        <p style="color:#6b7280;font-size:14px;margin:0 0 16px;">${poi.total_places} places within ${poi.search_radius_km} km</p>
        ${categoryHtml}
      </div>`);
    }

    if (!sections.length) return '';
    return `<h2 style="font-size:22px;font-weight:700;margin:32px 0 16px;border-bottom:2px solid #e5e7eb;padding-bottom:8px;">Context Reports</h2>${sections.join('')}`;
  }

  toggleFavorite(): void {
    const propertyValue = this.property();
    if (!propertyValue) return;

    const wasFavorited = propertyValue.is_favorited;
    propertyValue.is_favorited = !wasFavorited;

    const action = wasFavorited
      ? this.favoritesService.removeFavorite(propertyValue.uuid)
      : this.favoritesService.addFavorite(propertyValue.uuid);

    action.subscribe({
      next: () => {
        this.notificationService.success(
          wasFavorited ? 'Removed from favorites' : 'Added to favorites'
        );
      },
      error: () => {
        propertyValue.is_favorited = wasFavorited;
        this.notificationService.error('Failed to update favorite');
      },
    });
  }
}

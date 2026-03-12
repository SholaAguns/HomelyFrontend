import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PoiReportComponent } from './poi-report.component';

describe('PoiReportComponent', () => {
  let component: PoiReportComponent;
  let fixture: ComponentFixture<PoiReportComponent>;

  const mockPoiData = {
    total_places: 15,
    categories: ['restaurant', 'cafe'],
    by_category: {
      restaurant: [
        {
          place_id: '1',
          name: 'Test Restaurant',
          distance_km: 0.5,
          address: '123 Test St',
          rating: 4.5,
          user_ratings_total: 100,
        },
      ],
      cafe: [],
    },
    data_source: 'Google Maps API',
    search_radius_km: 1.6,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PoiReportComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PoiReportComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('data', mockPoiData);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

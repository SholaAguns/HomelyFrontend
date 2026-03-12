import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SchoolsReportComponent } from './schools-report.component';

describe('SchoolsReportComponent', () => {
  let component: SchoolsReportComponent;
  let fixture: ComponentFixture<SchoolsReportComponent>;

  const mockSchoolsData = {
    primary_schools: [
      {
        urn: '100000',
        name: "St Mary's Primary",
        distance_km: 0.5,
        distance_miles: 0.31,
        pupil_count: 249,
        phase: 'Primary',
        type: 'Voluntary aided school',
        gender: 'Mixed',
        ofsted_url: 'https://reports.ofsted.gov.uk/provider/21/100000',
      },
    ],
    secondary_schools: [],
    statistics: {
      total_schools: 1,
      primary_count: 1,
      secondary_count: 0,
      closest_primary_km: 0.5,
      closest_secondary_km: null,
    },
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SchoolsReportComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SchoolsReportComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('data', mockSchoolsData);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display school statistics', () => {
    const stats = component.stats();
    expect(stats.primary_count).toBe(1);
    expect(stats.secondary_count).toBe(0);
  });
});

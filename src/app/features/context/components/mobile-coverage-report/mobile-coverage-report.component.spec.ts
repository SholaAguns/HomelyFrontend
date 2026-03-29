import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MobileCoverageReportComponent } from './mobile-coverage-report.component';

describe('MobileCoverageReportComponent', () => {
  let component: MobileCoverageReportComponent;
  let fixture: ComponentFixture<MobileCoverageReportComponent>;

  const mockMobileData = {
    scores: {
      '4g_coverage': 85,
      '5g_coverage': 60,
      overall_coverage: 75,
    },
    '4g_coverage': {
      indoor: {
        all_4_networks: 45,
        '3_networks': 25,
        '2_networks': 15,
        '1_network': 10,
        no_coverage: 5,
      },
      outdoor: {
        all_4_networks: 60,
        '3_networks': 20,
        '2_networks': 10,
        '1_network': 8,
        no_coverage: 2,
      },
    },
    data_source: 'Ofcom Mobile Coverage 2024-07',
    granularity: 'Output Area (~125 households)',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MobileCoverageReportComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MobileCoverageReportComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('data', mockMobileData);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

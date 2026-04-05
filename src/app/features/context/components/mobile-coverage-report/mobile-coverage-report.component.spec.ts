import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MobileCoverageReportComponent } from './mobile-coverage-report.component';

describe('MobileCoverageReportComponent', () => {
  let component: MobileCoverageReportComponent;
  let fixture: ComponentFixture<MobileCoverageReportComponent>;

  const mockMobileData = {
    scores: {
      four_g_coverage: 85,
      five_g_coverage: 60,
      overall_coverage: 75,
    },
    four_g_coverage: {
      indoor: {
        all_4_networks: 45,
        three_networks: 25,
        two_networks: 15,
        one_network: 10,
        no_coverage: 5,
      },
      outdoor: {
        all_4_networks: 60,
        three_networks: 20,
        two_networks: 10,
        one_network: 8,
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

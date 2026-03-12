import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BroadbandReportComponent } from './broadband-report.component';

describe('BroadbandReportComponent', () => {
  let component: BroadbandReportComponent;
  let fixture: ComponentFixture<BroadbandReportComponent>;

  const mockBroadbandData = {
    postcode: 'SW1A 1AA',
    oa_code: 'E00000001',
    max_download_mbps: 900,
    max_upload_mbps: 110,
    full_fibre: {
      availability_pct: 78.5,
      take_up_pct: 45.2,
    },
    data_source: 'Ofcom Connected Nations 2024-07',
    granularity: 'Output Area (~125 households)',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BroadbandReportComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BroadbandReportComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('data', mockBroadbandData);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

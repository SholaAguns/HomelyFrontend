import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MobileCoverageReportComponent } from './mobile-coverage-report.component';

describe('MobileCoverageReportComponent', () => {
  let component: MobileCoverageReportComponent;
  let fixture: ComponentFixture<MobileCoverageReportComponent>;

  const mockMobileData = {
    operators: [
      {
        name: 'EE',
        indoor_4g: 92.5,
        outdoor_4g: 98.2,
        indoor_5g: 45.0,
        outdoor_5g: 78.0,
      },
    ],
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

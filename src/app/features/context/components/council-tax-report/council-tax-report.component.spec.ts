import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CouncilTaxReportComponent } from './council-tax-report.component';

describe('CouncilTaxReportComponent', () => {
  let component: CouncilTaxReportComponent;
  let fixture: ComponentFixture<CouncilTaxReportComponent>;

  const mockCouncilTaxData = {
    band: 'D',
    band_range: '£68,001 to £88,000',
    local_authority: 'Westminster City Council',
    address: '10 Downing Street, London',
    is_exact_match: true,
    country: 'England',
    retrieved_at: '2024-01-01T12:00:00Z',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CouncilTaxReportComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CouncilTaxReportComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('data', mockCouncilTaxData);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

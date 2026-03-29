import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CrimeReportComponent } from './crime-report.component';
import { signal } from '@angular/core';

describe('CrimeReportComponent', () => {
  let component: CrimeReportComponent;
  let fixture: ComponentFixture<CrimeReportComponent>;

  const mockCrimeData = {
    postcode_sector: 'SW1A',
    period: 'Last 12 months',
    total_crimes: 1234,
    crime_rating: 'Moderate',
    categories: {
      'anti-social-behaviour': 345,
      'violent-crime': 234,
      theft: 189,
    },
    top_categories: [
      { category: 'Anti-social behaviour', count: 345 },
      { category: 'Violent crime', count: 234 },
    ],
    data_source: 'UK Police API',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrimeReportComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CrimeReportComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('data', mockCrimeData);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display total crimes', () => {
    const metricValue = fixture.nativeElement.querySelector('.metric-value');
    expect(metricValue.textContent.trim()).toBe('1234');
  });

  it('should display crime rating', () => {
    const crimeRating = fixture.nativeElement.querySelector('.crime-rating');
    expect(crimeRating.textContent.trim()).toBe('Moderate');
  });

  it('should apply correct rating class for moderate rating', () => {
    const ratingClass = component.ratingClass();
    expect(ratingClass['rating-moderate']).toBe(true);
  });

  it('should apply correct rating class for high rating', () => {
    const highRatingData = { ...mockCrimeData, crime_rating: 'High' };
    fixture.componentRef.setInput('data', highRatingData);
    fixture.detectChanges();

    const ratingClass = component.ratingClass();
    expect(ratingClass['rating-high']).toBe(true);
  });

  it('should display top categories', () => {
    const categoryItems = fixture.nativeElement.querySelectorAll('.category-item');
    expect(categoryItems.length).toBe(2);
  });

  it('should display category names and counts', () => {
    const firstCategory = fixture.nativeElement.querySelector('.category-item');
    const categoryName = firstCategory.querySelector('.category-name');
    const categoryCount = firstCategory.querySelector('.category-count');

    expect(categoryName.textContent.trim()).toBe('Anti-social behaviour');
    expect(categoryCount.textContent.trim()).toBe('345');
  });

  it('should display data source', () => {
    const dataSource = fixture.nativeElement.querySelector('.data-source');
    expect(dataSource.textContent).toContain('UK Police API');
    expect(dataSource.textContent).toContain('SW1A');
  });
});

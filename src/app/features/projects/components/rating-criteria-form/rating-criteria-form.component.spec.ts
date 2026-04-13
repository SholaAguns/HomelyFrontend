import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RatingCriteriaFormComponent } from './rating-criteria-form.component';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('RatingCriteriaFormComponent', () => {
  let component: RatingCriteriaFormComponent;
  let fixture: ComponentFixture<RatingCriteriaFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RatingCriteriaFormComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(RatingCriteriaFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default and additional criteria', () => {
    expect(component.defaultCriteria().length).toBe(3);
    expect(component.additionalCriteria().length).toBe(6);
  });

  it('should require name field', () => {
    const nameControl = component.form.get('name');
    expect(nameControl?.hasError('required')).toBe(true);

    nameControl?.setValue('Test Criteria');
    expect(nameControl?.hasError('required')).toBe(false);
  });

  it('should update criterion weight', () => {
    const criterion = component.defaultCriteria()[0];
    const originalWeight = criterion.weight;

    component.updateCriterionWeight(criterion, 1.5, 'default');

    const updatedCriterion = component.defaultCriteria().find((c) => c.name === criterion.name);
    expect(updatedCriterion?.weight).toBe(1.5);
    expect(updatedCriterion?.weight).not.toBe(originalWeight);
  });

  it('should update criterion dealbreaker status', () => {
    const criterion = component.defaultCriteria()[0];

    component.updateCriterionDealbreaker(criterion, true, 'default');

    const updatedCriterion = component.defaultCriteria().find((c) => c.name === criterion.name);
    expect(updatedCriterion?.is_dealbreaker).toBe(true);
  });
});

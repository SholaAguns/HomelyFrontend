import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { RatingCriteriaCreateComponent } from './rating-criteria-create.component';
import { RatingCriteriaFormComponent } from '../../../projects/components/rating-criteria-form/rating-criteria-form.component';
import { RatingCriteriaStore } from '../../../projects/store/rating-criteria.store';
import { SavedLocationService } from '../../../../core/services/saved-location.service';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';

describe('RatingCriteriaCreateComponent', () => {
  let component: RatingCriteriaCreateComponent;
  let fixture: ComponentFixture<RatingCriteriaCreateComponent>;

  beforeEach(async () => {
    const mockRatingCriteriaStore = {
      loading: () => false,
      saving: () => false,
      error: () => null,
      allCriteria: () => [],
      getByUuid: () => () => null,
      loadAll: () => {},
      loadById: () => {},
      create: () => {},
      update: () => {},
    };

    const mockSavedLocationService = {
      getAll: () => of([]),
    };

    const mockRouter = {
      navigate: () => {},
    };

    const mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: () => null,
        },
        queryParamMap: {
          get: () => null,
        },
      },
    };

    await TestBed.configureTestingModule({
      imports: [RatingCriteriaCreateComponent, RatingCriteriaFormComponent],
      providers: [
        { provide: RatingCriteriaStore, useValue: mockRatingCriteriaStore },
        { provide: SavedLocationService, useValue: mockSavedLocationService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RatingCriteriaCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render rating criteria form', () => {
    const compiled = fixture.nativeElement;
    const form = compiled.querySelector('app-rating-criteria-form');
    expect(form).toBeTruthy();
  });

  it('should display create heading', () => {
    const compiled = fixture.nativeElement;
    const heading = compiled.querySelector('h1');
    expect(heading.textContent).toBe('Create Rating Criteria');
  });
});

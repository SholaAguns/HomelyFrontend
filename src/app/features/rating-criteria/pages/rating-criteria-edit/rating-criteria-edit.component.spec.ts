import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { RatingCriteriaEditComponent } from './rating-criteria-edit.component';
import { RatingCriteriaFormComponent } from '../../../projects/components/rating-criteria-form/rating-criteria-form.component';
import { RatingCriteriaStore } from '../../../projects/store/rating-criteria.store';
import { SavedLocationService } from '../../../../core/services/saved-location.service';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';

describe('RatingCriteriaEditComponent', () => {
  let component: RatingCriteriaEditComponent;
  let fixture: ComponentFixture<RatingCriteriaEditComponent>;

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
          get: () => 'test-uuid',
        },
        queryParamMap: {
          get: () => null,
        },
      },
    };

    await TestBed.configureTestingModule({
      imports: [RatingCriteriaEditComponent, RatingCriteriaFormComponent],
      providers: [
        { provide: RatingCriteriaStore, useValue: mockRatingCriteriaStore },
        { provide: SavedLocationService, useValue: mockSavedLocationService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RatingCriteriaEditComponent);
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

  it('should display edit heading', () => {
    const compiled = fixture.nativeElement;
    const heading = compiled.querySelector('h1');
    expect(heading.textContent).toBe('Edit Rating Criteria');
  });
});

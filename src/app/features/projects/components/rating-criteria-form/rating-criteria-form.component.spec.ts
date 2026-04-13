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

  describe('savedLocationCriteria', () => {
    it('should initialize with empty savedLocationCriteria', () => {
      expect(component.savedLocationCriteria().length).toBe(0);
    });

    it('should add saved location criterion', () => {
      const uuid = 'location-uuid-1';
      const name = 'Office';

      component.addSavedLocationCriterion(uuid, name);

      expect(component.savedLocationCriteria().length).toBe(1);
      const criterion = component.savedLocationCriteria()[0];
      expect(criterion.name).toBe('Distance to Office');
      expect(criterion.source).toBe('context_report');
      expect(criterion.field_name).toBe('saved_locations');
      expect(criterion.saved_location_uuid).toBe(uuid);
      expect(criterion.enabled).toBe(true);
      expect(criterion.weight).toBe(1.0);
      expect(criterion.is_dealbreaker).toBe(false);
    });

    it('should add multiple saved location criteria', () => {
      component.addSavedLocationCriterion('uuid-1', 'Office');
      component.addSavedLocationCriterion('uuid-2', 'School');

      expect(component.savedLocationCriteria().length).toBe(2);
      expect(component.selectedSavedLocationUuids().length).toBe(2);
      expect(component.selectedSavedLocationUuids()).toContain('uuid-1');
      expect(component.selectedSavedLocationUuids()).toContain('uuid-2');
    });

    it('should remove saved location criterion', () => {
      const uuid = 'location-uuid-1';
      component.addSavedLocationCriterion(uuid, 'Office');
      expect(component.savedLocationCriteria().length).toBe(1);

      component.removeSavedLocationCriterion(uuid);

      expect(component.savedLocationCriteria().length).toBe(0);
      expect(component.selectedSavedLocationUuids().length).toBe(0);
    });

    it('should update saved location criterion weight', () => {
      component.addSavedLocationCriterion('uuid-1', 'Office');
      const criterion = component.savedLocationCriteria()[0];

      component.updateCriterionWeight(criterion, 2.0, 'savedLocation');

      const updated = component.savedLocationCriteria()[0];
      expect(updated.weight).toBe(2.0);
    });

    it('should update saved location criterion dealbreaker status', () => {
      component.addSavedLocationCriterion('uuid-1', 'Office');
      const criterion = component.savedLocationCriteria()[0];

      component.updateCriterionDealbreaker(criterion, true, 'savedLocation');

      const updated = component.savedLocationCriteria()[0];
      expect(updated.is_dealbreaker).toBe(true);
    });
  });

  describe('poiCriteria', () => {
    it('should initialize with empty poiCriteria', () => {
      expect(component.poiCriteria().length).toBe(0);
    });

    it('should add POI criterion', () => {
      component.addPoiCriterion('supermarket');

      expect(component.poiCriteria().length).toBe(1);
      const criterion = component.poiCriteria()[0];
      expect(criterion.name).toBe('Distance to Supermarket');
      expect(criterion.source).toBe('context_report');
      expect(criterion.field_name).toBe('poi');
      expect(criterion.poi_category).toBe('supermarket');
      expect(criterion.enabled).toBe(true);
      expect(criterion.weight).toBe(1.0);
      expect(criterion.is_dealbreaker).toBe(false);
    });

    it('should add multiple POI criteria', () => {
      component.addPoiCriterion('supermarket');
      component.addPoiCriterion('gym');

      expect(component.poiCriteria().length).toBe(2);
      expect(component.selectedPoiCategories().length).toBe(2);
      expect(component.selectedPoiCategories()).toContain('supermarket');
      expect(component.selectedPoiCategories()).toContain('gym');
    });

    it('should remove POI criterion', () => {
      component.addPoiCriterion('supermarket');
      expect(component.poiCriteria().length).toBe(1);

      component.removePoiCriterion('supermarket');

      expect(component.poiCriteria().length).toBe(0);
      expect(component.selectedPoiCategories().length).toBe(0);
    });

    it('should update POI criterion weight', () => {
      component.addPoiCriterion('supermarket');
      const criterion = component.poiCriteria()[0];

      component.updateCriterionWeight(criterion, 1.5, 'poi');

      const updated = component.poiCriteria()[0];
      expect(updated.weight).toBe(1.5);
    });

    it('should update POI criterion dealbreaker status', () => {
      component.addPoiCriterion('supermarket');
      const criterion = component.poiCriteria()[0];

      component.updateCriterionDealbreaker(criterion, true, 'poi');

      const updated = component.poiCriteria()[0];
      expect(updated.is_dealbreaker).toBe(true);
    });
  });
});

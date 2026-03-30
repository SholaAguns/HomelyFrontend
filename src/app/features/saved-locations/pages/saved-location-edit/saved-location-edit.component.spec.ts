import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Router, ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { SavedLocationEditComponent } from './saved-location-edit.component';
import { SavedLocationService } from '../../../../core/services/saved-location.service';
import { SavedLocationFormComponent } from '../../components/saved-location-form/saved-location-form.component';
import {
  mockSavedLocation,
  mockCreateSavedLocationDto,
} from '../../../../shared/mocks/models/saved-location-models.mock';

describe('SavedLocationEditComponent', () => {
  let component: SavedLocationEditComponent;
  let fixture: ComponentFixture<SavedLocationEditComponent>;
  let mockSavedLocationService: any;
  let mockRouter: any;
  let mockActivatedRoute: any;

  beforeEach(async () => {
    mockSavedLocationService = {
      getByUuid: vi.fn().mockReturnValue(of(mockSavedLocation)),
      update: vi.fn().mockReturnValue(of({ ...mockSavedLocation, name: 'Updated Home' })),
    };

    mockRouter = {
      navigate: vi.fn(),
    };

    mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: vi.fn().mockReturnValue('test-location-uuid-1'),
        },
      },
    };

    await TestBed.configureTestingModule({
      imports: [SavedLocationEditComponent, SavedLocationFormComponent],
      providers: [
        { provide: SavedLocationService, useValue: mockSavedLocationService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SavedLocationEditComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should load location on init', () => {
      fixture.detectChanges();

      expect(mockActivatedRoute.snapshot.paramMap.get).toHaveBeenCalledWith('uuid');
      expect(mockSavedLocationService.getByUuid).toHaveBeenCalledWith('test-location-uuid-1');
      expect(component.location()).toEqual(mockSavedLocation);
      expect(component.loading()).toBe(false);
    });

    it('should set loading state correctly', () => {
      expect(component.loading()).toBe(false);

      fixture.detectChanges();

      expect(component.loading()).toBe(false);
    });

    it('should handle error when loading fails', () => {
      mockSavedLocationService.getByUuid.mockReturnValue(
        throwError(() => new Error('Load failed'))
      );

      fixture.detectChanges();

      expect(component.error()).toBe('Failed to load location');
      expect(component.loading()).toBe(false);
    });

    it('should not load if no uuid in route', () => {
      mockActivatedRoute.snapshot.paramMap.get.mockReturnValue(null);

      fixture.detectChanges();

      expect(mockSavedLocationService.getByUuid).not.toHaveBeenCalled();
    });
  });

  describe('onFormSubmit', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should update location and navigate to list on success', () => {
      const updateData = { ...mockCreateSavedLocationDto, name: 'Updated Home' };
      component.onFormSubmit(updateData);

      expect(mockSavedLocationService.update).toHaveBeenCalledWith(
        mockSavedLocation.uuid,
        updateData
      );
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/saved-locations']);
      expect(component.error()).toBeNull();
    });

    it('should set error message on failure', () => {
      mockSavedLocationService.update.mockReturnValue(throwError(() => new Error('Update failed')));

      component.onFormSubmit(mockCreateSavedLocationDto);

      expect(component.error()).toBe('Failed to update location. Please try again.');
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it('should not update if no location loaded', () => {
      component.location.set(null);

      component.onFormSubmit(mockCreateSavedLocationDto);

      expect(mockSavedLocationService.update).not.toHaveBeenCalled();
    });

    it('should clear previous error on new submit', () => {
      component.error.set('Previous error');

      component.onFormSubmit(mockCreateSavedLocationDto);

      expect(mockSavedLocationService.update).toHaveBeenCalled();
    });
  });

  describe('onFormCancel', () => {
    it('should navigate back to list', () => {
      component.onFormCancel();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/saved-locations']);
    });
  });

  describe('getInitialData', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should return initial data from location', () => {
      const initialData = component.getInitialData();

      expect(initialData).toEqual({
        name: mockSavedLocation.name,
        postcode: mockSavedLocation.postcode,
        address_line_1: mockSavedLocation.address_line_1,
        address_line_2: mockSavedLocation.address_line_2,
        city: mockSavedLocation.city,
      });
    });

    it('should return undefined if no location loaded', () => {
      component.location.set(null);

      const initialData = component.getInitialData();

      expect(initialData).toBeUndefined();
    });
  });
});

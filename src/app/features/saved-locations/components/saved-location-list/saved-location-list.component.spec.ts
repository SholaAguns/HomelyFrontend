import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { SavedLocationListComponent } from './saved-location-list.component';
import { SavedLocationService } from '../../../../core/services/saved-location.service';
import {
  mockSavedLocation,
  mockSavedLocation2,
} from '../../../../shared/mocks/models/saved-location-models.mock';

describe('SavedLocationListComponent', () => {
  let component: SavedLocationListComponent;
  let fixture: ComponentFixture<SavedLocationListComponent>;
  let mockSavedLocationService: any;
  let mockRouter: any;

  beforeEach(async () => {
    mockSavedLocationService = {
      getAll: vi.fn().mockReturnValue(of([mockSavedLocation, mockSavedLocation2])),
      delete: vi.fn().mockReturnValue(of(void 0)),
    };

    mockRouter = {
      navigate: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [SavedLocationListComponent],
      providers: [
        { provide: SavedLocationService, useValue: mockSavedLocationService },
        { provide: Router, useValue: mockRouter },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SavedLocationListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should load locations on init', () => {
      fixture.detectChanges();

      expect(mockSavedLocationService.getAll).toHaveBeenCalled();
      expect(component.locations().length).toBe(2);
      expect(component.locations()[0]).toEqual(mockSavedLocation);
    });

    it('should set loading state correctly', () => {
      expect(component.loading()).toBe(false);

      fixture.detectChanges();

      expect(component.loading()).toBe(false);
    });

    it('should handle error when loading fails', () => {
      mockSavedLocationService.getAll.mockReturnValue(
        throwError(() => new Error('Failed to load'))
      );

      fixture.detectChanges();

      expect(component.error()).toBe('Failed to load saved locations');
      expect(component.loading()).toBe(false);
    });
  });

  describe('onCreateNew', () => {
    it('should navigate to create page', () => {
      component.onCreateNew();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/saved-locations/new']);
    });
  });

  describe('onEdit', () => {
    it('should navigate to edit page with uuid', () => {
      component.onEdit('test-uuid');

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/saved-locations', 'test-uuid', 'edit']);
    });
  });

  describe('delete functionality', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should set deleteConfirmUuid when onDeleteClick is called', () => {
      expect(component.deleteConfirmUuid()).toBeNull();

      component.onDeleteClick('test-uuid');

      expect(component.deleteConfirmUuid()).toBe('test-uuid');
    });

    it('should clear deleteConfirmUuid when onDeleteCancel is called', () => {
      component.deleteConfirmUuid.set('test-uuid');

      component.onDeleteCancel();

      expect(component.deleteConfirmUuid()).toBeNull();
    });

    it('should delete location and update list on confirm', () => {
      component.deleteConfirmUuid.set(mockSavedLocation.uuid);

      component.onDeleteConfirm();

      expect(mockSavedLocationService.delete).toHaveBeenCalledWith(mockSavedLocation.uuid);
      expect(component.locations().length).toBe(1);
      expect(component.locations()[0].uuid).toBe(mockSavedLocation2.uuid);
      expect(component.deleteConfirmUuid()).toBeNull();
    });

    it('should handle delete error', () => {
      mockSavedLocationService.delete.mockReturnValue(throwError(() => new Error('Delete failed')));
      component.deleteConfirmUuid.set(mockSavedLocation.uuid);

      component.onDeleteConfirm();

      expect(component.error()).toBe('Failed to delete location');
      expect(component.deleteConfirmUuid()).toBeNull();
    });

    it('should not delete if no uuid is set', () => {
      component.deleteConfirmUuid.set(null);

      component.onDeleteConfirm();

      expect(mockSavedLocationService.delete).not.toHaveBeenCalled();
    });
  });

  describe('getFullAddress', () => {
    it('should format full address with all fields', () => {
      const address = component.getFullAddress(mockSavedLocation2);

      expect(address).toBe('1 Example Street, Floor 3, London, EC1A 1BB');
    });

    it('should format address excluding empty fields', () => {
      const address = component.getFullAddress(mockSavedLocation);

      expect(address).toBe('10 Downing Street, London, SW1A 1AA');
    });
  });

  describe('loadLocations', () => {
    it('should reload locations', () => {
      fixture.detectChanges();
      mockSavedLocationService.getAll.mockClear();

      component.loadLocations();

      expect(mockSavedLocationService.getAll).toHaveBeenCalled();
    });

    it('should clear error on reload', () => {
      component.error.set('Previous error');

      component.loadLocations();

      expect(component.error()).toBeNull();
    });
  });
});

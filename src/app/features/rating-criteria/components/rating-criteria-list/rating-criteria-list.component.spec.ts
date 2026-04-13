import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { RatingCriteriaListComponent } from './rating-criteria-list.component';
import { RatingCriteriaService } from '../../../../core/services/rating-criteria.service';
import {
  mockRatingCriteria,
  mockRatingCriteria2,
} from '../../../../shared/mocks/models/rating-criteria-models.mock';

describe('RatingCriteriaListComponent', () => {
  let component: RatingCriteriaListComponent;
  let fixture: ComponentFixture<RatingCriteriaListComponent>;
  let mockRatingCriteriaService: any;
  let mockRouter: any;

  beforeEach(async () => {
    mockRatingCriteriaService = {
      getAll: vi.fn().mockReturnValue(of([mockRatingCriteria, mockRatingCriteria2])),
      delete: vi.fn().mockReturnValue(of(void 0)),
      copy: vi.fn().mockReturnValue(
        of({
          ...mockRatingCriteria,
          uuid: 'copied-uuid',
          name: 'City Living Criteria (Copy)',
        })
      ),
    };

    mockRouter = {
      navigate: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [RatingCriteriaListComponent],
      providers: [
        { provide: RatingCriteriaService, useValue: mockRatingCriteriaService },
        { provide: Router, useValue: mockRouter },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RatingCriteriaListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should load rating criteria on init', () => {
      fixture.detectChanges();

      expect(mockRatingCriteriaService.getAll).toHaveBeenCalled();
      expect(component.ratingCriteria().length).toBe(2);
      expect(component.ratingCriteria()[0]).toEqual(mockRatingCriteria);
    });

    it('should set loading state correctly', () => {
      expect(component.loading()).toBe(false);

      fixture.detectChanges();

      expect(component.loading()).toBe(false);
    });

    it('should handle error when loading fails', () => {
      mockRatingCriteriaService.getAll.mockReturnValue(
        throwError(() => new Error('Failed to load'))
      );

      fixture.detectChanges();

      expect(component.error()).toBe('Failed to load rating criteria');
      expect(component.loading()).toBe(false);
    });
  });

  describe('onCreateNew', () => {
    it('should navigate to create page', () => {
      component.onCreateNew();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/rating-criteria/new']);
    });
  });

  describe('onEdit', () => {
    it('should navigate to edit page with uuid', () => {
      component.onEdit('test-uuid');

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/rating-criteria', 'test-uuid', 'edit']);
    });
  });

  describe('onCopy', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should call copy service and add to list on success', () => {
      const initialLength = component.ratingCriteria().length;
      component.onCopy(mockRatingCriteria.uuid);

      expect(mockRatingCriteriaService.copy).toHaveBeenCalledWith(mockRatingCriteria.uuid);
      expect(component.ratingCriteria().length).toBe(initialLength + 1);
      expect(component.ratingCriteria()[initialLength].name).toContain('(Copy)');
    });

    it('should set error message on copy failure', () => {
      mockRatingCriteriaService.copy.mockReturnValue(throwError(() => new Error('Copy failed')));

      component.onCopy(mockRatingCriteria.uuid);

      expect(component.error()).toBe('Failed to copy rating criteria');
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

    it('should delete criteria and update list on confirm', () => {
      component.deleteConfirmUuid.set(mockRatingCriteria.uuid);

      component.onDeleteConfirm();

      expect(mockRatingCriteriaService.delete).toHaveBeenCalledWith(mockRatingCriteria.uuid);
      expect(component.ratingCriteria().length).toBe(1);
      expect(component.ratingCriteria()[0].uuid).toBe(mockRatingCriteria2.uuid);
      expect(component.deleteConfirmUuid()).toBeNull();
    });

    it('should handle delete error', () => {
      mockRatingCriteriaService.delete.mockReturnValue(
        throwError(() => new Error('Delete failed'))
      );
      component.deleteConfirmUuid.set(mockRatingCriteria.uuid);

      component.onDeleteConfirm();

      expect(component.error()).toBe('Failed to delete rating criteria');
      expect(component.deleteConfirmUuid()).toBeNull();
    });

    it('should not delete if no uuid is set', () => {
      component.deleteConfirmUuid.set(null);

      component.onDeleteConfirm();

      expect(mockRatingCriteriaService.delete).not.toHaveBeenCalled();
    });
  });

  describe('loadRatingCriteria', () => {
    it('should reload rating criteria', () => {
      fixture.detectChanges();
      mockRatingCriteriaService.getAll.mockClear();

      component.loadRatingCriteria();

      expect(mockRatingCriteriaService.getAll).toHaveBeenCalled();
    });

    it('should clear error on reload', () => {
      component.error.set('Previous error');

      component.loadRatingCriteria();

      expect(component.error()).toBeNull();
    });
  });
});

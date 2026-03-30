import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { SavedLocationCreateComponent } from './saved-location-create.component';
import { SavedLocationService } from '../../../../core/services/saved-location.service';
import { SavedLocationFormComponent } from '../../components/saved-location-form/saved-location-form.component';
import {
  mockSavedLocation,
  mockCreateSavedLocationDto,
} from '../../../../shared/mocks/models/saved-location-models.mock';

describe('SavedLocationCreateComponent', () => {
  let component: SavedLocationCreateComponent;
  let fixture: ComponentFixture<SavedLocationCreateComponent>;
  let mockSavedLocationService: any;
  let mockRouter: any;

  beforeEach(async () => {
    mockSavedLocationService = {
      create: vi.fn().mockReturnValue(of(mockSavedLocation)),
    };

    mockRouter = {
      navigate: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [SavedLocationCreateComponent, SavedLocationFormComponent],
      providers: [
        { provide: SavedLocationService, useValue: mockSavedLocationService },
        { provide: Router, useValue: mockRouter },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SavedLocationCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('onFormSubmit', () => {
    it('should create location and navigate to list on success', () => {
      component.onFormSubmit(mockCreateSavedLocationDto);

      expect(mockSavedLocationService.create).toHaveBeenCalledWith(mockCreateSavedLocationDto);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/saved-locations']);
      expect(component.error()).toBeNull();
    });

    it('should set error message on failure', () => {
      mockSavedLocationService.create.mockReturnValue(throwError(() => new Error('Create failed')));

      component.onFormSubmit(mockCreateSavedLocationDto);

      expect(component.error()).toBe('Failed to create location. Please try again.');
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it('should clear previous error on new submit', () => {
      component.error.set('Previous error');

      component.onFormSubmit(mockCreateSavedLocationDto);

      expect(mockSavedLocationService.create).toHaveBeenCalled();
    });
  });

  describe('onFormCancel', () => {
    it('should navigate back to list', () => {
      component.onFormCancel();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/saved-locations']);
    });
  });
});

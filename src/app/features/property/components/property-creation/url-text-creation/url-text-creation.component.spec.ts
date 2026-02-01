import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { UrlTextCreationComponent } from './url-text-creation.component';
import { PropertyService } from '../../../../../core/services/property-service/property.service';
import { PropertyStore } from '../../../store/property.store';
import { PropertyFormComponent } from '../../property-form/property-form.component';
import { DeduplicationWarningComponent } from '../../deduplication-warning/deduplication-warning.component';
import {
  mockProperty,
  mockCreatePropertyDto,
  mockCreateFromInputResponse,
} from '../../../../../shared/mocks/models/property-models.mock';
import { createPropertyServiceMock } from '../../../../../shared/mocks/property-service.mock';
import { createActivatedRouteWithNestedParentMock } from '../../../../../shared/mocks/activated-route.mock';

describe('UrlTextCreationComponent', () => {
  let component: UrlTextCreationComponent;
  let fixture: ComponentFixture<UrlTextCreationComponent>;
  let propertyServiceMock: ReturnType<typeof createPropertyServiceMock>;
  let routerMock: { navigate: ReturnType<typeof vi.fn> };
  let activatedRouteMock: ReturnType<typeof createActivatedRouteWithNestedParentMock>;
  let propertyStoreMock: { checkDuplicate: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    propertyServiceMock = createPropertyServiceMock();
    routerMock = { navigate: vi.fn() };
    activatedRouteMock = createActivatedRouteWithNestedParentMock('list-uuid-1');
    propertyStoreMock = { checkDuplicate: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [UrlTextCreationComponent, PropertyFormComponent, DeduplicationWarningComponent],
      providers: [
        { provide: PropertyService, useValue: propertyServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: activatedRouteMock },
        { provide: PropertyStore, useValue: propertyStoreMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UrlTextCreationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with propertyListUuid from route params', () => {
    expect(component.propertyListUuid()).toBe('list-uuid-1');
  });

  it('should initialize with default state', () => {
    expect(component.currentStep()).toBe('input');
    expect(component.inputMode()).toBe('url');
    expect(component.loading()).toBe(false);
    expect(component.error()).toBeNull();
    expect(component.extractedData()).toBeUndefined();
    expect(component.showDuplicateModal()).toBe(false);
  });

  describe('toggleInputMode', () => {
    it('should switch to text mode', () => {
      component.toggleInputMode('text');

      expect(component.inputMode()).toBe('text');
    });

    it('should switch back to url mode', () => {
      component.toggleInputMode('text');
      component.toggleInputMode('url');

      expect(component.inputMode()).toBe('url');
    });

    it('should reset form when toggling mode', () => {
      component.inputForm.patchValue({ inputData: 'test data' });

      component.toggleInputMode('text');

      expect(component.inputForm.value.inputData).toBeNull();
    });

    it('should clear error when toggling mode', () => {
      component.error.set('Previous error');

      component.toggleInputMode('text');

      expect(component.error()).toBeNull();
    });
  });

  describe('onExtract', () => {
    it('should call createFromInput with url input', async () => {
      const url = 'https://www.rightmove.co.uk/properties/123456';
      component.inputForm.patchValue({ inputData: url });
      propertyServiceMock.createFromInput.mockReturnValue(of(mockCreateFromInputResponse));
      propertyStoreMock.checkDuplicate.mockReturnValue(null);

      component.onExtract();
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(propertyServiceMock.createFromInput).toHaveBeenCalledWith({
        input_data: url,
        input_type: 'url',
        property_list_uuid: 'list-uuid-1',
      });
    });

    it('should call createFromInput with text input', async () => {
      const text = 'Property description text';
      component.toggleInputMode('text');
      component.inputForm.patchValue({ inputData: text });
      propertyServiceMock.createFromInput.mockReturnValue(of(mockCreateFromInputResponse));
      propertyStoreMock.checkDuplicate.mockReturnValue(null);

      component.onExtract();
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(propertyServiceMock.createFromInput).toHaveBeenCalledWith({
        input_data: text,
        input_type: 'text',
        property_list_uuid: 'list-uuid-1',
      });
    });

    it('should set loading state during extraction', () => {
      component.inputForm.patchValue({ inputData: 'test' });
      propertyServiceMock.createFromInput.mockReturnValue(of(mockCreateFromInputResponse));
      propertyStoreMock.checkDuplicate.mockReturnValue(null);

      component.onExtract();

      expect(component.loading()).toBe(true);
    });

    it('should move to review step on successful extraction without duplicate', async () => {
      component.inputForm.patchValue({ inputData: 'test' });
      propertyServiceMock.createFromInput.mockReturnValue(of(mockCreateFromInputResponse));
      propertyStoreMock.checkDuplicate.mockReturnValue(null);

      component.onExtract();
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(component.currentStep()).toBe('review');
      expect(component.extractedData()).toEqual(mockCreatePropertyDto);
      expect(component.loading()).toBe(false);
    });

    it('should check for duplicates when external_id exists', async () => {
      component.inputForm.patchValue({ inputData: 'test' });
      propertyServiceMock.createFromInput.mockReturnValue(of(mockCreateFromInputResponse));
      propertyStoreMock.checkDuplicate.mockReturnValue(null);

      component.onExtract();
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(propertyStoreMock.checkDuplicate).toHaveBeenCalledWith('rightmove-123456');
    });

    it('should show duplicate modal when duplicate found', async () => {
      component.inputForm.patchValue({ inputData: 'test' });
      propertyServiceMock.createFromInput.mockReturnValue(of(mockCreateFromInputResponse));
      propertyStoreMock.checkDuplicate.mockReturnValue(mockProperty);

      component.onExtract();
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(component.showDuplicateModal()).toBe(true);
      expect(component.duplicateProperty()).toEqual(mockProperty);
      expect(component.currentStep()).toBe('input');
    });

    it('should not check duplicates when no external_id', async () => {
      const responseWithoutExternalId = {
        ...mockCreateFromInputResponse,
        property_data: { ...mockCreatePropertyDto, external_id: undefined },
      };
      component.inputForm.patchValue({ inputData: 'test' });
      propertyServiceMock.createFromInput.mockReturnValue(of(responseWithoutExternalId));

      component.onExtract();
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(propertyStoreMock.checkDuplicate).not.toHaveBeenCalled();
      expect(component.currentStep()).toBe('review');
    });

    it('should set error message on extraction failure', async () => {
      const errorMessage = 'Failed to extract property data';
      component.inputForm.patchValue({ inputData: 'test' });
      propertyServiceMock.createFromInput.mockReturnValue(
        throwError(() => ({ message: errorMessage }))
      );

      component.onExtract();
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(component.error()).toBe(errorMessage);
      expect(component.loading()).toBe(false);
      expect(component.currentStep()).toBe('input');
    });

    it('should handle response without property_data', async () => {
      const response = { success: false, message: 'Extraction failed' };
      component.inputForm.patchValue({ inputData: 'test' });
      propertyServiceMock.createFromInput.mockReturnValue(of(response));

      component.onExtract();
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(component.error()).toBe('Extraction failed');
      expect(component.currentStep()).toBe('input');
    });

    it('should not extract if form invalid', () => {
      component.inputForm.patchValue({ inputData: '' });

      component.onExtract();

      expect(propertyServiceMock.createFromInput).not.toHaveBeenCalled();
    });
  });

  describe('onFormSubmit', () => {
    beforeEach(() => {
      component.currentStep.set('review');
    });

    it('should call PropertyService.create with form data', async () => {
      propertyServiceMock.create.mockReturnValue(of(mockProperty));

      component.onFormSubmit(mockCreatePropertyDto);
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(propertyServiceMock.create).toHaveBeenCalledWith(mockCreatePropertyDto);
    });

    it('should navigate to property list on success', async () => {
      propertyServiceMock.create.mockReturnValue(of(mockProperty));

      component.onFormSubmit(mockCreatePropertyDto);
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(routerMock.navigate).toHaveBeenCalledWith(['/lists', 'list-uuid-1']);
      expect(component.loading()).toBe(false);
    });

    it('should set error message on create failure', async () => {
      const errorMessage = 'Failed to create property';
      propertyServiceMock.create.mockReturnValue(throwError(() => ({ message: errorMessage })));

      component.onFormSubmit(mockCreatePropertyDto);
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(component.error()).toBe(errorMessage);
      expect(component.loading()).toBe(false);
    });
  });

  describe('onFormCancel', () => {
    it('should navigate back to list when canceling from input step', () => {
      component.currentStep.set('input');

      component.onFormCancel();

      expect(routerMock.navigate).toHaveBeenCalledWith(['/lists', 'list-uuid-1']);
    });

    it('should go back to input step when canceling from review step', () => {
      component.currentStep.set('review');
      component.extractedData.set(mockCreatePropertyDto);

      component.onFormCancel();

      expect(component.currentStep()).toBe('input');
      expect(component.extractedData()).toBeUndefined();
      expect(component.error()).toBeNull();
    });
  });

  describe('onDeduplicationAction', () => {
    beforeEach(() => {
      component.duplicateProperty.set(mockProperty);
      component.showDuplicateModal.set(true);
    });

    it('should navigate to existing property on view action', () => {
      component.onDeduplicationAction('view');

      expect(component.showDuplicateModal()).toBe(false);
      expect(routerMock.navigate).toHaveBeenCalledWith([
        '/lists',
        'list-uuid-1',
        'properties',
        mockProperty.uuid,
      ]);
    });

    it('should proceed to review step on force_create action', () => {
      component.onDeduplicationAction('force_create');

      expect(component.showDuplicateModal()).toBe(false);
      expect(component.currentStep()).toBe('review');
    });

    it('should reset to input step on cancel action', () => {
      component.extractedData.set(mockCreatePropertyDto);

      component.onDeduplicationAction('cancel');

      expect(component.showDuplicateModal()).toBe(false);
      expect(component.currentStep()).toBe('input');
      expect(component.extractedData()).toBeUndefined();
      expect(component.duplicateProperty()).toBeNull();
    });

    it('should handle view action with no duplicate property gracefully', () => {
      component.duplicateProperty.set(null);

      component.onDeduplicationAction('view');

      expect(component.showDuplicateModal()).toBe(false);
      expect(routerMock.navigate).not.toHaveBeenCalled();
    });
  });
});

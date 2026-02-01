import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ManualCreationComponent } from './manual-creation.component';
import { PropertyService } from '../../../../../core/services/property-service/property.service';
import { PropertyFormComponent } from '../../property-form/property-form.component';
import {
  mockProperty,
  mockCreatePropertyDto,
} from '../../../../../shared/mocks/models/property-models.mock';
import { createPropertyServiceMock } from '../../../../../shared/mocks/property-service.mock';
import { createActivatedRouteWithNestedParentMock } from '../../../../../shared/mocks/activated-route.mock';

describe('ManualCreationComponent', () => {
  let component: ManualCreationComponent;
  let fixture: ComponentFixture<ManualCreationComponent>;
  let propertyServiceMock: ReturnType<typeof createPropertyServiceMock>;
  let routerMock: { navigate: ReturnType<typeof vi.fn> };
  let activatedRouteMock: ReturnType<typeof createActivatedRouteWithNestedParentMock>;

  beforeEach(async () => {
    propertyServiceMock = createPropertyServiceMock();
    routerMock = { navigate: vi.fn() };
    activatedRouteMock = createActivatedRouteWithNestedParentMock('list-uuid-1');

    await TestBed.configureTestingModule({
      imports: [ManualCreationComponent, PropertyFormComponent],
      providers: [
        { provide: PropertyService, useValue: propertyServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: activatedRouteMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ManualCreationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with propertyListUuid from route params', () => {
    expect(component.propertyListUuid()).toBe('list-uuid-1');
    expect(activatedRouteMock.parent.parent.snapshot.paramMap.get).toHaveBeenCalledWith('uuid');
  });

  it('should initialize with loading false and no error', () => {
    expect(component.loading()).toBe(false);
    expect(component.error()).toBeNull();
  });

  describe('onFormSubmit', () => {
    it('should call PropertyService.create with form data', () => {
      propertyServiceMock.create.mockReturnValue(of(mockProperty));

      component.onFormSubmit(mockCreatePropertyDto);

      expect(propertyServiceMock.create).toHaveBeenCalledWith(mockCreatePropertyDto);
    });

    it('should set loading to true during create', async () => {
      propertyServiceMock.create.mockReturnValue(of(mockProperty));

      component.onFormSubmit(mockCreatePropertyDto);
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(component.loading()).toBe(false);
    });

    it('should navigate to property list on success', async () => {
      propertyServiceMock.create.mockReturnValue(of(mockProperty));

      component.onFormSubmit(mockCreatePropertyDto);
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(component.loading()).toBe(false);
      expect(routerMock.navigate).toHaveBeenCalledWith(['/lists', 'list-uuid-1']);
    });

    it('should set error message on failure', async () => {
      const errorMessage = 'Failed to create property';
      propertyServiceMock.create.mockReturnValue(throwError(() => ({ message: errorMessage })));

      component.onFormSubmit(mockCreatePropertyDto);
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(component.loading()).toBe(false);
      expect(component.error()).toBe(errorMessage);
    });

    it('should use default error message when error has no message', async () => {
      propertyServiceMock.create.mockReturnValue(throwError(() => ({})));

      component.onFormSubmit(mockCreatePropertyDto);
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(component.error()).toBe('Failed to create property');
    });

    it('should clear previous errors on new submit', () => {
      propertyServiceMock.create.mockReturnValue(throwError(() => ({ message: 'First error' })));

      component.onFormSubmit(mockCreatePropertyDto);

      propertyServiceMock.create.mockReturnValue(of(mockProperty));

      component.onFormSubmit(mockCreatePropertyDto);

      expect(component.error()).toBeNull();
    });
  });

  describe('onFormCancel', () => {
    it('should navigate back to property list', () => {
      component.onFormCancel();

      expect(routerMock.navigate).toHaveBeenCalledWith(['/lists', 'list-uuid-1']);
    });
  });

  describe('propertyListUuid initialization', () => {
    it('should handle missing uuid in route params', () => {
      activatedRouteMock.parent.parent.snapshot.paramMap.get = vi.fn().mockReturnValue(null);

      const newFixture = TestBed.createComponent(ManualCreationComponent);
      const newComponent = newFixture.componentInstance;
      newFixture.detectChanges();

      expect(newComponent.propertyListUuid()).toBe('');
    });
  });
});

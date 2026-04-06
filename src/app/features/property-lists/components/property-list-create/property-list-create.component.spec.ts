import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { Router, ActivatedRoute } from '@angular/router';
import { Directive, HostListener, Input, Component, EventEmitter, Output } from '@angular/core';
import { PropertyListCreateComponent } from './property-list-create.component';
import { PropertyListStore } from '../../store/property-list.store';
import { createRouterMock, createActivatedRouteMock } from '../../../../shared/mocks/router.mock';
import { createPropertyListStoreMock } from '../../../../shared/mocks/property-list-store.mock';
import { SearchCriteria } from '../../../../shared/models/property-models';

@Directive({
  selector: '[routerLink]',
  standalone: true,
})
class RouterLinkStubDirective {
  @Input() routerLink: any;
  navigatedTo: any = null;

  @HostListener('click')
  onClick() {
    this.navigatedTo = this.routerLink;
  }
}

@Component({
  selector: 'app-search-criteria-form-stub',
  standalone: true,
  template: '<div></div>',
})
class SearchCriteriaFormStubComponent {
  @Input() searchCriteria: SearchCriteria | null = null;
  @Input() submitButtonText = 'Create List';
  @Input() showCancelButton = true;
  @Output() searchSubmit = new EventEmitter<SearchCriteria>();
  @Output() cancel = new EventEmitter<void>();
}

describe('PropertyListCreateComponent', () => {
  let component: PropertyListCreateComponent;
  let fixture: ComponentFixture<PropertyListCreateComponent>;
  let routerMock: any;
  let propertyListStoreMock: ReturnType<typeof createPropertyListStoreMock>;
  let activatedRouteMock: any;

  beforeEach(async () => {
    routerMock = createRouterMock();
    propertyListStoreMock = createPropertyListStoreMock();
    activatedRouteMock = createActivatedRouteMock();

    activatedRouteMock.parent = {
      snapshot: {
        paramMap: {
          get: vi.fn().mockReturnValue('test-project-uuid'),
        },
      },
    };

    await TestBed.configureTestingModule({
      imports: [RouterLinkStubDirective, SearchCriteriaFormStubComponent],
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: activatedRouteMock },
        { provide: PropertyListStore, useValue: propertyListStoreMock },
      ],
    })
      .overrideComponent(PropertyListCreateComponent, {
        remove: { imports: [] },
        add: { imports: [SearchCriteriaFormStubComponent] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(PropertyListCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load projectUuid from route on init', () => {
    component.ngOnInit();
    expect(component.projectUuid).toBe('test-project-uuid');
  });

  it('should set error when projectUuid is missing', () => {
    activatedRouteMock.parent.snapshot.paramMap.get = vi.fn().mockReturnValue('');
    component.ngOnInit();
    expect(component.error()).toBe('Project UUID is required');
  });

  describe('onSearchSubmit', () => {
    const mockSearchCriteria: SearchCriteria = {
      area: 'Manchester',
      radius: 10,
      property_types: 'house',
      bedrooms_min: 2,
      bedrooms_max: 3,
      price_min: 1000,
      price_max: 2000,
    };

    beforeEach(() => {
      component.projectUuid = 'test-project-uuid';
      propertyListStoreMock.all.set([
        {
          uuid: 'created-list-uuid',
          search_criteria: mockSearchCriteria,
        },
      ]);
    });

    it('should call store create with project_uuid and search_criteria', () => {
      component.onSearchSubmit(mockSearchCriteria);

      expect(propertyListStoreMock.create).toHaveBeenCalledWith({
        project_uuid: 'test-project-uuid',
        search_criteria: mockSearchCriteria,
      });
    });

    it('should navigate to created list after successful creation', () => {
      component.onSearchSubmit(mockSearchCriteria);
      propertyListStoreMock.loading.set(false);

      vi.advanceTimersByTime(150);

      expect(routerMock.navigate).toHaveBeenCalledWith([
        '/projects',
        'test-project-uuid',
        'lists',
        'created-list-uuid',
      ]);
    });

    it('should set error when store has error', () => {
      propertyListStoreMock.error.set('Creation failed');

      component.onSearchSubmit(mockSearchCriteria);
      propertyListStoreMock.loading.set(false);

      vi.advanceTimersByTime(150);

      expect(component.error()).toBe('Creation failed');
      expect(routerMock.navigate).not.toHaveBeenCalled();
    });

    it('should not submit when already submitting', () => {
      component.submitting.set(true);

      component.onSearchSubmit(mockSearchCriteria);

      expect(propertyListStoreMock.create).not.toHaveBeenCalled();
    });

    it('should not submit when projectUuid is missing', () => {
      component.projectUuid = '';

      component.onSearchSubmit(mockSearchCriteria);

      expect(propertyListStoreMock.create).not.toHaveBeenCalled();
    });
  });

  describe('onCancel', () => {
    it('should navigate back to project detail page', () => {
      component.projectUuid = 'test-project-uuid';

      component.onCancel();

      expect(routerMock.navigate).toHaveBeenCalledWith(['/projects', 'test-project-uuid']);
    });
  });
});

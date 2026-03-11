import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Router, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { signal, computed } from '@angular/core';
import { ContextOptionsFormComponent } from './context-options-form.component';
import { ContextOptionsStore } from '../../store/context-options.store';
import { createRouterMock } from '../../../../shared/mocks/router.mock';
import { mockContextOptions } from '../../../../shared/mocks/models/property-list-models.mock';
import { PoiType } from '../../../../shared/models/property-list-models';

function createActivatedRouteMockWithUuid(uuid: string) {
  return {
    params: [],
    snapshot: {
      paramMap: {
        get: (key: string) => (key === 'uuid' ? uuid : null),
      },
    },
  };
}

function createContextOptionsStoreMock(initialContextOptions: any = null) {
  const entitiesSignal = signal<Record<string, any>>(
    initialContextOptions ? { 'test-uuid-1': initialContextOptions } : {}
  );

  return {
    load: vi.fn(),
    save: vi.fn(),
    entities: entitiesSignal,
    loading: signal(false),
    saving: signal(false),
    error: signal<string | null>(null),
    getByPropertyList: computed(
      () => (propertyListUuid: string) => entitiesSignal()[propertyListUuid] ?? null
    ),
  };
}

describe('ContextOptionsFormComponent', () => {
  let component: ContextOptionsFormComponent;
  let fixture: ComponentFixture<ContextOptionsFormComponent>;
  let routerMock: ReturnType<typeof createRouterMock>;
  let contextOptionsStoreMock: ReturnType<typeof createContextOptionsStoreMock>;

  const propertyListUuid = 'test-uuid-1';

  async function setupComponent(initialContextOptions: any = null) {
    routerMock = createRouterMock();
    contextOptionsStoreMock = createContextOptionsStoreMock(initialContextOptions);

    await TestBed.configureTestingModule({
      imports: [ContextOptionsFormComponent, ReactiveFormsModule],
      providers: [
        { provide: Router, useValue: routerMock },
        {
          provide: ActivatedRoute,
          useValue: createActivatedRouteMockWithUuid(propertyListUuid),
        },
        { provide: ContextOptionsStore, useValue: contextOptionsStoreMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ContextOptionsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initialisation', () => {
    it('should create component', async () => {
      await setupComponent();
      expect(component).toBeTruthy();
    });

    it('should load context options on init using property list uuid from route', async () => {
      await setupComponent();
      expect(contextOptionsStoreMock.load).toHaveBeenCalledWith(propertyListUuid);
    });

    it('should initialise form with default false values when no context options loaded', async () => {
      await setupComponent();
      expect(component.form.get('enable_crime')?.value).toBe(false);
      expect(component.form.get('enable_schools')?.value).toBe(false);
      expect(component.form.get('enable_broadband')?.value).toBe(false);
      expect(component.form.get('enable_mobile')?.value).toBe(false);
      expect(component.form.get('enable_poi')?.value).toBe(false);
      expect(component.form.get('poi_search_radius_meters')?.value).toBe(1600);
    });

    it('should patch form with loaded context options values', async () => {
      await setupComponent(mockContextOptions);
      expect(component.form.get('enable_crime')?.value).toBe(mockContextOptions.enable_crime);
      expect(component.form.get('enable_broadband')?.value).toBe(
        mockContextOptions.enable_broadband
      );
      expect(component.form.get('enable_poi')?.value).toBe(mockContextOptions.enable_poi);
      expect(component.form.get('poi_search_radius_meters')?.value).toBe(
        mockContextOptions.poi_search_radius_meters
      );
    });

    it('should populate poi type selections from loaded context options', async () => {
      await setupComponent(mockContextOptions);
      mockContextOptions.poi_types.forEach((poiType: PoiType) => {
        expect(component.poiTypeSelections[poiType]).toBe(true);
      });
    });

    it('should initialise all poi type selections to false when none loaded', async () => {
      await setupComponent();
      Object.values(component.poiTypeSelections).forEach((selected) => {
        expect(selected).toBe(false);
      });
    });
  });

  describe('isPoiEnabled', () => {
    it('should return false when enable_poi is unchecked', async () => {
      await setupComponent();
      component.form.get('enable_poi')?.setValue(false);
      expect(component.isPoiEnabled).toBe(false);
    });

    it('should return true when enable_poi is checked', async () => {
      await setupComponent();
      component.form.get('enable_poi')?.setValue(true);
      expect(component.isPoiEnabled).toBe(true);
    });
  });

  describe('onPoiTypeToggle', () => {
    it('should toggle poi type selection from false to true', async () => {
      await setupComponent();
      expect(component.poiTypeSelections['restaurant']).toBe(false);
      component.onPoiTypeToggle('restaurant');
      expect(component.poiTypeSelections['restaurant']).toBe(true);
    });

    it('should toggle poi type selection from true to false', async () => {
      await setupComponent(mockContextOptions);
      expect(component.poiTypeSelections['restaurant']).toBe(true);
      component.onPoiTypeToggle('restaurant');
      expect(component.poiTypeSelections['restaurant']).toBe(false);
    });
  });

  describe('onSubmit', () => {
    it('should call store save with form values and selected poi types', async () => {
      await setupComponent();
      component.form.patchValue({
        enable_crime: true,
        enable_schools: false,
        enable_broadband: true,
        enable_mobile: false,
        enable_poi: true,
        poi_search_radius_meters: 800,
      });
      component.onPoiTypeToggle('park');
      component.onPoiTypeToggle('gym');

      component.onSubmit();

      expect(contextOptionsStoreMock.save).toHaveBeenCalledWith({
        propertyListUuid,
        data: {
          enable_crime: true,
          enable_schools: false,
          enable_broadband: true,
          enable_mobile: false,
          enable_poi: true,
          poi_search_radius_meters: 800,
          poi_types: ['gym', 'park'],
        },
      });
    });

    it('should include only selected poi types in save payload', async () => {
      await setupComponent();
      component.onPoiTypeToggle('hospital');

      component.onSubmit();

      const saveCall = contextOptionsStoreMock.save.mock.calls[0][0];
      expect(saveCall.data.poi_types).toEqual(['hospital']);
    });

    it('should pass empty poi types array when no types selected', async () => {
      await setupComponent();

      component.onSubmit();

      const saveCall = contextOptionsStoreMock.save.mock.calls[0][0];
      expect(saveCall.data.poi_types).toEqual([]);
    });
  });

  describe('onCancel', () => {
    it('should navigate to property list detail on cancel', async () => {
      await setupComponent();
      component.onCancel();
      expect(routerMock.navigate).toHaveBeenCalledWith(['/lists', propertyListUuid]);
    });
  });

  describe('store state proxies', () => {
    it('should reflect store saving state', async () => {
      await setupComponent();
      expect(component.saving).toBe(false);
    });

    it('should reflect store error state', async () => {
      await setupComponent();
      expect(component.error).toBeNull();
    });
  });
});

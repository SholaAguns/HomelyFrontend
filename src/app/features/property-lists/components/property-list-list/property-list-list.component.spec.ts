import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Router, ActivatedRoute } from '@angular/router';
import { PropertyListListComponent } from './property-list-list.component';
import { PropertyListStore } from '../../store/property-list.store';
import { createRouterMock, createActivatedRouteMock } from '../../../../shared/mocks/router.mock';
import { createPropertyListStoreMock } from '../../../../shared/mocks/property-list-store.mock';

describe('PropertyListListComponent', () => {
  let component: PropertyListListComponent;
  let fixture: ComponentFixture<PropertyListListComponent>;
  let routerMock: any;
  let propertyListStoreMock: ReturnType<typeof createPropertyListStoreMock>;

  beforeEach(async () => {
    routerMock = createRouterMock();
    propertyListStoreMock = createPropertyListStoreMock();

    await TestBed.configureTestingModule({
      imports: [PropertyListListComponent],
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: createActivatedRouteMock() },
        { provide: PropertyListStore, useValue: propertyListStoreMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PropertyListListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should call store load on init', () => {
      expect(propertyListStoreMock.load).toHaveBeenCalled();
    });
  });

  describe('onDelete', () => {
    it('should call store delete when confirmed', () => {
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

      component.onDelete('test-uuid');

      expect(confirmSpy).toHaveBeenCalledWith('Are you sure you want to delete this property list?');
      expect(propertyListStoreMock.delete).toHaveBeenCalledWith('test-uuid');
    });

    it('should not call store delete when cancelled', () => {
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);

      component.onDelete('test-uuid');

      expect(confirmSpy).toHaveBeenCalled();
      expect(propertyListStoreMock.delete).not.toHaveBeenCalled();
    });
  });

  describe('onActivate', () => {
    it('should call store activate with uuid', () => {
      component.onActivate('test-uuid');

      expect(propertyListStoreMock.activate).toHaveBeenCalledWith('test-uuid');
    });
  });

  describe('navigateToCreate', () => {
    it('should navigate to create page', () => {
      component.navigateToCreate();

      expect(routerMock.navigate).toHaveBeenCalledWith(['/lists/new']);
    });
  });
});

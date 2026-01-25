import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ActivatedRoute, Router } from '@angular/router';
import { Directive, HostListener, Input } from '@angular/core';
import { of, throwError } from 'rxjs';
import { PropertyListDetailComponent } from './property-list-detail.component';
import { PropertyListService } from '../../../../core/services/property-list-service/property-list.service';
import { createRouterMock, createActivatedRouteMock } from '../../../../shared/mocks/router.mock';
import { createPropertyListServiceMock } from '../../../../shared/mocks/property-list-service.mock';
import {
  mockPropertyListDetail,
  mockUpdatePropertyListDto,
  mockActivateResponse
} from '../../../../shared/mocks/models/property-list-models.mock';

@Directive({
  selector: '[routerLink]',
  standalone: true
})
class RouterLinkStubDirective {
  @Input() routerLink: any;
  navigatedTo: any = null;

  @HostListener('click')
  onClick() {
    this.navigatedTo = this.routerLink;
  }
}

describe('PropertyListDetailComponent', () => {
  let component: PropertyListDetailComponent;
  let fixture: ComponentFixture<PropertyListDetailComponent>;
  let routerMock: any;
  let activatedRouteMock: any;
  let propertyListServiceMock: ReturnType<typeof createPropertyListServiceMock>;

  beforeEach(async () => {
    routerMock = createRouterMock();
    activatedRouteMock = createActivatedRouteMock();
    activatedRouteMock.snapshot.paramMap = {
      get: vi.fn().mockReturnValue('test-uuid-1')
    };

    propertyListServiceMock = createPropertyListServiceMock();

    await TestBed.configureTestingModule({
      imports: [PropertyListDetailComponent, RouterLinkStubDirective],
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: activatedRouteMock },
        { provide: PropertyListService, useValue: propertyListServiceMock }
      ]
    })
    .overrideComponent(PropertyListDetailComponent, {
      remove: { imports: [] },
      add: { imports: [RouterLinkStubDirective] }
    })
    .compileComponents();

    fixture = TestBed.createComponent(PropertyListDetailComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should load list on init with uuid from route', () => {
      propertyListServiceMock.getByUuid.mockReturnValue(of(mockPropertyListDetail));

      fixture.detectChanges();

      expect(activatedRouteMock.snapshot.paramMap.get).toHaveBeenCalledWith('uuid');
      expect(propertyListServiceMock.getByUuid).toHaveBeenCalledWith('test-uuid-1');
    });
  });

  describe('loadList', () => {
    it('should update list signal on successful load', () => {
      propertyListServiceMock.getByUuid.mockReturnValue(of(mockPropertyListDetail));

      component.loadList('test-uuid-1');

      expect(component.loading()).toBe(false);
      expect(component.list()).toEqual(mockPropertyListDetail);
      expect(component.error()).toBeNull();
    });

    it('should update error signal on load failure', () => {
      const error = new Error('Failed to load');
      propertyListServiceMock.getByUuid.mockReturnValue(throwError(() => error));

      component.loadList('test-uuid-1');

      expect(component.loading()).toBe(false);
      expect(component.error()).toBe('Failed to load');
    });

    it('should set loading to true during load', () => {
      propertyListServiceMock.getByUuid.mockReturnValue(of(mockPropertyListDetail));

      component.loadList('test-uuid-1');

      expect(propertyListServiceMock.getByUuid).toHaveBeenCalledWith('test-uuid-1');
    });
  });

  describe('onDelete', () => {
    beforeEach(() => {
      component.list.set(mockPropertyListDetail);
    });

    it('should delete list and navigate when confirmed', () => {
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
      propertyListServiceMock.delete.mockReturnValue(of(void 0));

      component.onDelete();

      expect(confirmSpy).toHaveBeenCalledWith('Are you sure you want to delete this property list?');
      expect(propertyListServiceMock.delete).toHaveBeenCalledWith(mockPropertyListDetail.uuid);
      expect(routerMock.navigate).toHaveBeenCalledWith(['/lists']);
    });

    it('should not delete when cancelled', () => {
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);

      component.onDelete();

      expect(confirmSpy).toHaveBeenCalled();
      expect(propertyListServiceMock.delete).not.toHaveBeenCalled();
    });

    it('should set error on delete failure', () => {
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
      const error = new Error('Delete failed');
      propertyListServiceMock.delete.mockReturnValue(throwError(() => error));

      component.onDelete();

      expect(component.error()).toBe('Delete failed');
    });

    it('should handle when no list is loaded', () => {
      component.list.set(null);
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

      component.onDelete();

      expect(confirmSpy).not.toHaveBeenCalled();
      expect(propertyListServiceMock.delete).not.toHaveBeenCalled();
    });
  });

  describe('onActivate', () => {
    beforeEach(() => {
      component.list.set(mockPropertyListDetail);
    });

    it('should activate list and update state', () => {
      propertyListServiceMock.activate.mockReturnValue(of(mockActivateResponse));

      component.onActivate();

      expect(propertyListServiceMock.activate).toHaveBeenCalledWith(mockPropertyListDetail.uuid);
      expect(component.list()?.state).toBe('ACTIVE');
    });

    it('should set error on activate failure', () => {
      const error = new Error('Activate failed');
      propertyListServiceMock.activate.mockReturnValue(throwError(() => error));

      component.onActivate();

      expect(component.error()).toBe('Activate failed');
    });

    it('should handle when no list is loaded', () => {
      component.list.set(null);

      component.onActivate();

      expect(propertyListServiceMock.activate).not.toHaveBeenCalled();
    });
  });

  describe('edit mode', () => {
    it('should set editMode to true on onEdit', () => {
      expect(component.editMode()).toBe(false);

      component.onEdit();

      expect(component.editMode()).toBe(true);
    });

    it('should set editMode to false on onCancelEdit', () => {
      component.editMode.set(true);

      component.onCancelEdit();

      expect(component.editMode()).toBe(false);
    });
  });

  describe('onUpdate', () => {
    beforeEach(() => {
      component.list.set(mockPropertyListDetail);
      component.editMode.set(true);
    });

    it('should update list and exit edit mode on success', () => {
      const updatedList = { ...mockPropertyListDetail, title: 'Updated Title' };
      propertyListServiceMock.update.mockReturnValue(of(updatedList));

      component.onUpdate(mockUpdatePropertyListDto);

      expect(propertyListServiceMock.update).toHaveBeenCalledWith(
        mockPropertyListDetail.uuid,
        mockUpdatePropertyListDto
      );
      expect(component.list()?.title).toBe('Updated Title');
      expect(component.editMode()).toBe(false);
    });

    it('should set error on update failure', () => {
      const error = new Error('Update failed');
      propertyListServiceMock.update.mockReturnValue(throwError(() => error));

      component.onUpdate(mockUpdatePropertyListDto);

      expect(component.error()).toBe('Update failed');
      expect(component.editMode()).toBe(true);
    });

    it('should handle when no list is loaded', () => {
      component.list.set(null);

      component.onUpdate(mockUpdatePropertyListDto);

      expect(propertyListServiceMock.update).not.toHaveBeenCalled();
    });
  });
});

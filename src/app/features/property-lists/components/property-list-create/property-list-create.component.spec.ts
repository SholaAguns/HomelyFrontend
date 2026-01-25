import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { Router, ActivatedRoute } from '@angular/router';
import { Directive, HostListener, Input } from '@angular/core';
import { PropertyListCreateComponent } from './property-list-create.component';
import { PropertyListStore } from '../../store/property-list.store';
import { createRouterMock, createActivatedRouteMock } from '../../../../shared/mocks/router.mock';
import { createPropertyListStoreMock } from '../../../../shared/mocks/property-list-store.mock';
import { mockCreatePropertyListDto } from '../../../../shared/mocks/models/property-list-models.mock';

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

describe('PropertyListCreateComponent', () => {
  let component: PropertyListCreateComponent;
  let fixture: ComponentFixture<PropertyListCreateComponent>;
  let routerMock: any;
  let propertyListStoreMock: ReturnType<typeof createPropertyListStoreMock>;

  beforeEach(async () => {
    routerMock = createRouterMock();
    propertyListStoreMock = createPropertyListStoreMock();

    await TestBed.configureTestingModule({
      imports: [PropertyListCreateComponent, RouterLinkStubDirective],
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: createActivatedRouteMock() },
        { provide: PropertyListStore, useValue: propertyListStoreMock }
      ]
    })
    .overrideComponent(PropertyListCreateComponent, {
      remove: { imports: [] },
      add: { imports: [RouterLinkStubDirective] }
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

  describe('onCreate', () => {
    it('should call store create with data', () => {
      component.onCreate(mockCreatePropertyListDto);

      expect(propertyListStoreMock.create).toHaveBeenCalledWith(mockCreatePropertyListDto);
    });

    it('should navigate to lists page after successful creation', () => {
      component.onCreate(mockCreatePropertyListDto);

      vi.advanceTimersByTime(500);

      expect(routerMock.navigate).toHaveBeenCalledWith(['/lists']);
    });

    it('should not navigate when store has error', () => {
      propertyListStoreMock.error.set('Creation failed');

      component.onCreate(mockCreatePropertyListDto);

      vi.advanceTimersByTime(500);

      expect(routerMock.navigate).not.toHaveBeenCalled();
    });
  });

  describe('onCancel', () => {
    it('should navigate to lists page', () => {
      component.onCancel();

      expect(routerMock.navigate).toHaveBeenCalledWith(['/lists']);
    });
  });
});

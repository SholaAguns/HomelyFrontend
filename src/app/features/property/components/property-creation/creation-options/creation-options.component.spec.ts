import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Router, ActivatedRoute } from '@angular/router';
import { CreationOptionsComponent } from './creation-options.component';
import { createActivatedRouteWithParentMock } from '../../../../../shared/mocks/activated-route.mock';

describe('CreationOptionsComponent', () => {
  let component: CreationOptionsComponent;
  let fixture: ComponentFixture<CreationOptionsComponent>;
  let routerMock: { navigate: ReturnType<typeof vi.fn> };
  let activatedRouteMock: ReturnType<typeof createActivatedRouteWithParentMock>;

  beforeEach(async () => {
    routerMock = { navigate: vi.fn() };
    activatedRouteMock = createActivatedRouteWithParentMock();

    await TestBed.configureTestingModule({
      imports: [CreationOptionsComponent],
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: activatedRouteMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CreationOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have three creation options', () => {
    expect(component.options).toHaveLength(3);
  });

  describe('options configuration', () => {
    it('should have Manual Entry option', () => {
      const manualOption = component.options[0];

      expect(manualOption.title).toBe('Manual Entry');
      expect(manualOption.description).toBe('Enter property details manually using a form');
      expect(manualOption.icon).toBe('✏️');
      expect(manualOption.route).toBe('manual');
    });

    it('should have From URL or Text option', () => {
      const urlTextOption = component.options[1];

      expect(urlTextOption.title).toBe('From URL or Text');
      expect(urlTextOption.description).toBe(
        'Extract property details from Rightmove/Zoopla URL or text'
      );
      expect(urlTextOption.icon).toBe('🔗');
      expect(urlTextOption.route).toBe('url-text');
    });

    it('should have Search Rightmove option', () => {
      const searchOption = component.options[2];

      expect(searchOption.title).toBe('Search Rightmove');
      expect(searchOption.description).toBe(
        'Bulk create properties from Rightmove search criteria'
      );
      expect(searchOption.icon).toBe('🔍');
      expect(searchOption.route).toBe('search');
    });
  });

  describe('selectOption', () => {
    it('should navigate to manual route when manual option selected', () => {
      const manualOption = component.options[0];

      component.selectOption(manualOption);

      expect(routerMock.navigate).toHaveBeenCalledWith(['manual'], {
        relativeTo: activatedRouteMock,
      });
    });

    it('should navigate to url-text route when url-text option selected', () => {
      const urlTextOption = component.options[1];

      component.selectOption(urlTextOption);

      expect(routerMock.navigate).toHaveBeenCalledWith(['url-text'], {
        relativeTo: activatedRouteMock,
      });
    });

    it('should navigate to search route when search option selected', () => {
      const searchOption = component.options[2];

      component.selectOption(searchOption);

      expect(routerMock.navigate).toHaveBeenCalledWith(['search'], {
        relativeTo: activatedRouteMock,
      });
    });

    it('should use relativeTo for navigation', () => {
      const option = component.options[0];

      component.selectOption(option);

      const navigationCall = routerMock.navigate.mock.calls[0];
      expect(navigationCall[1]).toEqual({ relativeTo: activatedRouteMock });
    });
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Router } from '@angular/router';
import { PropertyPreviewCard } from './property-preview-card';
import { mockProperty } from '../../../../shared/mocks/models/property-models.mock';

describe('PropertyPreviewCard', () => {
  let component: PropertyPreviewCard;
  let fixture: ComponentFixture<PropertyPreviewCard>;
  let mockRouter: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    mockRouter = {
      navigate: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [PropertyPreviewCard],
      providers: [{ provide: Router, useValue: mockRouter }],
    }).compileComponents();

    fixture = TestBed.createComponent(PropertyPreviewCard);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('property', mockProperty);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display property from input', () => {
    expect(component.property()).toEqual(mockProperty);
  });

  describe('viewDetails', () => {
    it('should navigate to property detail page when not selectable', () => {
      fixture.componentRef.setInput('selectable', false);
      fixture.detectChanges();

      component.viewDetails();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/properties', mockProperty.uuid]);
    });

    it('should not navigate when selectable is true', () => {
      fixture.componentRef.setInput('selectable', true);
      fixture.detectChanges();

      component.viewDetails();

      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });
  });

  describe('onCheckboxChange', () => {
    it('should emit selectionChange event', () => {
      const selectionChangeSpy = vi.fn();
      component.selectionChange.subscribe(selectionChangeSpy);

      const mockEvent = new Event('change');
      component.onCheckboxChange(mockEvent);

      expect(selectionChangeSpy).toHaveBeenCalled();
    });

    it('should stop event propagation', () => {
      const mockEvent = new Event('change');
      const stopPropagationSpy = vi.spyOn(mockEvent, 'stopPropagation');

      component.onCheckboxChange(mockEvent);

      expect(stopPropagationSpy).toHaveBeenCalled();
    });
  });

  describe('onFavoriteClick', () => {
    it('should emit favoriteToggle event with property uuid', () => {
      const favoriteToggleSpy = vi.fn();
      component.favoriteToggle.subscribe(favoriteToggleSpy);

      const mockEvent = new MouseEvent('click');
      component.onFavoriteClick(mockEvent);

      expect(favoriteToggleSpy).toHaveBeenCalledWith(mockProperty.uuid);
    });

    it('should stop event propagation and prevent default', () => {
      const mockEvent = new MouseEvent('click');
      const stopPropagationSpy = vi.spyOn(mockEvent, 'stopPropagation');
      const preventDefaultSpy = vi.spyOn(mockEvent, 'preventDefault');

      component.onFavoriteClick(mockEvent);

      expect(stopPropagationSpy).toHaveBeenCalled();
      expect(preventDefaultSpy).toHaveBeenCalled();
    });
  });

  describe('showFavoriteToggle input', () => {
    it('should default to false', () => {
      expect(component.showFavoriteToggle()).toBe(false);
    });

    it('should accept true value', () => {
      fixture.componentRef.setInput('showFavoriteToggle', true);
      fixture.detectChanges();

      expect(component.showFavoriteToggle()).toBe(true);
    });
  });

  describe('selectable input', () => {
    it('should default to false', () => {
      expect(component.selectable()).toBe(false);
    });

    it('should accept true value', () => {
      fixture.componentRef.setInput('selectable', true);
      fixture.detectChanges();

      expect(component.selectable()).toBe(true);
    });
  });

  describe('selected input', () => {
    it('should default to false', () => {
      expect(component.selected()).toBe(false);
    });

    it('should accept true value', () => {
      fixture.componentRef.setInput('selected', true);
      fixture.detectChanges();

      expect(component.selected()).toBe(true);
    });
  });
});

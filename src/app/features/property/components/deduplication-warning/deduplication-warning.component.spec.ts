import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DeduplicationWarningComponent } from './deduplication-warning.component';
import { mockProperty } from '../../../../shared/mocks/models/property-models.mock';

describe('DeduplicationWarningComponent', () => {
  let component: DeduplicationWarningComponent;
  let fixture: ComponentFixture<DeduplicationWarningComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeduplicationWarningComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DeduplicationWarningComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('existingProperty', mockProperty);
    fixture.componentRef.setInput('isOpen', false);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should accept existingProperty input', () => {
    expect(component.existingProperty()).toEqual(mockProperty);
  });

  it('should accept isOpen input', () => {
    expect(component.isOpen()).toBe(false);
  });

  it('should not render modal when isOpen is false', () => {
    fixture.componentRef.setInput('isOpen', false);
    fixture.detectChanges();

    const modalElement = fixture.nativeElement.querySelector('.fixed.inset-0');
    expect(modalElement).toBeNull();
  });

  it('should render modal when isOpen is true', () => {
    fixture.componentRef.setInput('isOpen', true);
    fixture.detectChanges();

    const modalElement = fixture.nativeElement.querySelector('.fixed.inset-0');
    expect(modalElement).toBeTruthy();
  });

  describe('onViewExisting', () => {
    it('should emit view action', () => {
      const actionSelectedSpy = vi.fn();
      component.actionSelected.subscribe(actionSelectedSpy);

      component.onViewExisting();

      expect(actionSelectedSpy).toHaveBeenCalledWith('view');
    });
  });

  describe('onForceCreate', () => {
    it('should emit force_create action', () => {
      const actionSelectedSpy = vi.fn();
      component.actionSelected.subscribe(actionSelectedSpy);

      component.onForceCreate();

      expect(actionSelectedSpy).toHaveBeenCalledWith('force_create');
    });
  });

  describe('onCancel', () => {
    it('should emit cancel action', () => {
      const actionSelectedSpy = vi.fn();
      component.actionSelected.subscribe(actionSelectedSpy);

      component.onCancel();

      expect(actionSelectedSpy).toHaveBeenCalledWith('cancel');
    });
  });

  describe('modal content', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('isOpen', true);
      fixture.detectChanges();
    });

    it('should display existing property title', () => {
      const compiled = fixture.nativeElement;
      expect(compiled.textContent).toContain('2 Bedroom Flat');
    });

    it('should display existing property price', () => {
      const compiled = fixture.nativeElement;
      expect(compiled.textContent).toContain('450,000');
    });

    it('should display existing property address', () => {
      const compiled = fixture.nativeElement;
      expect(compiled.textContent).toContain('123 Main Street');
      expect(compiled.textContent).toContain('SW1A 1AA');
    });

    it('should display existing property bedrooms', () => {
      const compiled = fixture.nativeElement;
      expect(compiled.textContent).toContain('2');
    });

    it('should display existing property state', () => {
      const compiled = fixture.nativeElement;
      expect(compiled.textContent).toContain('New');
    });

    it('should display external url if present', () => {
      const compiled = fixture.nativeElement;
      const linkElement = compiled.querySelector(
        'a[href="https://www.rightmove.co.uk/properties/123456"]'
      );
      expect(linkElement).toBeTruthy();
    });

    it('should render all three action buttons', () => {
      const compiled = fixture.nativeElement;
      const buttons = compiled.querySelectorAll('button');

      expect(buttons.length).toBe(3);
      expect(buttons[0].textContent.trim()).toBe('Cancel');
      expect(buttons[1].textContent.trim()).toBe('View Existing');
      expect(buttons[2].textContent.trim()).toBe('Force Create Anyway');
    });

    it('should call onCancel when cancel button clicked', () => {
      const onCancelSpy = vi.spyOn(component, 'onCancel');
      const compiled = fixture.nativeElement;
      const cancelButton = compiled.querySelectorAll('button')[0];

      cancelButton.click();

      expect(onCancelSpy).toHaveBeenCalled();
    });

    it('should call onViewExisting when view existing button clicked', () => {
      const onViewExistingSpy = vi.spyOn(component, 'onViewExisting');
      const compiled = fixture.nativeElement;
      const viewButton = compiled.querySelectorAll('button')[1];

      viewButton.click();

      expect(onViewExistingSpy).toHaveBeenCalled();
    });

    it('should call onForceCreate when force create button clicked', () => {
      const onForceCreateSpy = vi.spyOn(component, 'onForceCreate');
      const compiled = fixture.nativeElement;
      const forceButton = compiled.querySelectorAll('button')[2];

      forceButton.click();

      expect(onForceCreateSpy).toHaveBeenCalled();
    });
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ActivatedRoute } from '@angular/router';
import { PropertyListCardComponent } from './property-list-card.component';
import { Directive, HostListener, Input } from '@angular/core';
import { mockPropertyList } from '../../../../shared/mocks/models/property-list-models.mock';
import { createActivatedRouteMock } from '../../../../shared/mocks/router.mock';

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

describe('PropertyListCardComponent', () => {
  let component: PropertyListCardComponent;
  let fixture: ComponentFixture<PropertyListCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PropertyListCardComponent, RouterLinkStubDirective],
      providers: [
        { provide: ActivatedRoute, useValue: createActivatedRouteMock() }
      ]
    })
    .overrideComponent(PropertyListCardComponent, {
      remove: { imports: [] },
      add: { imports: [RouterLinkStubDirective] }
    })
    .compileComponents();

    fixture = TestBed.createComponent(PropertyListCardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('list', mockPropertyList);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display property list from input', () => {
    expect(component.list()).toEqual(mockPropertyList);
  });

  describe('onDelete', () => {
    it('should emit delete event with uuid', () => {
      const deleteSpy = vi.fn();
      component.delete.subscribe(deleteSpy);

      const event = new Event('click');
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
      const stopPropagationSpy = vi.spyOn(event, 'stopPropagation');

      component.onDelete(event);

      expect(preventDefaultSpy).toHaveBeenCalled();
      expect(stopPropagationSpy).toHaveBeenCalled();
      expect(deleteSpy).toHaveBeenCalledWith(mockPropertyList.uuid);
    });
  });

  describe('onActivate', () => {
    it('should emit activate event with uuid', () => {
      const activateSpy = vi.fn();
      component.activate.subscribe(activateSpy);

      const event = new Event('click');
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
      const stopPropagationSpy = vi.spyOn(event, 'stopPropagation');

      component.onActivate(event);

      expect(preventDefaultSpy).toHaveBeenCalled();
      expect(stopPropagationSpy).toHaveBeenCalled();
      expect(activateSpy).toHaveBeenCalledWith(mockPropertyList.uuid);
    });
  });
});

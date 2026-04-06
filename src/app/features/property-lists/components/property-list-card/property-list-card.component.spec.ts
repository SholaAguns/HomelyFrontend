import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Router } from '@angular/router';
import { PropertyListCardComponent } from './property-list-card.component';
import { mockPropertyList } from '../../../../shared/mocks/models/property-list-models.mock';

describe('PropertyListCardComponent', () => {
  let component: PropertyListCardComponent;
  let fixture: ComponentFixture<PropertyListCardComponent>;
  let mockRouter: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    mockRouter = {
      navigate: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [PropertyListCardComponent],
      providers: [{ provide: Router, useValue: mockRouter }],
    }).compileComponents();

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

  describe('onCardClick', () => {
    it('should navigate to list detail page', () => {
      component.onCardClick();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/lists', mockPropertyList.uuid]);
    });
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { PropertyCreationComponent } from './property-creation.component';
import { createActivatedRouteWithParentMock } from '../../../../shared/mocks/activated-route.mock';

describe('PropertyCreationComponent', () => {
  let component: PropertyCreationComponent;
  let fixture: ComponentFixture<PropertyCreationComponent>;
  let activatedRouteMock: ReturnType<typeof createActivatedRouteWithParentMock>;

  beforeEach(async () => {
    activatedRouteMock = createActivatedRouteWithParentMock('list-uuid-1');

    await TestBed.configureTestingModule({
      imports: [PropertyCreationComponent, RouterOutlet],
      providers: [{ provide: ActivatedRoute, useValue: activatedRouteMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(PropertyCreationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with propertyListUuid from route params', () => {
    expect(component.propertyListUuid()).toBe('list-uuid-1');
    expect(activatedRouteMock.parent.snapshot.paramMap.get).toHaveBeenCalledWith('uuid');
  });

  it('should handle missing uuid in route params', () => {
    activatedRouteMock.parent.snapshot.paramMap.get = vi.fn().mockReturnValue(null);

    const newFixture = TestBed.createComponent(PropertyCreationComponent);
    const newComponent = newFixture.componentInstance;
    newFixture.detectChanges();

    expect(newComponent.propertyListUuid()).toBe('');
  });
});

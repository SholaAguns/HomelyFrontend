import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { PropertyDetailComponent } from './property-detail.component';
import { PropertyService } from '../../../../core/services/property-service/property.service';
import { createRouterMock, createActivatedRouteMock } from '../../../../shared/mocks/router.mock';

describe('PropertyDetailComponent', () => {
  let component: PropertyDetailComponent;
  let fixture: ComponentFixture<PropertyDetailComponent>;
  let routerMock: any;
  let activatedRouteMock: any;
  let propertyServiceMock: any;

  const mockPropertyDetail = {
    uuid: 'prop-123',
    property_lists: { 'list-1': 'My List' },
    state: 'NEW',
    state_display: 'New',
    title: 'Test Property',
    address_line_1: '123 Test St',
    address_line_2: '',
    city: 'London',
    postcode: 'SW1A 1AA',
    latitude: 51.5,
    longitude: -0.1,
    price: 500000,
    bedrooms: 3,
    bathrooms: 2,
    square_area: 1200,
    garden: true,
    parking: true,
    furnished_status: 'Unfurnished',
    council_tax_band: 'D',
    epc_rating: 'C',
    lease_length: null,
    floor_level: null,
    child_suitable: true,
    completion_date: null,
    external_id: 'ext-123',
    external_url: 'https://example.com',
    normalized_address: '123 test st london sw1a 1aa',
    uprn: 'uprn-123',
    overall_rating: null,
    rating_breakdown: null,
    disqualified: false,
    disqualification_reason: '',
    images: [],
    primary_image: null,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
    context_data: [],
    available_transitions: [],
  };

  beforeEach(async () => {
    routerMock = createRouterMock();
    activatedRouteMock = createActivatedRouteMock();
    activatedRouteMock.snapshot.paramMap = {
      get: vi.fn((key: string) => (key === 'uuid' ? 'prop-123' : null)),
    };
    propertyServiceMock = {
      getByUuid: vi.fn(),
      runStage2: vi.fn(),
      runStage3: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [PropertyDetailComponent],
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: activatedRouteMock },
        { provide: PropertyService, useValue: propertyServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PropertyDetailComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load property on init', () => {
    propertyServiceMock.getByUuid.mockReturnValue(of(mockPropertyDetail));

    fixture.detectChanges();

    expect(propertyServiceMock.getByUuid).toHaveBeenCalledWith('prop-123');
    expect(component.property).toEqual(mockPropertyDetail);
    expect(component.loading).toBe(false);
  });

  it('should handle load error', () => {
    propertyServiceMock.getByUuid.mockReturnValue(throwError(() => new Error('Load failed')));

    fixture.detectChanges();

    expect(component.error).toBe('Load failed');
    expect(component.loading).toBe(false);
  });

  it('should navigate back to lists', () => {
    component.goBack();

    expect(routerMock.navigate).toHaveBeenCalledWith(['/lists']);
  });

  it('should run stage 2', async () => {
    propertyServiceMock.getByUuid.mockReturnValue(of(mockPropertyDetail));
    propertyServiceMock.runStage2.mockReturnValue(of({ status: 'success' }));

    fixture.detectChanges();
    component.runStage2();

    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(propertyServiceMock.runStage2).toHaveBeenCalledWith('prop-123');
    expect(propertyServiceMock.getByUuid).toHaveBeenCalledTimes(2);
  });

  it('should run stage 3', async () => {
    propertyServiceMock.getByUuid.mockReturnValue(of(mockPropertyDetail));
    propertyServiceMock.runStage3.mockReturnValue(of({ status: 'success' }));

    fixture.detectChanges();
    component.runStage3();

    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(propertyServiceMock.runStage3).toHaveBeenCalledWith('prop-123');
    expect(propertyServiceMock.getByUuid).toHaveBeenCalledTimes(2);
  });

  it('should handle stage 2 error', async () => {
    propertyServiceMock.getByUuid.mockReturnValue(of(mockPropertyDetail));
    propertyServiceMock.runStage2.mockReturnValue(throwError(() => new Error('Stage 2 failed')));

    fixture.detectChanges();
    component.runStage2();

    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(component.error).toBe('Stage 2 failed');
  });

  it('should handle missing uuid', () => {
    activatedRouteMock.snapshot.paramMap.get.mockReturnValue(null);

    fixture.detectChanges();

    expect(component.error).toBe('No property UUID provided');
    expect(component.loading).toBe(false);
  });
});

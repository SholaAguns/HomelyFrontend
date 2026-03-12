/* global jasmine */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ContextReportsComponent } from './context-reports.component';
import { ContextDataStore } from '../../store/context-data.store';
import { signal } from '@angular/core';

describe('ContextReportsComponent', () => {
  let component: ContextReportsComponent;
  let fixture: ComponentFixture<ContextReportsComponent>;
  let mockContextDataStore: Partial<InstanceType<typeof ContextDataStore>>;

  beforeEach(async () => {
    mockContextDataStore = {
      forProperty: jasmine.createSpy('forProperty').and.returnValue(() => []),
      progressFor: jasmine.createSpy('progressFor').and.returnValue(() => ({
        total: 5,
        complete: 2,
        in_progress: 1,
        failed: 1,
        pending: 1,
      })),
      triggerStage2: jasmine.createSpy('triggerStage2'),
      retry: jasmine.createSpy('retry'),
    };

    await TestBed.configureTestingModule({
      imports: [ContextReportsComponent],
      providers: [{ provide: ContextDataStore, useValue: mockContextDataStore }],
    }).compileComponents();

    fixture = TestBed.createComponent(ContextReportsComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('propertyId', 'test-property-id');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display "Retrieve Context Reports" button when not started', () => {
    mockContextDataStore.forProperty.and.returnValue(() => []);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('.btn-primary');
    expect(button).toBeTruthy();
    expect(button.textContent.trim()).toBe('Retrieve Context Reports');
  });

  it('should call triggerStage2 when button clicked', () => {
    mockContextDataStore.forProperty.and.returnValue(() => []);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('.btn-primary');
    button.click();

    expect(mockContextDataStore.triggerStage2).toHaveBeenCalledWith('test-property-id');
  });

  it('should display progress when started', () => {
    mockContextDataStore.forProperty.and.returnValue(() => [
      { id: '1', service_name: 'crime', status: 'COMPLETE' },
    ]);
    fixture.detectChanges();

    const progressText = fixture.nativeElement.querySelector('.progress-text');
    expect(progressText.textContent.trim()).toContain('2 / 5 services complete');
  });

  it('should display service cards when started', () => {
    mockContextDataStore.forProperty.and.returnValue(() => [
      { id: '1', service_name: 'crime', status: 'COMPLETE' },
    ]);
    fixture.detectChanges();

    const serviceCards = fixture.nativeElement.querySelectorAll('.service-card');
    expect(serviceCards.length).toBe(5); // crime, schools, broadband, mobile, poi
  });

  it('should show loading state for pending service', () => {
    mockContextDataStore.forProperty.and.returnValue(() => [
      { id: '1', service_name: 'crime', status: 'PENDING' },
    ]);
    component.propertyId = signal('test-property-id').asReadonly();
    fixture.detectChanges();

    expect(component.getServiceStatus('crime')).toBe('PENDING');
  });

  it('should show error state for failed service', () => {
    mockContextDataStore.forProperty.and.returnValue(() => [
      {
        id: '1',
        service_name: 'crime',
        status: 'FAILED',
        error_message: 'Service failed',
      },
    ]);
    component.propertyId = signal('test-property-id').asReadonly();
    fixture.detectChanges();

    expect(component.getServiceStatus('crime')).toBe('FAILED');
    expect(component.getServiceError('crime')).toBe('Service failed');
  });

  it('should call retry when retry button clicked', () => {
    component.retryService('crime');

    expect(mockContextDataStore.retry).toHaveBeenCalledWith({
      propertyId: 'test-property-id',
      service: 'crime',
    });
  });

  it('should return service data when complete', () => {
    const mockData = { total: 10 };
    mockContextDataStore.forProperty.and.returnValue(() => [
      {
        id: '1',
        service_name: 'crime',
        status: 'COMPLETE',
        data: mockData,
      },
    ]);
    component.propertyId = signal('test-property-id').asReadonly();
    fixture.detectChanges();

    expect(component.getServiceData('crime')).toEqual(mockData);
  });

  it('should not return service data when not complete', () => {
    mockContextDataStore.forProperty.and.returnValue(() => [
      {
        id: '1',
        service_name: 'crime',
        status: 'IN_PROGRESS',
        data: null,
      },
    ]);
    component.propertyId = signal('test-property-id').asReadonly();
    fixture.detectChanges();

    expect(component.getServiceData('crime')).toBeNull();
  });
});

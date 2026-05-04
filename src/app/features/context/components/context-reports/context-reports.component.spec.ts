import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ContextReportsComponent } from './context-reports.component';
import { ContextDataStore } from '../../store/context-data.store';
import { signal, computed } from '@angular/core';
import { PropertyStore } from '../../../property/store/property.store';
import { PropertySseService } from '../../../../core/services/property-sse-service/property-sse.service';
import { EMPTY } from 'rxjs';

describe('ContextReportsComponent', () => {
  let component: ContextReportsComponent;
  let fixture: ComponentFixture<ContextReportsComponent>;
  let mockContextDataStore: Partial<InstanceType<typeof ContextDataStore>>;
  let mockPropertyStore: Partial<InstanceType<typeof PropertyStore>>;
  let mockSseService: Partial<PropertySseService>;
  let contextDataSignal: any;
  let setContextData: (data: any[]) => void;
  let progressSignal: any;
  let setProgress: (progress: any) => void;

  beforeEach(async () => {
    contextDataSignal = signal([]);
    setContextData = (data: any[]) => contextDataSignal.set(data);

    progressSignal = signal({
      total: 6,
      complete: 2,
      in_progress: 1,
      failed: 1,
      pending: 2,
    });
    setProgress = (progress: any) => progressSignal.set(progress);

    mockContextDataStore = {
      load: Object.assign(vi.fn(), { destroy: () => {} }) as any,
      forProperty: computed(() => () => contextDataSignal()),
      progressFor: computed(() => () => progressSignal()),
      triggerStage2: Object.assign(vi.fn(), {
        destroy: () => {},
      }) as any,
      retry: Object.assign(vi.fn(), { destroy: () => {} }) as any,
      updateService: vi.fn(),
    };

    mockPropertyStore = {
      entities: signal({}),
      updatePropertyState: vi.fn(),
    };

    mockSseService = {
      connectToProperty: vi.fn().mockReturnValue(EMPTY),
    };

    await TestBed.configureTestingModule({
      imports: [ContextReportsComponent],
      providers: [
        { provide: ContextDataStore, useValue: mockContextDataStore },
        { provide: PropertyStore, useValue: mockPropertyStore },
        { provide: PropertySseService, useValue: mockSseService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ContextReportsComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('propertyId', 'test-property-id');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display "Get reports" button when not started', () => {
    setContextData([]);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('.btn-primary');
    expect(button).toBeTruthy();
    expect(button.textContent.trim()).toBe('Get reports');
  });

  it('should display progress when started', () => {
    setContextData([{ id: '1', service_name: 'crime', status: 'COMPLETE' } as any]);
    fixture.detectChanges();

    const progressText = fixture.nativeElement.querySelector('.progress-text');
    expect(progressText.textContent.trim()).toContain('2 / 6 services complete');
  });

  it('should display service cards when started', () => {
    setContextData([{ id: '1', service_name: 'crime', status: 'COMPLETE' } as any]);
    fixture.detectChanges();

    const serviceCards = fixture.nativeElement.querySelectorAll('.service-card');
    expect(serviceCards.length).toBeGreaterThan(0);
  });

  it('should show loading state for pending service', () => {
    setContextData([{ id: '1', service_name: 'crime', status: 'PENDING' } as any]);
    fixture.detectChanges();

    expect(component.getServiceStatus('crime')).toBe('PENDING');
  });

  it('should show error state for failed service', () => {
    setContextData([
      {
        id: '1',
        service_name: 'crime',
        status: 'FAILED',
        error_message: 'Service failed',
      } as any,
    ]);
    fixture.detectChanges();

    expect(component.getServiceStatus('crime')).toBe('FAILED');
    expect(component.getServiceError('crime')).toBe('Service failed');
  });

  it('should return service data when complete', () => {
    const mockData = { total: 10 };
    setContextData([
      {
        id: '1',
        service_name: 'crime',
        status: 'COMPLETE',
        data: mockData,
      } as any,
    ]);
    fixture.detectChanges();

    expect(component.getServiceData('crime')).toEqual(mockData);
  });

  it('should not return service data when not complete', () => {
    setContextData([
      {
        id: '1',
        service_name: 'crime',
        status: 'IN_PROGRESS',
        data: null,
      } as any,
    ]);
    fixture.detectChanges();

    expect(component.getServiceData('crime')).toBeNull();
  });

  it('should call triggerStage2 with no services when Get reports clicked', () => {
    setContextData([]);
    fixture.detectChanges();

    component.triggerStage2();

    expect(mockSseService.connectToProperty).toHaveBeenCalledWith('test-property-id');
  });

  it('should call triggerStage2 with specific services list', () => {
    const services = ['crime', 'schools'];
    component.triggerStage2(services);

    expect(mockSseService.connectToProperty).toHaveBeenCalledWith('test-property-id');
  });

  it('should retry all failed services when retryAllFailed called', () => {
    setContextData([
      { id: '1', service_name: 'crime', status: 'FAILED' } as any,
      { id: '2', service_name: 'schools', status: 'FAILED' } as any,
      { id: '3', service_name: 'broadband', status: 'COMPLETE' } as any,
    ]);
    fixture.detectChanges();

    component.retryAllFailed();

    expect(mockSseService.connectToProperty).toHaveBeenCalledWith('test-property-id');
  });

  it('should display retry all failed button when failures exist', () => {
    setProgress({
      total: 6,
      complete: 2,
      in_progress: 0,
      failed: 2,
      pending: 2,
    });
    setContextData([
      { id: '1', service_name: 'crime', status: 'FAILED' } as any,
      { id: '2', service_name: 'schools', status: 'FAILED' } as any,
    ]);
    fixture.detectChanges();

    const retryAllButton = fixture.nativeElement.querySelector('.btn-retry-all');
    expect(retryAllButton).toBeTruthy();
    expect(retryAllButton.textContent.trim()).toContain('Retry All Failed');
  });

  it('should not display retry all button when no failures', () => {
    setProgress({
      total: 6,
      complete: 6,
      in_progress: 0,
      failed: 0,
      pending: 0,
    });
    setContextData([{ id: '1', service_name: 'crime', status: 'COMPLETE' } as any]);
    fixture.detectChanges();

    const retryAllButton = fixture.nativeElement.querySelector('.btn-retry-all');
    expect(retryAllButton).toBeNull();
  });
});

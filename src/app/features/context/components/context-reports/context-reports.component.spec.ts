import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ContextReportsComponent } from './context-reports.component';
import { ContextDataStore } from '../../store/context-data.store';
import { signal, computed } from '@angular/core';
import { PropertyStore } from '../../../property/store/property.store';
import { PropertyWebSocketService } from '../../../../core/services/property-websocket-service/property-websocket.service';

describe('ContextReportsComponent', () => {
  let component: ContextReportsComponent;
  let fixture: ComponentFixture<ContextReportsComponent>;
  let mockContextDataStore: Partial<InstanceType<typeof ContextDataStore>>;
  let mockPropertyStore: Partial<InstanceType<typeof PropertyStore>>;
  let mockWebSocketService: Partial<PropertyWebSocketService>;
  let contextDataSignal: any;
  let setContextData: (data: any[]) => void;

  beforeEach(async () => {
    contextDataSignal = signal([]);
    setContextData = (data: any[]) => contextDataSignal.set(data);

    mockContextDataStore = {
      load: Object.assign(vi.fn(), { destroy: () => {} }) as any,
      forProperty: computed(() => () => contextDataSignal()),
      progressFor: computed(() => () => ({
        total: 6,
        complete: 2,
        in_progress: 1,
        failed: 1,
        pending: 2,
      })),
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

    mockWebSocketService = {
      connectToProperty: vi.fn().mockReturnValue({
        subscribe: vi.fn(),
      }),
      disconnect: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [ContextReportsComponent],
      providers: [
        { provide: ContextDataStore, useValue: mockContextDataStore },
        { provide: PropertyStore, useValue: mockPropertyStore },
        { provide: PropertyWebSocketService, useValue: mockWebSocketService },
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
});

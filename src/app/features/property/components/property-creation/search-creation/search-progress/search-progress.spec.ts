import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SearchProgress } from './search-progress';
import { SearchTaskStore } from '../../../../store/search-task.store';
import { createSearchTaskStoreMock } from '../../../../../../shared/mocks/search-task-store.mock';

describe('SearchProgress', () => {
  let component: SearchProgress;
  let fixture: ComponentFixture<SearchProgress>;
  let searchTaskStoreMock: ReturnType<typeof createSearchTaskStoreMock>;

  beforeEach(async () => {
    searchTaskStoreMock = createSearchTaskStoreMock();

    await TestBed.configureTestingModule({
      imports: [SearchProgress],
      providers: [{ provide: SearchTaskStore, useValue: searchTaskStoreMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(SearchProgress);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with store signals', () => {
    expect(component.status).toBe(searchTaskStoreMock.status);
    expect(component.completedItems).toBe(searchTaskStoreMock.completedItems);
    expect(component.totalItems).toBe(searchTaskStoreMock.totalItems);
    expect(component.failedItems).toBe(searchTaskStoreMock.failedItems);
    expect(component.progressPercentage).toBe(searchTaskStoreMock.progressPercentage);
    expect(component.errors).toBe(searchTaskStoreMock.errors);
    expect(component.websocketConnected).toBe(searchTaskStoreMock.websocketConnected);
    expect(component.usingPollingFallback).toBe(searchTaskStoreMock.usingPollingFallback);
  });

  it('should initialize showErrors to false', () => {
    expect(component.showErrors).toBe(false);
  });

  describe('statusClass computed signal', () => {
    it('should return status-queued for QUEUED status', () => {
      searchTaskStoreMock.status.set('QUEUED');
      expect(component.statusClass()).toBe('status-queued');
    });

    it('should return status-in-progress for IN_PROGRESS status', () => {
      searchTaskStoreMock.status.set('IN_PROGRESS');
      expect(component.statusClass()).toBe('status-in-progress');
    });

    it('should return status-completed for COMPLETED status', () => {
      searchTaskStoreMock.status.set('COMPLETED');
      expect(component.statusClass()).toBe('status-completed');
    });

    it('should return status-failed for FAILED status', () => {
      searchTaskStoreMock.status.set('FAILED');
      expect(component.statusClass()).toBe('status-failed');
    });

    it('should return empty string for null status', () => {
      searchTaskStoreMock.status.set(null);
      expect(component.statusClass()).toBe('');
    });
  });

  describe('statusLabel computed signal', () => {
    it('should return Queued for QUEUED status', () => {
      searchTaskStoreMock.status.set('QUEUED');
      expect(component.statusLabel()).toBe('Queued');
    });

    it('should return In Progress for IN_PROGRESS status', () => {
      searchTaskStoreMock.status.set('IN_PROGRESS');
      expect(component.statusLabel()).toBe('In Progress');
    });

    it('should return Completed for COMPLETED status', () => {
      searchTaskStoreMock.status.set('COMPLETED');
      expect(component.statusLabel()).toBe('Completed');
    });

    it('should return Failed for FAILED status', () => {
      searchTaskStoreMock.status.set('FAILED');
      expect(component.statusLabel()).toBe('Failed');
    });

    it('should return Unknown for null status', () => {
      searchTaskStoreMock.status.set(null);
      expect(component.statusLabel()).toBe('Unknown');
    });
  });

  describe('toggleErrors', () => {
    it('should toggle showErrors from false to true', () => {
      component.showErrors = false;
      component.toggleErrors();
      expect(component.showErrors).toBe(true);
    });

    it('should toggle showErrors from true to false', () => {
      component.showErrors = true;
      component.toggleErrors();
      expect(component.showErrors).toBe(false);
    });

    it('should toggle showErrors multiple times', () => {
      expect(component.showErrors).toBe(false);
      component.toggleErrors();
      expect(component.showErrors).toBe(true);
      component.toggleErrors();
      expect(component.showErrors).toBe(false);
      component.toggleErrors();
      expect(component.showErrors).toBe(true);
    });
  });

  describe('onCancel', () => {
    it('should log message when cancel requested', () => {
      const consoleSpy = vi.spyOn(console, 'log');
      component.onCancel();
      expect(consoleSpy).toHaveBeenCalledWith('Cancel requested - not yet implemented');
    });
  });
});

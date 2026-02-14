import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ActivatedRoute } from '@angular/router';
import { SearchCreationComponent } from './search-creation.component';
import { SearchTaskStore } from '../../../store/search-task.store';
import { SearchCriteriaForm } from './search-criteria-form/search-criteria-form';
import { createSearchTaskStoreMock } from '../../../../../shared/mocks/search-task-store.mock';
import { mockSearchCriteria } from '../../../../../shared/mocks/models/property-models.mock';

describe('SearchCreationComponent', () => {
  let component: SearchCreationComponent;
  let fixture: ComponentFixture<SearchCreationComponent>;
  let searchTaskStoreMock: ReturnType<typeof createSearchTaskStoreMock>;
  let activatedRouteMock: {
    parent: { snapshot: { paramMap: { get: ReturnType<typeof vi.fn> } } };
  };

  beforeEach(async () => {
    searchTaskStoreMock = createSearchTaskStoreMock();
    activatedRouteMock = {
      parent: {
        snapshot: {
          paramMap: {
            get: vi.fn().mockReturnValue('list-uuid-1'),
          },
        },
      },
    };

    await TestBed.configureTestingModule({
      imports: [SearchCreationComponent, SearchCriteriaForm],
      providers: [
        { provide: SearchTaskStore, useValue: searchTaskStoreMock },
        { provide: ActivatedRoute, useValue: activatedRouteMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SearchCreationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with propertyListUuid from route params', () => {
    expect(component.propertyListUuid).toBe('list-uuid-1');
    expect(activatedRouteMock.parent.snapshot.paramMap.get).toHaveBeenCalledWith('uuid');
  });

  it('should initialize lastSearchCriteria to null', () => {
    expect(component.lastSearchCriteria).toBeNull();
  });

  it('should initialize with store signals', () => {
    expect(component.status).toBe(searchTaskStoreMock.status);
    expect(component.loading).toBe(searchTaskStoreMock.loading);
  });

  describe('currentView computed signal', () => {
    it('should return criteria when status is null', () => {
      searchTaskStoreMock.status.set(null);
      expect(component.currentView()).toBe('criteria');
    });

    it('should return progress when status is QUEUED', () => {
      searchTaskStoreMock.status.set('QUEUED');
      expect(component.currentView()).toBe('progress');
    });

    it('should return progress when status is IN_PROGRESS', () => {
      searchTaskStoreMock.status.set('IN_PROGRESS');
      expect(component.currentView()).toBe('progress');
    });

    it('should return results when status is COMPLETED', () => {
      searchTaskStoreMock.status.set('COMPLETED');
      expect(component.currentView()).toBe('results');
    });

    it('should return results when status is FAILED', () => {
      searchTaskStoreMock.status.set('FAILED');
      expect(component.currentView()).toBe('results');
    });
  });

  describe('onSearchSubmit', () => {
    it('should save search criteria', () => {
      component.onSearchSubmit(mockSearchCriteria);

      expect(component.lastSearchCriteria).toEqual(mockSearchCriteria);
    });

    it('should call searchTaskStore startSearch with correct parameters', () => {
      component.onSearchSubmit(mockSearchCriteria);

      expect(searchTaskStoreMock.startSearch).toHaveBeenCalledWith({
        listUuid: 'list-uuid-1',
        request: {
          search_criteria: mockSearchCriteria,
        },
      });
    });

    it('should save criteria before calling startSearch', () => {
      component.onSearchSubmit(mockSearchCriteria);

      expect(component.lastSearchCriteria).toEqual(mockSearchCriteria);
      expect(searchTaskStoreMock.startSearch).toHaveBeenCalled();
    });
  });

  describe('onNewSearchRequested', () => {
    it('should not throw error when called', () => {
      expect(() => component.onNewSearchRequested()).not.toThrow();
    });
  });

  describe('onRetry', () => {
    it('should call reset on searchTaskStore when lastSearchCriteria exists', () => {
      component.lastSearchCriteria = mockSearchCriteria;

      component.onRetry();

      expect(searchTaskStoreMock.reset).toHaveBeenCalled();
    });

    it('should resubmit search after delay when lastSearchCriteria exists', async () => {
      component.lastSearchCriteria = mockSearchCriteria;
      vi.useFakeTimers();

      component.onRetry();

      expect(searchTaskStoreMock.reset).toHaveBeenCalled();
      expect(searchTaskStoreMock.startSearch).not.toHaveBeenCalled();

      vi.advanceTimersByTime(100);

      expect(searchTaskStoreMock.startSearch).toHaveBeenCalledWith({
        listUuid: 'list-uuid-1',
        request: {
          search_criteria: mockSearchCriteria,
        },
      });

      vi.useRealTimers();
    });

    it('should not resubmit search when lastSearchCriteria is null', async () => {
      component.lastSearchCriteria = null;
      vi.useFakeTimers();

      component.onRetry();

      vi.advanceTimersByTime(200);

      expect(searchTaskStoreMock.reset).not.toHaveBeenCalled();
      expect(searchTaskStoreMock.startSearch).not.toHaveBeenCalled();

      vi.useRealTimers();
    });
  });

  describe('propertyListUuid initialization', () => {
    it('should handle missing uuid in route params', () => {
      activatedRouteMock.parent.snapshot.paramMap.get = vi.fn().mockReturnValue(null);

      const newFixture = TestBed.createComponent(SearchCreationComponent);
      const newComponent = newFixture.componentInstance;
      newFixture.detectChanges();

      expect(newComponent.propertyListUuid).toBe('');
    });
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Router } from '@angular/router';
import { SearchResultsList } from './search-results-list';
import { SearchTaskStore } from '../../../../store/search-task.store';
import { createSearchTaskStoreMock } from '../../../../../../shared/mocks/search-task-store.mock';

describe('SearchResultsList', () => {
  let component: SearchResultsList;
  let fixture: ComponentFixture<SearchResultsList>;
  let searchTaskStoreMock: ReturnType<typeof createSearchTaskStoreMock>;
  let routerMock: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    searchTaskStoreMock = createSearchTaskStoreMock();
    routerMock = { navigate: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [SearchResultsList],
      providers: [
        { provide: SearchTaskStore, useValue: searchTaskStoreMock },
        { provide: Router, useValue: routerMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SearchResultsList);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('propertyListUuid', 'list-uuid-1');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with store signals', () => {
    expect(component.completedItems).toBe(searchTaskStoreMock.completedItems);
    expect(component.failedItems).toBe(searchTaskStoreMock.failedItems);
    expect(component.totalItems).toBe(searchTaskStoreMock.totalItems);
    expect(component.status).toBe(searchTaskStoreMock.status);
  });

  it('should receive propertyListUuid input', () => {
    expect(component.propertyListUuid()).toBe('list-uuid-1');
  });

  describe('duplicatesSkipped getter', () => {
    it('should calculate duplicates as total minus completed and failed', () => {
      searchTaskStoreMock.totalItems.set(100);
      searchTaskStoreMock.completedItems.set(85);
      searchTaskStoreMock.failedItems.set(5);

      expect(component.duplicatesSkipped).toBe(10);
    });

    it('should return 0 when no duplicates', () => {
      searchTaskStoreMock.totalItems.set(50);
      searchTaskStoreMock.completedItems.set(45);
      searchTaskStoreMock.failedItems.set(5);

      expect(component.duplicatesSkipped).toBe(0);
    });

    it('should return 0 when completed plus failed exceeds total', () => {
      searchTaskStoreMock.totalItems.set(50);
      searchTaskStoreMock.completedItems.set(45);
      searchTaskStoreMock.failedItems.set(10);

      expect(component.duplicatesSkipped).toBe(0);
    });

    it('should return total when no items completed or failed', () => {
      searchTaskStoreMock.totalItems.set(50);
      searchTaskStoreMock.completedItems.set(0);
      searchTaskStoreMock.failedItems.set(0);

      expect(component.duplicatesSkipped).toBe(50);
    });

    it('should handle zero total items', () => {
      searchTaskStoreMock.totalItems.set(0);
      searchTaskStoreMock.completedItems.set(0);
      searchTaskStoreMock.failedItems.set(0);

      expect(component.duplicatesSkipped).toBe(0);
    });
  });

  describe('navigateToPropertyList', () => {
    it('should navigate to property list with correct uuid', () => {
      component.navigateToPropertyList();

      expect(routerMock.navigate).toHaveBeenCalledWith(['/lists', 'list-uuid-1']);
    });
  });

  describe('startNewSearch', () => {
    it('should call searchTaskStore reset', () => {
      component.startNewSearch();

      expect(searchTaskStoreMock.reset).toHaveBeenCalled();
    });

    it('should emit newSearchRequested event', () => {
      const emitSpy = vi.fn();
      component.newSearchRequested.subscribe(emitSpy);

      component.startNewSearch();

      expect(emitSpy).toHaveBeenCalled();
    });

    it('should reset store before emitting event', () => {
      const emitSpy = vi.fn();
      component.newSearchRequested.subscribe(emitSpy);

      component.startNewSearch();

      expect(searchTaskStoreMock.reset).toHaveBeenCalled();
      expect(emitSpy).toHaveBeenCalled();
    });
  });

  describe('different propertyListUuid values', () => {
    it('should handle different uuid input', () => {
      fixture.componentRef.setInput('propertyListUuid', 'different-uuid');
      fixture.detectChanges();

      expect(component.propertyListUuid()).toBe('different-uuid');

      component.navigateToPropertyList();
      expect(routerMock.navigate).toHaveBeenCalledWith(['/lists', 'different-uuid']);
    });
  });
});

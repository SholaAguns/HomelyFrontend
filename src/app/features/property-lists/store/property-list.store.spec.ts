import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { PropertyListStore } from './property-list.store';
import { PropertyListService } from '../../../core/services/property-list-service/property-list.service';
import { of, throwError } from 'rxjs';
import {
  mockPropertyList,
  mockCreatePropertyListDto,
  mockUpdatePropertyListDto,
} from '../../../shared/mocks/models/property-list-models.mock';
import { createPropertyListServiceMock } from '../../../shared/mocks/property-list-service.mock';

describe('PropertyListStore', () => {
  let store: InstanceType<typeof PropertyListStore>;
  let propertyListServiceMock: ReturnType<typeof createPropertyListServiceMock>;

  beforeEach(async () => {
    propertyListServiceMock = createPropertyListServiceMock();

    await TestBed.configureTestingModule({
      providers: [
        PropertyListStore,
        { provide: PropertyListService, useValue: propertyListServiceMock },
      ],
    }).compileComponents();

    store = TestBed.inject(PropertyListStore);
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should be created with initial state', () => {
    expect(store).toBeTruthy();
    expect(store.entities()).toEqual({});
    expect(store.ids()).toEqual([]);
    expect(store.selectedId()).toBeNull();
    expect(store.loading()).toBe(false);
    expect(store.error()).toBeNull();
  });

  describe('computed values', () => {
    beforeEach(() => {
      propertyListServiceMock.getAll.mockReturnValue(of([mockPropertyList]));
      store.load('test-project-uuid');
    });

    it('should compute all property lists from entities', async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));

      const all = store.all();
      expect(all.length).toBe(1);
      expect(all).toContain(mockPropertyList);
    });

    it('should compute count from ids', async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(store.count()).toBe(1);
    });

    it('should compute selected from selectedId', async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));

      store.select(mockPropertyList.uuid);
      expect(store.selected()).toEqual(mockPropertyList);
    });

    it('should return null when selectedId is null', () => {
      expect(store.selected()).toBeNull();
    });
  });

  describe('load', () => {
    it('should update state on successful load', async () => {
      const mockLists = [mockPropertyList];
      propertyListServiceMock.getAll.mockReturnValue(of(mockLists));

      store.load('test-project-uuid');

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(store.loading()).toBe(false);
      expect(store.error()).toBeNull();
      expect(store.ids()).toEqual([mockPropertyList.uuid]);
      expect(store.entities()[mockPropertyList.uuid]).toEqual(mockPropertyList);
    });

    it('should handle load error', async () => {
      const error = new Error('Failed to load');
      propertyListServiceMock.getAll.mockReturnValue(throwError(() => error));

      store.load('test-project-uuid');

      await new Promise((resolve) => setTimeout(resolve, 200));

      expect(store.loading()).toBe(false);
      expect(store.error()).toBe('Failed to load');
    });
  });

  describe('create', () => {
    it('should add new property list to state', async () => {
      propertyListServiceMock.create.mockReturnValue(of(mockPropertyList));

      store.create(mockCreatePropertyListDto);

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(store.loading()).toBe(false);
      expect(store.error()).toBeNull();
      expect(store.ids()).toContain(mockPropertyList.uuid);
      expect(store.entities()[mockPropertyList.uuid]).toEqual(mockPropertyList);
      expect(propertyListServiceMock.create).toHaveBeenCalledWith(mockCreatePropertyListDto);
    });

    it('should handle create error', async () => {
      const error = new Error('Failed to create');
      propertyListServiceMock.create.mockReturnValue(throwError(() => error));

      store.create(mockCreatePropertyListDto);

      await new Promise((resolve) => setTimeout(resolve, 200));

      expect(store.loading()).toBe(false);
      expect(store.error()).toBe('Failed to create');
    });
  });

  describe('update', () => {
    beforeEach(async () => {
      propertyListServiceMock.getAll.mockReturnValue(of([mockPropertyList]));
      store.load('test-project-uuid');
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    it('should update existing property list in state', async () => {
      const updatedList = { ...mockPropertyList, title: 'Updated Title' };
      propertyListServiceMock.update.mockReturnValue(of(updatedList));

      store.update({ uuid: mockPropertyList.uuid, data: mockUpdatePropertyListDto });

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(store.loading()).toBe(false);
      expect(store.error()).toBeNull();
      expect(store.entities()[mockPropertyList.uuid].title).toBe('Updated Title');
      expect(propertyListServiceMock.update).toHaveBeenCalledWith(
        mockPropertyList.uuid,
        mockUpdatePropertyListDto
      );
    });

    it('should handle update error', async () => {
      const error = new Error('Failed to update');
      propertyListServiceMock.update.mockReturnValue(throwError(() => error));

      store.update({ uuid: mockPropertyList.uuid, data: mockUpdatePropertyListDto });

      await new Promise((resolve) => setTimeout(resolve, 200));

      expect(store.loading()).toBe(false);
      expect(store.error()).toBe('Failed to update');
    });
  });

  describe('delete', () => {
    beforeEach(async () => {
      propertyListServiceMock.getAll.mockReturnValue(of([mockPropertyList]));
      store.load('test-project-uuid');
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    it('should remove property list from state', async () => {
      propertyListServiceMock.delete.mockReturnValue(of(void 0));

      expect(store.ids()).toContain(mockPropertyList.uuid);

      store.delete(mockPropertyList.uuid);

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(store.loading()).toBe(false);
      expect(store.error()).toBeNull();
      expect(store.ids()).not.toContain(mockPropertyList.uuid);
      expect(store.entities()[mockPropertyList.uuid]).toBeUndefined();
      expect(propertyListServiceMock.delete).toHaveBeenCalledWith(mockPropertyList.uuid);
    });

    it('should handle delete error', async () => {
      const error = new Error('Failed to delete');
      propertyListServiceMock.delete.mockReturnValue(throwError(() => error));

      store.delete(mockPropertyList.uuid);

      await new Promise((resolve) => setTimeout(resolve, 200));

      expect(store.loading()).toBe(false);
      expect(store.error()).toBe('Failed to delete');
      expect(store.ids()).toContain(mockPropertyList.uuid);
    });
  });

  describe('select', () => {
    it('should update selectedId', () => {
      store.select('test-uuid');
      expect(store.selectedId()).toBe('test-uuid');
    });

    it('should allow setting selectedId to null', () => {
      store.select('test-uuid');
      store.select(null);
      expect(store.selectedId()).toBeNull();
    });
  });
});

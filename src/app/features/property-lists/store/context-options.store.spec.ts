import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { of, throwError } from 'rxjs';
import { ContextOptionsStore } from './context-options.store';
import { ContextOptionsService } from '../../../core/services/context-options-service/context-options.service';
import { NotificationService } from '../../../core/services/notification-service/notification.service';
import { createContextOptionsServiceMock } from '../../../shared/mocks/context-options-service.mock';
import { createNotificationServiceMock } from '../../../shared/mocks/notification-service.mock';
import {
  mockContextOptions,
  mockContextOptionsAllDisabled,
  mockUpdateContextOptionsDto,
} from '../../../shared/mocks/models/property-list-models.mock';

describe('ContextOptionsStore', () => {
  let store: InstanceType<typeof ContextOptionsStore>;
  let contextOptionsServiceMock: ReturnType<typeof createContextOptionsServiceMock>;
  let notificationServiceMock: ReturnType<typeof createNotificationServiceMock>;

  const propertyListUuid = 'test-uuid-1';

  beforeEach(() => {
    contextOptionsServiceMock = createContextOptionsServiceMock();
    notificationServiceMock = createNotificationServiceMock();

    TestBed.configureTestingModule({
      providers: [
        ContextOptionsStore,
        { provide: ContextOptionsService, useValue: contextOptionsServiceMock },
        { provide: NotificationService, useValue: notificationServiceMock },
      ],
    });

    store = TestBed.inject(ContextOptionsStore);
  });

  it('should be created with initial state', () => {
    expect(store).toBeTruthy();
    expect(store.entities()).toEqual({});
    expect(store.loading()).toBe(false);
    expect(store.saving()).toBe(false);
    expect(store.error()).toBeNull();
  });

  describe('getByPropertyList', () => {
    it('should return null when no context options loaded for property list', () => {
      const result = store.getByPropertyList()(propertyListUuid);
      expect(result).toBeNull();
    });

    it('should return context options after successful load', async () => {
      contextOptionsServiceMock.getByPropertyList.mockReturnValue(of(mockContextOptions));

      store.load(propertyListUuid);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const result = store.getByPropertyList()(propertyListUuid);
      expect(result).toEqual(mockContextOptions);
    });
  });

  describe('load', () => {
    it('should store context options keyed by property list uuid on successful load', async () => {
      contextOptionsServiceMock.getByPropertyList.mockReturnValue(of(mockContextOptions));

      store.load(propertyListUuid);
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(store.loading()).toBe(false);
      expect(store.error()).toBeNull();
      expect(store.entities()[propertyListUuid]).toEqual(mockContextOptions);
    });

    it('should call getByPropertyList with correct property list uuid', async () => {
      contextOptionsServiceMock.getByPropertyList.mockReturnValue(of(mockContextOptions));

      store.load(propertyListUuid);
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(contextOptionsServiceMock.getByPropertyList).toHaveBeenCalledWith(propertyListUuid);
    });

    it('should handle load error and set error state', async () => {
      const error = new Error('Failed to load context options');
      contextOptionsServiceMock.getByPropertyList.mockReturnValue(throwError(() => error));

      store.load(propertyListUuid);
      await new Promise((resolve) => setTimeout(resolve, 200));

      expect(store.loading()).toBe(false);
      expect(store.error()).toBe('Failed to load context options');
      expect(notificationServiceMock.error).toHaveBeenCalledWith('Could not load context options.');
    });

    it('should load context options for multiple property lists independently', async () => {
      const secondPropertyListUuid = 'test-uuid-2';
      contextOptionsServiceMock.getByPropertyList
        .mockReturnValueOnce(of(mockContextOptions))
        .mockReturnValueOnce(of(mockContextOptionsAllDisabled));

      store.load(propertyListUuid);
      store.load(secondPropertyListUuid);
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(store.entities()[propertyListUuid]).toEqual(mockContextOptions);
      expect(store.entities()[secondPropertyListUuid]).toEqual(mockContextOptionsAllDisabled);
    });
  });

  describe('save', () => {
    it('should update stored context options on successful save', async () => {
      contextOptionsServiceMock.getByPropertyList.mockReturnValue(of(mockContextOptions));
      store.load(propertyListUuid);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const updatedOptions = { ...mockContextOptions, ...mockUpdateContextOptionsDto };
      contextOptionsServiceMock.update.mockReturnValue(of(updatedOptions));

      store.save({ propertyListUuid, data: mockUpdateContextOptionsDto });
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(store.saving()).toBe(false);
      expect(store.error()).toBeNull();
      expect(store.entities()[propertyListUuid]).toEqual(updatedOptions);
    });

    it('should call update with correct property list uuid and data', async () => {
      const updatedOptions = { ...mockContextOptions, ...mockUpdateContextOptionsDto };
      contextOptionsServiceMock.update.mockReturnValue(of(updatedOptions));

      store.save({ propertyListUuid, data: mockUpdateContextOptionsDto });
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(contextOptionsServiceMock.update).toHaveBeenCalledWith(
        propertyListUuid,
        mockUpdateContextOptionsDto
      );
    });

    it('should handle save error and set error state', async () => {
      const error = new Error('Failed to save context options');
      contextOptionsServiceMock.update.mockReturnValue(throwError(() => error));

      store.save({ propertyListUuid, data: mockUpdateContextOptionsDto });
      await new Promise((resolve) => setTimeout(resolve, 200));

      expect(store.saving()).toBe(false);
      expect(store.error()).toBe('Failed to save context options');
      expect(notificationServiceMock.error).toHaveBeenCalledWith(
        'Could not save context options. Please try again.'
      );
    });
  });
});

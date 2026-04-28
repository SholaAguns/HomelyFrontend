import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { PropertyStore } from './property.store';
import { PropertyService } from '../../../core/services/property-service/property.service';
import { NotificationService } from '../../../core/services/notification-service/notification.service';
import { of, throwError } from 'rxjs';
import {
  mockProperty,
  mockPropertyStage2Complete,
  mockPropertyStage3Complete,
  mockCreatePropertyDto,
  mockUpdatePropertyDto,
  mockPropertyStateTransition,
  mockCreateFromInputRequest,
  mockCreateFromInputResponseWithProperty,
} from '../../../shared/mocks/models/property-models.mock';
import { createPropertyServiceMock } from '../../../shared/mocks/property-service.mock';
import { createNotificationServiceMock } from '../../../shared/mocks/notification-service.mock';

describe('PropertyStore', () => {
  let propertyStore: InstanceType<typeof PropertyStore>;
  let propertyServiceMock: ReturnType<typeof createPropertyServiceMock>;
  let notificationServiceMock: ReturnType<typeof createNotificationServiceMock>;

  beforeEach(() => {
    propertyServiceMock = createPropertyServiceMock();
    notificationServiceMock = createNotificationServiceMock();

    TestBed.configureTestingModule({
      providers: [
        PropertyStore,
        { provide: PropertyService, useValue: propertyServiceMock },
        { provide: NotificationService, useValue: notificationServiceMock },
      ],
    });

    propertyStore = TestBed.inject(PropertyStore);
  });

  it('should create with initial state', () => {
    expect(propertyStore).toBeTruthy();
    expect(propertyStore.entities()).toEqual({});
    expect(propertyStore.ids()).toEqual([]);
    expect(propertyStore.selectedId()).toBeNull();
    expect(propertyStore.loading()).toBe(false);
    expect(propertyStore.error()).toBeNull();
  });

  describe('computed signals', () => {
    it('should compute allEntities from entities and ids', async () => {
      const mockProperties = [mockProperty, mockPropertyStage2Complete];
      propertyServiceMock.getAll.mockReturnValue(of(mockProperties));

      propertyStore.load(undefined);
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(propertyStore.allEntities()).toEqual(mockProperties);
    });

    it('should compute selectedEntity from selectedId', async () => {
      const mockProperties = [mockProperty];
      propertyServiceMock.getAll.mockReturnValue(of(mockProperties));

      propertyStore.load(undefined);
      await new Promise((resolve) => setTimeout(resolve, 100));

      propertyStore.select(mockProperty.uuid);

      expect(propertyStore.selectedEntity()).toEqual(mockProperty);
    });

    it('should return null for selectedEntity when no selection', () => {
      expect(propertyStore.selectedEntity()).toBeNull();
    });

    it('should compute count from ids length', async () => {
      const mockProperties = [mockProperty, mockPropertyStage2Complete];
      propertyServiceMock.getAll.mockReturnValue(of(mockProperties));

      propertyStore.load(undefined);
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(propertyStore.count()).toBe(2);
    });

    it('should filter propertiesByList', async () => {
      const mockProperties = [
        mockProperty,
        { ...mockPropertyStage2Complete, property_lists: { 'list-uuid-2': 'List 2' } },
      ];
      propertyServiceMock.getAll.mockReturnValue(of(mockProperties));

      propertyStore.load(undefined);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const listProperties = propertyStore.propertiesByList()('list-uuid-1');
      expect(listProperties).toHaveLength(1);
      expect(listProperties[0].uuid).toBe(mockProperty.uuid);
    });

    it('should filter propertiesByState', async () => {
      const mockProperties = [mockProperty, mockPropertyStage2Complete, mockPropertyStage3Complete];
      propertyServiceMock.getAll.mockReturnValue(of(mockProperties));

      propertyStore.load(undefined);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const newProperties = propertyStore.propertiesByState()('NEW');
      expect(newProperties).toHaveLength(1);
      expect(newProperties[0].state).toBe('NEW');
    });
  });

  describe('load', () => {
    it('should load all properties when no uuid provided', async () => {
      const mockProperties = [mockProperty, mockPropertyStage2Complete];
      propertyServiceMock.getAll.mockReturnValue(of(mockProperties));

      propertyStore.load(undefined);
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(propertyServiceMock.getAll).toHaveBeenCalledWith(undefined);
      expect(propertyStore.entities()).toEqual({
        'property-uuid-1': mockProperty,
        'property-uuid-2': mockPropertyStage2Complete,
      });
      expect(propertyStore.ids()).toEqual(['property-uuid-1', 'property-uuid-2']);
      expect(propertyStore.loading()).toBe(false);
    });

    it('should load properties for specific list', async () => {
      const mockProperties = [mockProperty];
      propertyServiceMock.getAll.mockReturnValue(of(mockProperties));

      propertyStore.load('list-uuid-1');
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(propertyServiceMock.getAll).toHaveBeenCalledWith('list-uuid-1');
      expect(propertyStore.ids()).toHaveLength(1);
    });

    it('should set loading to true during load', async () => {
      propertyServiceMock.getAll.mockReturnValue(of([]));

      propertyStore.load(undefined);
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(propertyStore.loading()).toBe(false);
    });

    it('should handle load error', async () => {
      const errorMessage = 'Failed to load properties';
      propertyServiceMock.getAll.mockReturnValue(throwError(() => new Error(errorMessage)));

      propertyStore.load(undefined);
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(propertyStore.error()).toBe(errorMessage);
      expect(propertyStore.loading()).toBe(false);
      expect(notificationServiceMock.error).toHaveBeenCalledWith('Could not load properties.');
    });
  });

  describe('create', () => {
    it('should add created property to store', async () => {
      propertyServiceMock.create.mockReturnValue(of(mockProperty));

      propertyStore.create(mockCreatePropertyDto);
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(propertyServiceMock.create).toHaveBeenCalledWith(mockCreatePropertyDto);
      expect(propertyStore.entities()[mockProperty.uuid]).toEqual(mockProperty);
      expect(propertyStore.ids()).toContain(mockProperty.uuid);
      expect(propertyStore.loading()).toBe(false);
    });

    it('should handle create error', async () => {
      const errorMessage = 'Failed to create property';
      propertyServiceMock.create.mockReturnValue(throwError(() => new Error(errorMessage)));

      propertyStore.create(mockCreatePropertyDto);
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(propertyStore.error()).toBe(errorMessage);
      expect(propertyStore.loading()).toBe(false);
      expect(notificationServiceMock.error).toHaveBeenCalledWith(
        'Could not add property. Please try again.'
      );
    });
  });

  describe('update', () => {
    it('should update existing property in store', async () => {
      propertyServiceMock.getAll.mockReturnValue(of([mockProperty]));
      propertyStore.load(undefined);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const updatedProperty = { ...mockProperty, ...mockUpdatePropertyDto };
      propertyServiceMock.update.mockReturnValue(of(updatedProperty));

      propertyStore.update({ uuid: mockProperty.uuid, data: mockUpdatePropertyDto });
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(propertyServiceMock.update).toHaveBeenCalledWith(
        mockProperty.uuid,
        mockUpdatePropertyDto
      );
      expect(propertyStore.entities()[mockProperty.uuid].title).toBe('Updated 2 Bedroom Flat');
      expect(propertyStore.loading()).toBe(false);
    });

    it('should handle update error', async () => {
      const errorMessage = 'Failed to update property';
      propertyServiceMock.update.mockReturnValue(throwError(() => new Error(errorMessage)));

      propertyStore.update({ uuid: 'property-uuid-1', data: mockUpdatePropertyDto });
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(propertyStore.error()).toBe(errorMessage);
      expect(propertyStore.loading()).toBe(false);
      expect(notificationServiceMock.error).toHaveBeenCalledWith(
        'Could not update property. Please try again.'
      );
    });
  });

  describe('delete', () => {
    it('should remove property from store', async () => {
      propertyServiceMock.getAll.mockReturnValue(of([mockProperty]));
      propertyStore.load(undefined);
      await new Promise((resolve) => setTimeout(resolve, 100));

      propertyServiceMock.delete.mockReturnValue(of(void 0));

      propertyStore.delete(mockProperty.uuid);
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(propertyServiceMock.delete).toHaveBeenCalledWith(mockProperty.uuid);
      expect(propertyStore.entities()[mockProperty.uuid]).toBeUndefined();
      expect(propertyStore.ids()).not.toContain(mockProperty.uuid);
      expect(propertyStore.loading()).toBe(false);
    });

    it('should handle delete error', async () => {
      const errorMessage = 'Failed to delete property';
      propertyServiceMock.delete.mockReturnValue(throwError(() => new Error(errorMessage)));

      propertyStore.delete('property-uuid-1');
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(propertyStore.error()).toBe(errorMessage);
      expect(propertyStore.loading()).toBe(false);
      expect(notificationServiceMock.error).toHaveBeenCalledWith(
        'Could not delete property. Please try again.'
      );
    });
  });

  describe('createFromInput', () => {
    it('should add property to store when created', async () => {
      propertyServiceMock.createFromInput.mockReturnValue(
        of(mockCreateFromInputResponseWithProperty)
      );

      propertyStore.createFromInput(mockCreateFromInputRequest);
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(propertyServiceMock.createFromInput).toHaveBeenCalledWith(mockCreateFromInputRequest);
      expect(propertyStore.entities()[mockProperty.uuid]).toEqual(mockProperty);
      expect(propertyStore.loading()).toBe(false);
    });

    it('should handle response without property', async () => {
      const responseWithoutProperty = {
        success: true,
        property_data: mockCreatePropertyDto,
        message: 'Data extracted but not created yet',
      };
      propertyServiceMock.createFromInput.mockReturnValue(of(responseWithoutProperty));

      propertyStore.createFromInput(mockCreateFromInputRequest);
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(propertyStore.loading()).toBe(false);
    });

    it('should handle createFromInput error', async () => {
      const errorMessage = 'Failed to extract property data';
      propertyServiceMock.createFromInput.mockReturnValue(
        throwError(() => new Error(errorMessage))
      );

      propertyStore.createFromInput(mockCreateFromInputRequest);
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(propertyStore.error()).toBe(errorMessage);
      expect(propertyStore.loading()).toBe(false);
      expect(notificationServiceMock.error).toHaveBeenCalledWith(
        'Could not create property from input. Please try again.'
      );
    });
  });

  describe('runStage2', () => {
    it('should update property state after running stage2', async () => {
      propertyServiceMock.getAll.mockReturnValue(of([mockProperty]));
      propertyStore.load(undefined);
      await new Promise((resolve) => setTimeout(resolve, 100));

      propertyServiceMock.runStage2.mockReturnValue(of(mockPropertyStateTransition));

      propertyStore.runStage2(mockProperty.uuid);
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(propertyServiceMock.runStage2).toHaveBeenCalledWith(mockProperty.uuid);
      expect(propertyStore.entities()[mockProperty.uuid].state).toBe('STAGE2_IN_PROGRESS');
      expect(propertyStore.loading()).toBe(false);
    });

    it('should handle runStage2 error', async () => {
      const errorMessage = 'Failed to run stage 2';
      propertyServiceMock.runStage2.mockReturnValue(throwError(() => new Error(errorMessage)));

      propertyStore.runStage2('property-uuid-1');
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(propertyStore.error()).toBe(errorMessage);
      expect(propertyStore.loading()).toBe(false);
      expect(notificationServiceMock.error).toHaveBeenCalledWith(
        'Could not retrieve context data. Please try again.'
      );
    });
  });

  describe('runStage3', () => {
    it('should update property state after running stage3', async () => {
      propertyServiceMock.getAll.mockReturnValue(of([mockPropertyStage2Complete]));
      propertyStore.load(undefined);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const stage3Transition = {
        ...mockPropertyStateTransition,
        state: 'STAGE3_IN_PROGRESS' as const,
      };
      propertyServiceMock.runStage3.mockReturnValue(of(stage3Transition));

      propertyStore.runStage3(mockPropertyStage2Complete.uuid);
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(propertyServiceMock.runStage3).toHaveBeenCalledWith(mockPropertyStage2Complete.uuid);
      expect(propertyStore.entities()[mockPropertyStage2Complete.uuid].state).toBe(
        'STAGE3_IN_PROGRESS'
      );
      expect(propertyStore.loading()).toBe(false);
    });

    it('should handle runStage3 error', async () => {
      const errorMessage = 'Failed to run stage 3';
      propertyServiceMock.runStage3.mockReturnValue(throwError(() => new Error(errorMessage)));

      propertyStore.runStage3('property-uuid-1');
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(propertyStore.error()).toBe(errorMessage);
      expect(propertyStore.loading()).toBe(false);
      expect(notificationServiceMock.error).toHaveBeenCalledWith(
        'Could not calculate rating. Please try again.'
      );
    });
  });

  describe('select', () => {
    it('should set selectedId', () => {
      propertyStore.select('property-uuid-1');

      expect(propertyStore.selectedId()).toBe('property-uuid-1');
    });

    it('should clear selectedId when null', () => {
      propertyStore.select('property-uuid-1');
      propertyStore.select(null);

      expect(propertyStore.selectedId()).toBeNull();
    });
  });

  describe('checkDuplicate', () => {
    it('should return null when no properties exist', () => {
      const duplicate = propertyStore.checkDuplicate('rightmove-123456');

      expect(duplicate).toBeNull();
    });

    it('should return null when no duplicate found', async () => {
      propertyServiceMock.getAll.mockReturnValue(of([mockProperty]));
      propertyStore.load(undefined);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const duplicate = propertyStore.checkDuplicate('non-existent-id');

      expect(duplicate).toBeNull();
    });

    it('should return property when duplicate found by external_id', async () => {
      propertyServiceMock.getAll.mockReturnValue(of([mockProperty]));
      propertyStore.load(undefined);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const duplicate = propertyStore.checkDuplicate('rightmove-123456');

      expect(duplicate).toEqual(mockProperty);
    });

    it('should find duplicate among multiple properties', async () => {
      const mockProperties = [mockProperty, mockPropertyStage2Complete, mockPropertyStage3Complete];
      propertyServiceMock.getAll.mockReturnValue(of(mockProperties));
      propertyStore.load(undefined);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const duplicate = propertyStore.checkDuplicate('rightmove-123456');

      expect(duplicate).toEqual(mockProperty);
      expect(duplicate?.uuid).toBe('property-uuid-1');
    });
  });
});

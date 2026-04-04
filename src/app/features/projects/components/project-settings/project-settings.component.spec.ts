import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ProjectSettingsComponent } from './project-settings.component';
import { ProjectStore } from '../../store/project.store';
import { ActivatedRoute, Router } from '@angular/router';
import { signal } from '@angular/core';
import { Project } from '../../../../shared/models/project-models';
import { ContextOptions } from '../../../../shared/models/context-options.models';

describe('ProjectSettingsComponent', () => {
  let component: ProjectSettingsComponent;
  let fixture: ComponentFixture<ProjectSettingsComponent>;
  let mockProjectStore: any;
  let mockRouter: any;
  let mockRoute: any;

  const mockProject: Project = {
    uuid: 'test-uuid',
    owner: 'test-owner',
    title: 'Test Project',
    description: 'Test Description',
    viewers: ['viewer1@test.com'],
    contributors: ['contributor1@test.com'],
    rating_criteria: 'Test criteria',
    rating_criteria_source: null,
    context_options: null,
    property_lists_count: 0,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  };

  const mockContextOptions: ContextOptions = {
    uuid: 'context-uuid',
    project: 'test-uuid',
    enable_crime: true,
    enable_schools: true,
    school_types: ['primary'],
    enable_broadband: true,
    enable_mobile: false,
    enable_council_tax: true,
    enable_poi: true,
    poi_types: ['restaurant', 'supermarket'],
    poi_search_radius_meters: 1000,
    enable_saved_locations: false,
    saved_location_uuids: [],
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  };

  beforeEach(async () => {
    mockProjectStore = {
      selectedDetail: signal({ ...mockProject, context_options: mockContextOptions }),
      loading: signal(false),
      update: vi.fn(),
      setContextOptions: vi.fn(),
      delete: vi.fn(),
      loadDetail: vi.fn(),
    };

    mockRouter = {
      navigate: vi.fn(),
    };

    mockRoute = {
      snapshot: {
        paramMap: {
          get: vi.fn().mockReturnValue('test-uuid'),
        },
      },
    };

    await TestBed.configureTestingModule({
      imports: [ProjectSettingsComponent],
      providers: [
        { provide: ProjectStore, useValue: mockProjectStore },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockRoute },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectSettingsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load project detail on init', () => {
    component.ngOnInit();
    expect(mockProjectStore.loadDetail).toHaveBeenCalledWith('test-uuid');
  });

  it('should initialize form values from project', async () => {
    vi.useFakeTimers();
    component.ngOnInit();

    vi.advanceTimersByTime(600);

    expect(component.title()).toBe('Test Project');
    expect(component.description()).toBe('Test Description');
    expect(component.viewers()).toEqual(['viewer1@test.com']);
    expect(component.contributors()).toEqual(['contributor1@test.com']);
    expect(component.ratingCriteria()).toBe('Test criteria');

    vi.useRealTimers();
  });

  it('should initialize context options from project', async () => {
    vi.useFakeTimers();
    component.ngOnInit();

    vi.advanceTimersByTime(600);

    expect(component.enableCrime()).toBe(true);
    expect(component.enableSchools()).toBe(true);
    expect(component.schoolTypes()).toEqual(['primary']);
    expect(component.enablePoi()).toBe(true);
    expect(component.poiTypes()).toEqual(['restaurant', 'supermarket']);

    vi.useRealTimers();
  });

  it('should call update on saveProjectDetails', () => {
    component.projectUuid = 'test-uuid';
    component.title.set('Updated Title');
    component.description.set('Updated Description');

    component.saveProjectDetails();

    expect(mockProjectStore.update).toHaveBeenCalledWith({
      uuid: 'test-uuid',
      data: {
        title: 'Updated Title',
        description: 'Updated Description',
      },
    });
  });

  it('should call setContextOptions on saveContextOptions', () => {
    component.projectUuid = 'test-uuid';
    component.enableCrime.set(true);
    component.enableSchools.set(false);

    component.saveContextOptions();

    expect(mockProjectStore.setContextOptions).toHaveBeenCalledWith(
      expect.objectContaining({
        uuid: 'test-uuid',
        data: expect.objectContaining({
          enable_crime: true,
          enable_schools: false,
        }),
      })
    );
  });

  it('should call update on saveRatingCriteria', () => {
    component.projectUuid = 'test-uuid';
    component.ratingCriteria.set('New criteria');

    component.saveRatingCriteria();

    expect(mockProjectStore.update).toHaveBeenCalledWith({
      uuid: 'test-uuid',
      data: {
        rating_criteria: 'New criteria',
      },
    });
  });

  it('should call update on saveViewersContributors', () => {
    component.projectUuid = 'test-uuid';
    component.viewers.set(['viewer@test.com']);
    component.contributors.set(['contributor@test.com']);

    component.saveViewersContributors();

    expect(mockProjectStore.update).toHaveBeenCalledWith({
      uuid: 'test-uuid',
      data: {
        viewers: ['viewer@test.com'],
        contributors: ['contributor@test.com'],
      },
    });
  });

  it('should add viewer when addViewer is called', () => {
    component.newViewer.set('new@test.com');
    component.viewers.set([]);

    component.addViewer();

    expect(component.viewers()).toContain('new@test.com');
    expect(component.newViewer()).toBe('');
  });

  it('should not add duplicate viewer', () => {
    component.newViewer.set('existing@test.com');
    component.viewers.set(['existing@test.com']);

    component.addViewer();

    expect(component.viewers().length).toBe(1);
  });

  it('should remove viewer when removeViewer is called', () => {
    component.viewers.set(['viewer1@test.com', 'viewer2@test.com']);

    component.removeViewer('viewer1@test.com');

    expect(component.viewers()).toEqual(['viewer2@test.com']);
  });

  it('should add contributor when addContributor is called', () => {
    component.newContributor.set('new@test.com');
    component.contributors.set([]);

    component.addContributor();

    expect(component.contributors()).toContain('new@test.com');
    expect(component.newContributor()).toBe('');
  });

  it('should remove contributor when removeContributor is called', () => {
    component.contributors.set(['contributor1@test.com', 'contributor2@test.com']);

    component.removeContributor('contributor1@test.com');

    expect(component.contributors()).toEqual(['contributor2@test.com']);
  });

  it('should toggle school type when toggleSchoolType is called', () => {
    component.schoolTypes.set(['primary']);

    component.toggleSchoolType('secondary');
    expect(component.schoolTypes()).toContain('secondary');

    component.toggleSchoolType('primary');
    expect(component.schoolTypes()).not.toContain('primary');
  });

  it('should toggle POI type when togglePoiType is called', () => {
    component.poiTypes.set(['restaurant']);

    component.togglePoiType('supermarket');
    expect(component.poiTypes()).toContain('supermarket');

    component.togglePoiType('restaurant');
    expect(component.poiTypes()).not.toContain('restaurant');
  });

  it('should open delete modal when openDeleteModal is called', () => {
    component.openDeleteModal();

    expect(component.showDeleteModal()).toBe(true);
    expect(component.deleteConfirmation()).toBe('');
  });

  it('should close delete modal when closeDeleteModal is called', () => {
    component.showDeleteModal.set(true);
    component.deleteConfirmation.set('DELETE');

    component.closeDeleteModal();

    expect(component.showDeleteModal()).toBe(false);
    expect(component.deleteConfirmation()).toBe('');
  });

  it('should delete project when confirmation matches', async () => {
    vi.useFakeTimers();
    mockProjectStore.loading.set(false);
    component.projectUuid = 'test-uuid';
    component.deleteConfirmation.set('delete');

    component.confirmDelete();

    expect(mockProjectStore.delete).toHaveBeenCalledWith('test-uuid');

    vi.advanceTimersByTime(200);

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/projects']);

    vi.useRealTimers();
  });

  it('should not delete project when confirmation does not match', () => {
    component.projectUuid = 'test-uuid';
    component.deleteConfirmation.set('wrong');

    component.confirmDelete();

    expect(mockProjectStore.delete).not.toHaveBeenCalled();
  });

  it('should navigate back to project detail on navigateBack', () => {
    component.projectUuid = 'test-uuid';

    component.navigateBack();

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/projects', 'test-uuid']);
  });
});

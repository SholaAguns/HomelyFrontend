import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, exhaustMap, catchError, EMPTY } from 'rxjs';
import { ProjectService } from '../../../core/services/project-service/project.service';
import {
  Project,
  ProjectDetail,
  CreateProjectDto,
  UpdateProjectDto,
  ProjectStats,
  CreateContextOptionsDto,
} from '../../../shared/models/project-models';

type ProjectState = {
  entities: Record<string, Project>;
  detailEntities: Record<string, ProjectDetail>;
  statsEntities: Record<string, ProjectStats>;
  ids: string[];
  selectedId: string | null;
  loading: boolean;
  error: string | null;
};

const initialState: ProjectState = {
  entities: {},
  detailEntities: {},
  statsEntities: {},
  ids: [],
  selectedId: null,
  loading: false,
  error: null,
};

export const ProjectStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ entities, detailEntities, statsEntities, ids, selectedId }) => ({
    all: computed(() => ids().map((id) => entities()[id])),
    selected: computed(() => {
      const id = selectedId();
      return id ? entities()[id] : null;
    }),
    selectedDetail: computed(() => {
      const id = selectedId();
      return id ? detailEntities()[id] : null;
    }),
    selectedStats: computed(() => {
      const id = selectedId();
      return id ? statsEntities()[id] : null;
    }),
    count: computed(() => ids().length),
  })),
  withMethods((store, projectService = inject(ProjectService)) => ({
    load: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(() =>
          projectService.getAll().pipe(
            tap((projects) => {
              const entities: Record<string, Project> = {};
              const ids: string[] = [];
              projects.forEach((project) => {
                entities[project.uuid] = project;
                ids.push(project.uuid);
              });
              patchState(store, { entities, ids, loading: false });
            }),
            catchError((error) => {
              patchState(store, { error: error.message, loading: false });
              return EMPTY;
            })
          )
        )
      )
    ),

    loadDetail: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((uuid) =>
          projectService.getByUuid(uuid).pipe(
            tap((project) => {
              patchState(store, {
                detailEntities: {
                  ...store.detailEntities(),
                  [uuid]: project,
                },
                entities: {
                  ...store.entities(),
                  [uuid]: project,
                },
                selectedId: uuid,
                loading: false,
              });
            }),
            catchError((error) => {
              patchState(store, { error: error.message, loading: false });
              return EMPTY;
            })
          )
        )
      )
    ),

    loadStats: rxMethod<string>(
      pipe(
        switchMap((uuid) =>
          projectService.getStats(uuid).pipe(
            tap((stats) => {
              patchState(store, {
                statsEntities: {
                  ...store.statsEntities(),
                  [uuid]: stats,
                },
              });
            }),
            catchError(() => EMPTY)
          )
        )
      )
    ),

    create: rxMethod<CreateProjectDto>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        exhaustMap((dto) =>
          projectService.create(dto).pipe(
            tap((project) => {
              patchState(store, {
                entities: {
                  ...store.entities(),
                  [project.uuid]: project,
                },
                ids: [...store.ids(), project.uuid],
                loading: false,
              });
            }),
            catchError((error) => {
              patchState(store, { error: error.message, loading: false });
              return EMPTY;
            })
          )
        )
      )
    ),

    update: rxMethod<{ uuid: string; data: UpdateProjectDto }>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        exhaustMap(({ uuid, data }) =>
          projectService.update(uuid, data).pipe(
            tap((project) => {
              patchState(store, {
                entities: {
                  ...store.entities(),
                  [uuid]: project,
                },
                loading: false,
              });
            }),
            catchError((error) => {
              patchState(store, { error: error.message, loading: false });
              return EMPTY;
            })
          )
        )
      )
    ),

    delete: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        exhaustMap((uuid) =>
          projectService.delete(uuid).pipe(
            tap(() => {
              const entities = { ...store.entities() };
              const detailEntities = { ...store.detailEntities() };
              const statsEntities = { ...store.statsEntities() };
              delete entities[uuid];
              delete detailEntities[uuid];
              delete statsEntities[uuid];
              patchState(store, {
                entities,
                detailEntities,
                statsEntities,
                ids: store.ids().filter((id) => id !== uuid),
                loading: false,
              });
            }),
            catchError((error) => {
              patchState(store, { error: error.message, loading: false });
              return EMPTY;
            })
          )
        )
      )
    ),

    setContextOptions: rxMethod<{ uuid: string; data: CreateContextOptionsDto }>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        exhaustMap(({ uuid, data }) =>
          projectService.setContextOptions(uuid, data).pipe(
            tap((contextOptions) => {
              const entity = store.entities()[uuid];
              const detailEntity = store.detailEntities()[uuid];
              if (entity) {
                const updatedEntity = {
                  ...entity,
                  context_options: contextOptions,
                };
                patchState(store, {
                  entities: {
                    ...store.entities(),
                    [uuid]: updatedEntity,
                  },
                  detailEntities: detailEntity
                    ? {
                        ...store.detailEntities(),
                        [uuid]: { ...detailEntity, context_options: contextOptions },
                      }
                    : store.detailEntities(),
                  loading: false,
                });
              }
            }),
            catchError((error) => {
              patchState(store, { error: error.message, loading: false });
              return EMPTY;
            })
          )
        )
      )
    ),

    setSelected: (uuid: string | null) => patchState(store, { selectedId: uuid }),
  }))
);

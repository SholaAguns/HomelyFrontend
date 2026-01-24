import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { App } from './app';
import { Router, ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

describe('App', () => {
  beforeEach(async () => {
    const routerMock = {
      navigate: vi.fn(),
      events: of(),
      createUrlTree: vi.fn(),
      serializeUrl: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: {
          params: of({}),
          snapshot: { params: {}, queryParams: {}, data: {}, url: [], outlet: 'primary', routeConfig: null, root: {} as any, parent: null, firstChild: null, children: [], pathFromRoot: [], paramMap: of({} as any), queryParamMap: of({} as any) }
        }}
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render title', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Homely');
  });
});

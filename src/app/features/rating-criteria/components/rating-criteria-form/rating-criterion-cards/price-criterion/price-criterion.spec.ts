import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PriceCriterion } from './price-criterion';

describe('PriceCriterion', () => {
  let component: PriceCriterion;
  let fixture: ComponentFixture<PriceCriterion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PriceCriterion],
    }).compileComponents();

    fixture = TestBed.createComponent(PriceCriterion);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

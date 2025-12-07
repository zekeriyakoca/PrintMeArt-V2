import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeaturedPrintsComponent } from './featured-prints.component';

describe('FeaturedPrintsComponent', () => {
  let component: FeaturedPrintsComponent;
  let fixture: ComponentFixture<FeaturedPrintsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeaturedPrintsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FeaturedPrintsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

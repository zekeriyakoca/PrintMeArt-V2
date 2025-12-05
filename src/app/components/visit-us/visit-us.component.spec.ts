import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisitUsComponent } from './visit-us.component';

describe('VisitUsComponent', () => {
  let component: VisitUsComponent;
  let fixture: ComponentFixture<VisitUsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VisitUsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VisitUsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

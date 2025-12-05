import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderJourneyComponent } from './order-journey.component';

describe('OrderJourneyComponent', () => {
  let component: OrderJourneyComponent;
  let fixture: ComponentFixture<OrderJourneyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderJourneyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrderJourneyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

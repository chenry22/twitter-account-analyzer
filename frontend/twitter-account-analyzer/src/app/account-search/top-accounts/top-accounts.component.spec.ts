import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TopAccountsComponent } from './top-accounts.component';

describe('TopAccountsComponent', () => {
  let component: TopAccountsComponent;
  let fixture: ComponentFixture<TopAccountsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TopAccountsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TopAccountsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

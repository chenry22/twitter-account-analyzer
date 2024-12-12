import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnalysisDonutComponent } from './analysis-donut.component';

describe('AnalysisDonutComponent', () => {
  let component: AnalysisDonutComponent;
  let fixture: ComponentFixture<AnalysisDonutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnalysisDonutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnalysisDonutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FrequencyAnalysisComponent } from './frequency-analysis.component';

describe('FrequencyAnalysisComponent', () => {
  let component: FrequencyAnalysisComponent;
  let fixture: ComponentFixture<FrequencyAnalysisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FrequencyAnalysisComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FrequencyAnalysisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

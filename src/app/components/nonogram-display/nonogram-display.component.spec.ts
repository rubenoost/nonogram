import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NonogramDisplayComponent } from './nonogram-display.component';

describe('NonogramDisplayComponent', () => {
  let component: NonogramDisplayComponent;
  let fixture: ComponentFixture<NonogramDisplayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NonogramDisplayComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NonogramDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

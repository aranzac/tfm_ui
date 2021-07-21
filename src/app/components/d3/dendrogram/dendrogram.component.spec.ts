import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DendrogramComponent } from './dendrogram.component';

describe('DendrogramComponent', () => {
  let component: DendrogamComponent;
  let fixture: ComponentFixture<DendrogamComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DendrogamComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DendrogamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

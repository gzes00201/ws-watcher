import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayresultComponent } from './playresult.component';

describe('PlayresultComponent', () => {
  let component: PlayresultComponent;
  let fixture: ComponentFixture<PlayresultComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlayresultComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlayresultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

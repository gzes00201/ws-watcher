import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayResultHistoryComponent } from './play-result-history.component';

describe('PlayResultHistoryComponent', () => {
  let component: PlayResultHistoryComponent;
  let fixture: ComponentFixture<PlayResultHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlayResultHistoryComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlayResultHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

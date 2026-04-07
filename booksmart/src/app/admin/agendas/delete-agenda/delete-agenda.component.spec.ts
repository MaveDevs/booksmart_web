import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteAgendaComponent } from './delete-agenda.component';

describe('DeleteAgendaComponent', () => {
  let component: DeleteAgendaComponent;
  let fixture: ComponentFixture<DeleteAgendaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeleteAgendaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeleteAgendaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

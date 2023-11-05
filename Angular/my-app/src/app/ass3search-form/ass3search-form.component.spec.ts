import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Ass3searchFormComponent } from './ass3search-form.component';

describe('Ass3searchFormComponent', () => {
  let component: Ass3searchFormComponent;
  let fixture: ComponentFixture<Ass3searchFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [Ass3searchFormComponent]
    });
    fixture = TestBed.createComponent(Ass3searchFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MovieComponent } from './movie';
import { FormsModule } from '@angular/forms';

describe('Movie', () => {
  let component: MovieComponent;
  let fixture: ComponentFixture<MovieComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormsModule, MovieComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MovieComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

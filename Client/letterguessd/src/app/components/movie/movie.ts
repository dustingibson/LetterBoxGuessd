import { Component, input, OnInit, output, Signal, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { debounceTime, distinctUntilChanged, Observable, of, startWith, switchMap } from 'rxjs';
import { MovieClue, MovieResult, MovieSearchInfo, Status } from '../../models';
import { ApiService } from '../../services/api/api';
import { MatFormFieldModule } from '@angular/material/form-field';
import { AsyncPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon, MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-movie',
  imports: [MatAutocompleteModule, MatFormFieldModule, MatInputModule, MatCardModule, MatButtonModule, ReactiveFormsModule, MatIconModule, AsyncPipe, MatIconModule],
  templateUrl: './movie.html',
  styleUrl: './movie.scss',
})
export class MovieComponent implements OnInit {
  public movieGuess: MovieSearchInfo | null = null;
  searchControl = new FormControl();
  searchMovies$: Observable<MovieSearchInfo[]> = of([]);
  shake$ = signal(false);
  notifyResult = output();
  movieResult: MovieResult | null = new MovieResult();

  public clue = input.required<MovieClue>();

  constructor(private readonly apiService: ApiService) { }

  ngOnInit() {
    this.searchMovies$ = this.searchControl.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(keyword => this.apiService.search(this.filterOptions(keyword))),
    );
  }

  filterOptions(value: any) {
    if (typeof value === 'string')
      return value;
    return value.movieTitle;
  }

  shakeScreen() {
    this.shake$.set(false);
    setTimeout(() => {
      this.shake$.set(true);
    }, 0);
  }

  stopShake() {
    this.shake$.set(false);
  }

  movieTitle(movieTitle: MovieSearchInfo): string {
    return movieTitle?.title ?? "";
  }

  checkResult(): Promise<MovieResult | null> {
    return new Promise((resolve, reject) => {
      try {
        if (this.clue().status === Status.FAILED || this.clue().status === Status.PASSED) {
          this.apiService.getMovie(this.clue().id).subscribe((apiResult) => {
            resolve(apiResult);
          });
        } else {
          resolve(null);
        }
      } catch (err) {
        reject(err);
      }

    });
  }

  async checkAttempt() {
    if (this.clue().id === (this.searchControl.value?.id ?? "")) {
      this.clue().status = Status.PASSED;
    } else {
      this.clue().attempts = !this.clue().attempts ? 1 : this.clue().attempts + 1;
      this.shakeScreen();
      if (this.clue().attempts >= 5) {
        this.clue().status = Status.FAILED;
      }
    }
    this.movieResult = await this.checkResult();
    this.notifyResult.emit();
  }

  submitGuess() {
    if (this.searchControl.value?.id)
      this.checkAttempt();
    this.searchControl.setValue('');
  }

}

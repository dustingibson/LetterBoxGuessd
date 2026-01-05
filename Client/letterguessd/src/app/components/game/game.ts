import { Component, effect, inject, OnInit, signal, Signal } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { MovieComponent } from "../movie/movie";
import { ApiService } from '../../services/api/api';
import { GameResults, MovieClue, MovieClues, Status } from '../../models';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog } from '@angular/material/dialog';
import { ResultsComponent } from '../results/results';

@Component({
  selector: 'app-game',
  imports: [MatTabsModule, MatMenuModule, MovieComponent],
  templateUrl: './game.html',
  styleUrl: './game.scss',
})
export class GameComponent implements OnInit {
  
  public clues$: Signal<MovieClues> = signal(new MovieClues);
  readonly dialog = inject(MatDialog);

  constructor(private readonly apiService: ApiService) {  
    this.clues$ = toSignal(this.apiService.cluesSearch(localStorage.getItem('moviesv2')), {initialValue: new MovieClues()});
    effect(() => {
      if (this.clues$()?.movies?.length ?? 0 > 0)
        this.checkResult();
    });
  }

  setToLocal() {
    if (this.clues$()?.movies?.length ?? 0 > 0)
      localStorage.setItem('moviesv2', JSON.stringify( this.clues$() ));
  }

  get dateString(): string {
    let realDate: Date = new Date(this.clues$().date_of);
    return (realDate.getMonth() + 1) + "/" + realDate.getDate() + "/" + realDate.getFullYear();
  }
  
  statusIcon(clue: MovieClue) {
    switch (clue.status) {
      case Status.IN_PROGRESS:
        return "🚧";
      case Status.FAILED:
        return "❌";
      case Status.PASSED:
        return "✅️";
      default:
        return "🚧";
    }
  }

  toResults(): GameResults {
    let results: GameResults = new GameResults();
    this.clues$().movies.forEach(c => {
      results.tally.push({
        passed: c.status === Status.PASSED,
        attempts: c.attempts === undefined ? 0 : c.attempts
      });
    });
    results.date = this.clues$().date_of;
    return results;
  }

  checkResult() {
    let isFinished: boolean = true;
    this.clues$().movies.forEach((m) => {
      if(m.status == undefined || m.status === Status.IN_PROGRESS) { isFinished = false;}
    });
    if (isFinished) {
      this.openDialog();
    }
    this.setToLocal();
  }

  openDialog() {
    let dialogRef = this.dialog.open(ResultsComponent, {
      width: '400px',
      height: '310px'
    });
    dialogRef.componentInstance.setResults(this.toResults());
  }

  async ngOnInit() {
  }

  timeDiff() {
    const nowDate = new Date();
    const expireDate = new Date(this.clues$().expire_date);
    let totalMinutes = ((expireDate.getTime()) - (nowDate.getTime() ) )  / 1000 / 60;
    let totalHours = Math.floor( totalMinutes / 60 );
    let remainingMinutes = totalMinutes % 60;
    return `${totalHours} hours and ${remainingMinutes.toFixed(0)} minutes`;
  }
}

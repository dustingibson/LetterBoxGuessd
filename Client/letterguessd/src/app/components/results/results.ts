import { Component, inject, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { GameResults } from '../../models';
import {ClipboardModule} from '@angular/cdk/clipboard';
import { L } from '@angular/cdk/keycodes';


@Component({
  selector: 'app-results',
  imports: [MatButtonModule, MatDialogActions, MatDialogClose, MatDialogTitle, MatDialogContent, ClipboardModule],
  templateUrl: './results.html',
  styleUrl: './results.scss',
})
export class ResultsComponent {
  readonly dialogRef = inject(MatDialogRef<ResultsComponent>);
  public results: GameResults = new GameResults();
  public score: number = 0;
  public totalScore: number = 0;
  public percentage: number = 0.00;

  setResults(newResults: GameResults) {
    this.results = newResults;
    this.results.tally.forEach((r, idx) => {
      if (r.passed)
        this.score += 100 * (5 - r.attempts);
    });
    this.totalScore = this.results.tally.length * 500;
    this.percentage = (this.score / this.totalScore) * 100;
  }

  get grade(): string {
    if (this.percentage == 100)
      return 'S';
    else if (this.percentage >= 90)
      return 'A';
    else if (this.percentage >= 80)
      return 'B';
    else if (this.percentage >= 70)
      return 'C';
    else if (this.percentage >= 60)
      return 'D';
    return 'F';
  }

  get dateString(): string {
    let realDate: Date = new Date(this.results.date);
    return (realDate.getMonth() + 1) + "/" + realDate.getDate() + "/" + realDate.getFullYear();
  }

  get gradeColor(): string {
    let curGrade = this.grade;
      if (curGrade === 'S')
        return 'color: #ff7f7f; font-size: 16pt;';
      if (curGrade === 'A')
        return 'color: #ffbf7f; font-size: 16pt;';
      if (curGrade === 'B')
        return 'color: #ffdf7f; font-size: 16pt;';
      if (curGrade === 'C')
        return 'color: #ffff7f; font-size: 16pt;';
      if (curGrade === 'D')
        return 'color: #bfff7f; font-size: 16pt;';
      else
        return 'color: #7fffff; font-size: 16pt;';
  }

  clipboardText() {
    let clipboardText: string = `https://dustingibson.com/letterguessd ${this.dateString}\r\n`;
    this.results.tally.forEach((r, idx) => {
      clipboardText += `Movie #${idx + 1}:  `
      for (let i = 0; i < r.attempts; i++)
        clipboardText += `❌`;
      if (r.passed)
        clipboardText += `✅`;
      clipboardText += '\n';
    });
    clipboardText += `Grade: ${this.grade} ${this.percentage.toFixed(2)}%`
    return clipboardText;
  }

}

import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, of, tap } from 'rxjs';
import { MovieClues, MovieResult, MovieSearchInfo } from '../../models';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private url: string = "https://dustingibson.com/api4/";
  //private url: string = "http://localhost:3035";

  constructor(private readonly http: HttpClient) {}

  search(keyword: string) : Observable<MovieSearchInfo[]> {
    if (keyword?.replace(' ', '') ?? '' !== '')
      return this.http.get<MovieSearchInfo[]>(`${this.url}/search?keyword=${keyword}`);
    return of<MovieSearchInfo[]>([]);
  }

  getMovie(id: string) : Observable<MovieResult> {
    return this.http.get<MovieResult>(`${this.url}/movie?id=${id}`);
  }
 
  cluesSearch(currentClues: string | null) : Observable<MovieClues> {
    const nowDate = new Date();
    if (currentClues) {
      const obj = JSON.parse(currentClues) as MovieClues;
      const expireDate = new Date(obj.date_of);
      expireDate.setDate(expireDate.getDate() + 1);
      if ((nowDate).getTime() <= expireDate.getTime())
        return of(JSON.parse(currentClues) as MovieClues).pipe(tap());
      else
        localStorage.clear();
    }
    const nowDateStr = `${nowDate.getFullYear()}-${(nowDate.getMonth()+1)}-${nowDate.getDate()}`;
    return this.http.get<MovieClues>(`${this.url}/clues_from_date?fromDate=${nowDateStr}`);
  }

  convertToUTC(dateString: string) {
    const date = new Date(dateString);
    const utcMilliseconds = date.getTime() + date.getTimezoneOffset() * 60000;
    const targetDate = new Date(utcMilliseconds); 
    return targetDate.toISOString();
  }

}

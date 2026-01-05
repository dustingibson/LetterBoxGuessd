export enum Status {
    IN_PROGRESS = 0,
    FAILED = 1,
    PASSED = 2
}

export class MovieSearchInfo {
    id: string = '';
    title: string = '';
}

export class MovieResult {
    title: string = '';
}

export class MovieClues {
    movies: MovieClue[] = [];
    expire_date: Date | string = new Date();
    date_of: string = '';
}

export class MovieClue {
    id: string = '';
    reviews: string[] = [];
    status: Status = Status.IN_PROGRESS;
    attempts: number = 0;
}

export class GameResults {
    tally: GameResult[] = [];
    date: string = '';
}

export class GameResult {
    attempts: number = 0;
    passed: boolean = false;
}
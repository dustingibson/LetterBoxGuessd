import mysql from 'mysql2/promise';
import express from 'express';
import cors from 'cors';
import fs from 'node:fs';
const config = require("./config.json");

const app = express();
const port = 3035;
const dictionaryWords = new Map();

let con = await mysql.createConnection({
  host: config['host'],
  user: config['user'],
  password: config['password'],
  database: config['db'],
  charset: "utf8mb4"
});

app.use(cors());

function getDictionaryWords() {
  let dictText = fs.readFileSync('dictionary.txt', 'utf8').split('\n');
  for (let curText of dictText) {
    const wordToAdd = curText.replace('\r', '').toLowerCase();
    dictionaryWords.set(wordToAdd, 1);
  }
}

async function SearchMovie(keyword) {
  try {
    const query = `SELECT ID, ORIGINAL_TITLE,
 if(release_year is not null, CONCAT(ORIGINAL_TITLE, ' (', RELEASE_YEAR, ')'), ORIGINAL_TITLE) SENT_TITLE
FROM MOVIES 
                    WHERE ORIGINAL_TITLE like ?
                     ORDER BY 
 CASE
	WHEN ORIGINAL_TITLE = ? THEN 0  
    WHEN ORIGINAL_TITLE LIKE ? THEN 1
    WHEN ORIGINAL_TITLE LIKE ? THEN 2
    WHEN ORIGINAL_TITLE LIKE ? THEN 3
    ELSE 4
  END LIMIT 10`;
    const [rows, fields] = await con.query(query, [`%${keyword}%`, `${keyword}`, `${keyword}%`, `%${keyword}`, `%${keyword}%`]);
    return rows.map(r => { return { id: r.ID, title: r.SENT_TITLE } });
  } catch (err) {
    console.log(err);
  }
}

function replaceTitle(curText, title) {
  title.split(' ').forEach(titleWord => {
    if (!dictionaryWords.has(titleWord.toLowerCase())) {
      curText = curText.replaceAll(titleWord, '[REDACTED]');
    }
  });
  return curText;
}

function sanitizeText(curText, title) {
  curText = curText.replaceAll('<p>', '').replaceAll('</p>', ' ').replaceAll('<b>', '').replaceAll('</b>', '').replaceAll('<br />', ' ')
    .replaceAll('<i>', '').replaceAll('</i>', '').replace(title, '[REDACTED]');
  curText = replaceTitle(curText, title);
  return curText;
}

async function GetClues() {
  try {
    const output = { movies: [], expire_date: '', date_of: '' };

    const query = `SELECT M.ID "MOVIE_ID", R.REVIEW_TEXT "REVIEW_TEXT", M.PRIMARY_TITLE "MOVIE_TITLE", CAST(DATE(DATE_ADD(UTC_TIMESTAMP(), INTERVAL 1 DAY) ) AS DATETIME) "EXPIRE_DATE", CAST(DATE(DATE_ADD(UTC_TIMESTAMP(), INTERVAL 0 DAY) ) AS DATETIME) "DATE_OF"  FROM MOVIES M
          JOIN REVIEWS R ON R.MOVIE_ID = M.ID
          WHERE 
          DATE(GAME_DATE) >= CAST(DATE(DATE_ADD(UTC_TIMESTAMP(), INTERVAL 0 DAY) ) AS DATETIME) AND DATE(GAME_DATE) < CAST(DATE(DATE_ADD(UTC_TIMESTAMP(), INTERVAL 1 DAY) ) AS DATETIME)`;
    const [rows, fields] = await con.query(query);
    for (var row of rows) {
      const movie_id = row.MOVIE_ID;
      const review_text = row.REVIEW_TEXT;
      const cur_movie = output.movies.find(m => m.id == movie_id);
      output.expire_date = row.EXPIRE_DATE;
      output.date_of = row.DATE_OF;
      if (!cur_movie) {
        output.movies.push({ id: movie_id, reviews: [sanitizeText(review_text, row.MOVIE_TITLE)] })
      } else {
        cur_movie.reviews.push(sanitizeText(review_text, row.MOVIE_TITLE));
      }
      // TODO: Sanitize review text
    }
    return output;
  } catch (err) {
    console.log(err);
  }
}

  
async function GetCluesFromDate(fromDate) {
  try {
    const output = { movies: [], expire_date: '', date_of: '' };

    const query = `SELECT M.ID "MOVIE_ID", R.REVIEW_TEXT "REVIEW_TEXT", M.PRIMARY_TITLE "MOVIE_TITLE", CAST(DATE_ADD('${fromDate}', INTERVAL 1 DAY) AS DATETIME) "EXPIRE_DATE", CAST('${fromDate}' AS DATETIME) "DATE_OF"  FROM MOVIES M
          JOIN REVIEWS R ON R.MOVIE_ID = M.ID
          WHERE 
          GAME_DATE >= '${fromDate}' AND GAME_DATE <= DATE_ADD('${fromDate}', INTERVAL 1 DAY)`;
    const [rows, fields] = await con.query(query);
    for (var row of rows) {
      const movie_id = row.MOVIE_ID;
      const review_text = row.REVIEW_TEXT;
      const cur_movie = output.movies.find(m => m.id == movie_id);
      output.expire_date = row.EXPIRE_DATE;
      output.date_of = row.DATE_OF;
      if (!cur_movie) {
        output.movies.push({ id: movie_id, reviews: [sanitizeText(review_text, row.MOVIE_TITLE)] })
      } else {
        cur_movie.reviews.push(sanitizeText(review_text, row.MOVIE_TITLE));
      }
      // TODO: Sanitize review text
    }
    return output;
  } catch (err) {
    console.log(err);
  }
}


async function GetMovie(id) {
  try {
    const query = `SELECT M.ID "MOVIE_ID", if(release_year is not null, CONCAT(ORIGINAL_TITLE, ' (', RELEASE_YEAR, ')'), ORIGINAL_TITLE) SENT_TITLE FROM MOVIES M
                  WHERE ID=?`;
    const [rows, fields] = await con.query(query, [id]);
    return rows.map(r => { return { id: r.ID, title: r.SENT_TITLE } })[0];
  } catch (err) {
    console.log(err);
  }
}

getDictionaryWords();

app.get('/search', async (req, res) => {
  res.send(await SearchMovie(req.query.keyword));
});

app.get('/movie', async (req, res) => {
  res.send(await GetMovie(req.query.id));
});

app.get('/clues', async (req, res) => {
  res.send(await GetClues());
});

app.get('/clues_from_date', async (req, res) => {
  res.send(await GetCluesFromDate(req.query.fromDate));
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
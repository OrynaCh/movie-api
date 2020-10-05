/* eslint-disable no-underscore-dangle */
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const Promise = require("bluebird");
const csv = require("convert-csv-to-json");

class Repository {
  constructor() {
    this.db = new sqlite3.Database(":memory:", (err) => {
      if (err) {
        console.log("Could not connect to database", err);
      } else {
        console.log("Connected to database");
      }
    });
  }

  init() {
    this._createSchema();
    this._seedTestData();
  }

  _seedTestData() {
    const inputFile = path.join(`${__dirname}/../../assets/testList.csv`);
    const movies = csv.getJsonFromCsv(inputFile);
    movies.forEach((movie) => {
      this.db.run("INSERT INTO movies (id, name, genre1, genre2, year) VALUES (?,?,?,?,?)",
        [movie.id, movie.name, movie.genre1, movie.genre2, movie.year]);
    });
  }

  _createSchema() {
    this.db.serialize(() => {
      this.db.run("CREATE TABLE movies ("
          + "id INTEGER PRIMARY KEY, name TEXT NOT NULL, genre1 TEXT NOT NULL, genre2 TEXT, year INTEGER)");
      this.db.run("CREATE INDEX idx_year ON movies (year)");
      this.db.run("CREATE INDEX idx_genre1 ON movies (genre1)");
      this.db.run("CREATE INDEX idx_genre2 ON movies (genre2)");
    });
  }

  getMovies(genres, period, page = 1) {
    const conditions = this._getConditions(genres, period);
    const offset = page < 2 ? 0 : (page - 1) * 10;
    const sql = `SELECT * FROM movies WHERE ${conditions.where} LIMIT 10 OFFSET ${offset}`;
    return new Promise((resolve, reject) => {
      this.db.all(sql, conditions.values, (err, rows) => {
        if (err) {
          console.log(`Error running sql: ${sql}`);
          console.log(err);
          reject(err);
        } else {
          resolve({ items: rows, pageNumber: page });
        }
      });
    });
  }

  _getConditions(genres, period) {
    const conditions = [];
    const values = [];
    if (genres) {
      const placeholder = genres.map(() => "?").join(",");
      conditions.push(`(genre1 IN (${placeholder}) OR genre2 IN (${placeholder}))`);
      values.push(...genres); // values for genre1 IN
      values.push(...genres); // values for genre2 IN
    }
    if (period) {
      if (period.dateFrom && period.dateTo) {
        conditions.push("year BETWEEN (?) AND (?)");
        values.push(period.dateFrom, period.dateTo);
      } else {
        const year = period.dateFrom || period.dateTo;
        conditions.push("year = ?");
        values.push(year);
      }
    }
    return {
      where: conditions.length ? conditions.join(" AND ") : "1",
      values,
    };
  }
}

module.exports = new Repository();

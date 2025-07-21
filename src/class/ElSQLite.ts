/**
 * ElSQLite.ts
 *
 * ElSQLite
 * function：ElSQLite for electron
 * updated: 2025/07/21
 **/

'use strict';

// define modules
import { DatabaseSync } from 'node:sqlite';

// SQLite class
class SQLite {
  static logger: any; // static logger
  static database: any; // database
  static table: string; // initDatabase 
  static columns: string[]; // initDatabase

  // construnctor
  constructor(logger: any, dbpath: string, table: string, columns: string[], types: any[]) {
    // DB config
    SQLite.database = new DatabaseSync(dbpath);
    // set table
    SQLite.table = table;
    // set columns
    SQLite.columns = columns;
    // format query
    let query: string = ``;
    // make query
    for (let i = 0; i < columns.length; i++) {
      query += columns[i];
      query += ' ';
      query += types[i];
      // when not last
      if (i < columns.length - 1) {
        query += ',';
      }
    }
    // initialize
    const initDatabase: string = `
      CREATE TABLE IF NOT EXISTS ${table} (
        ${query}
      );
    `;
    // execute
    SQLite.database.exec(initDatabase);
    // logger setting
    SQLite.logger = logger;
    SQLite.logger.debug('sqlite: initialize mode');
  }

  // select from DB
  selectDB(): any {
    SQLite.logger.debug('sqlite: selectDB mode');
    // query
    SQLite.logger.silly(`SELECT * FROM ${SQLite.table}`);
    const selectQuery: any = SQLite.database.prepare(`SELECT * FROM ${SQLite.table}`);
    // execute
    return selectQuery.all();
  }

  // insert to DB
  updateDB(columns: string[], values: any[], conditions: string[], wheres: any[]): any {
    SQLite.logger.debug('sqlite: updateDB mode');
    // format query
    let query: string = ``;
    // format where
    let where: string = ``;
    // make query
    for (let i = 0; i < columns.length; i++) {
      query += columns[i];
      query += '=?';
      // when not last
      if (i < columns.length - 1) {
        query += ',';
      }
    }
    // make query
    for (let j = 0; j < conditions.length; j++) {
      where += conditions[j];
      where += '=?';
      // when not last
      if (j < conditions.length - 1) {
        where += ' AND ';;
      }
    }
    SQLite.logger.silly(`sqlite: UPDATE ${SQLite.table} SET ${query} WHERE ${where}`);
    // query
    const updateQuery: any = SQLite.database.prepare(`
      UPDATE ${SQLite.table} SET ${query} WHERE ${where}
    `);
    //  execute
    updateQuery.run(...values, ...wheres);
  }

  // insert to DB
  insertDB(values: any) {
    SQLite.logger.debug('sqlite: insertDB mode');
    // columns
    const columnsStr: string = SQLite.columns.join(',');
    // placeholders
    const placeStr: string = '?, '.repeat(SQLite.columns.length - 1) + '?';
    SQLite.logger.silly(`sqlite: INSERT INTO ${SQLite.table} (${columnsStr}) VALUES (${placeStr})`);
    // query
    const insertQuery: any = SQLite.database.prepare(`
      INSERT INTO ${SQLite.table} (${columnsStr}) VALUES (${placeStr})
    `);
    // do insert
    insertQuery.run(...values);
  }
}

// export module
export default SQLite;

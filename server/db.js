import sqlite3 from 'sqlite3';

// connect to sqlite db
const db = new sqlite3.Database('./last-race.db', (err) => {
  if (err) {
    console.error('error connecting to db:', err.message);
    throw err;
  }
  console.log('connected to sqlite db');
});

export default db;
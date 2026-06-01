import db from './db.js';

// get all stations
export const getStations = () => {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM Stations', [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

// get all lines
export const getLines = () => {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM Lines', [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

// get all connections
export const getConnections = () => {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM Connections', [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

// get all events
export const getEvents = () => {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM Events', [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

// get user by username and password
export const getUser = (username, password) => {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM Users WHERE username = ? AND password = ?', [username, password], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};
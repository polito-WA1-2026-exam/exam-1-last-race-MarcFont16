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
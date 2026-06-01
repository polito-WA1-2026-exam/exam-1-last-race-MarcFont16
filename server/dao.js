import db from './db.js';
import crypto from 'crypto';

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

// get user by username and password (with salt and hash)
export const getUser = (username, password) => {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM Users WHERE username = ?', [username], (err, row) => {
      if (err) {
        reject(err);
      } else if (!row) {
        resolve(null); // user not found
      } else {
        // hash the incoming password with the stored salt
        crypto.scrypt(password, row.salt, 32, (err, derivedKey) => {
          if (err) reject(err);
          
          const hash = derivedKey.toString('hex');
          if (hash === row.password) {
            resolve(row); // password matches
          } else {
            resolve(null); // invalid password
          }
        });
      }
    });
  });
};
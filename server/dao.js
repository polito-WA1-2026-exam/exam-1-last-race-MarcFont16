import db from './db.js';
import crypto from 'crypto';

// get all stations with their respective line_id via connections
export const getStations = () => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT DISTINCT S.*, C.line_id 
      FROM Stations S
      JOIN Connections C ON S.id = C.station_from_id OR S.id = C.station_to_id
    `;
    db.all(sql, [], (err, rows) => {
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
        resolve(null);
      } else {
        crypto.scrypt(password, row.salt, 32, (err, derivedKey) => {
          if (err) reject(err);
          
          const hash = derivedKey.toString('hex');
          if (hash === row.password) {
            resolve(row);
          } else {
            resolve(null);
          }
        });
      }
    });
  });
};

// get top 10 scores resolving ties correctly
export const getRanking = () => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT u.username, g.score as max_score, g.time_left
      FROM Users u
      JOIN Games g ON u.id = g.user_id
      WHERE g.id = (
        SELECT id 
        FROM Games g2 
        WHERE g2.user_id = u.id 
        ORDER BY score DESC, time_left DESC 
        LIMIT 1
      )
      ORDER BY max_score DESC, g.time_left DESC
      LIMIT 10
    `;
    db.all(sql, [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

// save finished game
export const saveGame = (userId, startStationId, endStationId, score, timeLeft) => {
  return new Promise((resolve, reject) => {
    const sql = `INSERT INTO Games (user_id, start_station_id, end_station_id, score, time_left) VALUES (?, ?, ?, ?, ?)`;
    
    // use regular 'function' because it allows access to this.lastID to return the newly inserted game's id
    db.run(sql, [userId, startStationId, endStationId, score, timeLeft], function(err) {
      if (err) reject(err);
      else resolve(this.lastID);
    });
  });
};
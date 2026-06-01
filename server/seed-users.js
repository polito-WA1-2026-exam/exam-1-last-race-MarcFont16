import db from './db.js';
import crypto from 'crypto';

const users = [
  { username: 'marcfont', password: 'password123' },
  { username: 'professor', password: 'password123' },
  { username: 'guest', password: 'password123' }
];

db.serialize(() => {
  users.forEach((user) => {
    const salt = crypto.randomBytes(16).toString('hex');
    
    crypto.scrypt(user.password, salt, 32, (err, derivedKey) => {
      if (err) throw err;
      const hash = derivedKey.toString('hex');
      
      db.run(
        'INSERT INTO Users (username, password, salt) VALUES (?, ?, ?)',
        [user.username, hash, salt],
        (err) => {
          if (err) console.error(`Error inserting ${user.username}:`, err);
          else console.log(`User ${user.username} securely inserted.`);
        }
      );
    });
  });
});
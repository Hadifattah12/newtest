// Updated db/database.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DBSOURCE = path.join(__dirname, 'db.sqlite');

const db = new sqlite3.Database(DBSOURCE, (err) => {
  if (err) {
    console.error('Could not connect to database', err);
  } else {
    console.log('Connected to SQLite database');
    
    // Create friends table
  db.run(`CREATE TABLE IF NOT EXISTS friends (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    friend_id INTEGER NOT NULL,
    status TEXT DEFAULT 'pending', -- 'pending', 'accepted'
    UNIQUE(user_id, friend_id)
  )`, (err) => {
    if (err) {
      console.error('Error creating friends table:', err);
    } else {
      console.log('Friends table ready');
    }
  });


    // Create users table if it doesn't exist
    db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    avatar TEXT DEFAULT '/uploads/default-avatar.png',
    is_verified BOOLEAN DEFAULT 0,
    is2FAEnabled BOOLEAN DEFAULT 0,
    verification_token TEXT,
    twofa_code TEXT,
    twofa_expiry DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
      if (err) {
        console.error('Error creating users table:', err);
      } else {
        console.log('Users table ready');
        
        // Add new columns if they don't exist (for existing databases)
        db.run(`ALTER TABLE users ADD COLUMN twofa_code TEXT`, (err) => {
          if (err && !err.message.includes('duplicate column')) {
            console.error('Error adding twofa_code column:', err);
          }
        });
        
        db.run(`ALTER TABLE users ADD COLUMN twofa_expiry DATETIME`, (err) => {
          if (err && !err.message.includes('duplicate column')) {
            console.error('Error adding twofa_expiry column:', err);
          }
        });
      }
    });
  }
});

// Graceful shutdown
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err);
    } else {
      console.log('Database connection closed.');
    }
    process.exit(0);
  });
});

module.exports = db;
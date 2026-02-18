const pool = require('./db.js');

async function getUsersService() {
  const [rows] = await pool.query('SELECT id, name, email FROM User');
  return rows;
}

async function createUserService(name, email, passwordHash) {
  const [result] = await pool.query(
    'INSERT INTO User (id, name, email, password) VALUES (UUID(), ?, ?, ?)',
    [name, email, passwordHash]
  );
  return { id: result.insertId, name, email };
}

async function getUserByEmail(email) {
  const [rows] = await pool.query('SELECT * FROM User WHERE email = ?', [email]);
  return rows[0];
}

module.exports = { getUsersService, createUserService, getUserByEmail };

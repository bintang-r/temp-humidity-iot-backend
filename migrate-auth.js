const { pool } = require('./config/db');
const bcrypt = require('bcryptjs');

async function migrateAuth() {
  try {
    // Buat tabel users
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Tabel users dibuat/diperiksa.');

    // Cek apakah ada admin
    const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', ['admin']);
    if (rows.length === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await pool.query('INSERT INTO users (username, password) VALUES (?, ?)', ['admin', hashedPassword]);
      console.log('Akun default (admin/admin123) berhasil dibuat.');
    } else {
      console.log('Akun admin sudah ada.');
    }
  } catch (error) {
    console.error('Error migrasi auth:', error);
  }
  process.exit();
}

migrateAuth();

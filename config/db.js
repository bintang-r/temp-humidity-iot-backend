const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function initDB() {
  try {
    // Test koneksi
    const connection = await pool.getConnection();

    console.log('Connected to MySQL successfully');
    console.log(`Database: ${process.env.DB_DATABASE}`);

    // Tabel devices
    await connection.query(`
      CREATE TABLE IF NOT EXISTS devices (
        id INT AUTO_INCREMENT PRIMARY KEY,
        device_name VARCHAR(255) NOT NULL,
        api_token VARCHAR(255) UNIQUE NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabel sensor_logs
    await connection.query(`
      CREATE TABLE IF NOT EXISTS sensor_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        device_id INT NOT NULL,
        temperature DECIMAL(5,2) NOT NULL,
        humidity DECIMAL(5,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE
      )
    `);

    // Tabel users
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Cek apakah ada admin
    const [rows] = await connection.query('SELECT * FROM users WHERE username = ?', ['admin']);
    if (rows.length === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await connection.query('INSERT INTO users (username, password) VALUES (?, ?)', ['admin', hashedPassword]);
      console.log('Akun default (admin/admin123) berhasil dibuat.');
    } else {
      console.log('Akun admin sudah ada.');
    }

    // Tabel sensor_settings
    await connection.query(`
      CREATE TABLE IF NOT EXISTS sensor_settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        max_temp DECIMAL(5,2) NOT NULL DEFAULT 35.00,
        min_temp DECIMAL(5,2) NOT NULL DEFAULT 20.00,
        max_hum DECIMAL(5,2) NOT NULL DEFAULT 80.00,
        min_hum DECIMAL(5,2) NOT NULL DEFAULT 40.00,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Insert default settings if empty
    const [settingRows] = await connection.query('SELECT * FROM sensor_settings');
    if (settingRows.length === 0) {
      await connection.query('INSERT INTO sensor_settings (max_temp, min_temp, max_hum, min_hum) VALUES (?, ?, ?, ?)', [35.00, 20.00, 80.00, 40.00]);
      console.log('Pengaturan default sensor berhasil dibuat.');
    } else {
      console.log('Pengaturan sensor sudah ada.');
    }

    connection.release();

    console.log('Database and tables initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

module.exports = {
  pool,
  initDB
};
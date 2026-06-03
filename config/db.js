const mysql = require('mysql2/promise');
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
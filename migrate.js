const { pool } = require('./config/db');

async function migrate() {
  try {
    await pool.query('ALTER TABLE devices ADD COLUMN is_active BOOLEAN DEFAULT TRUE');
    console.log('Column is_active added');
  } catch (e) {
    if (e.code === 'ER_DUP_FIELDNAME') {
      console.log('Column is_active already exists');
    } else {
      console.error(e);
    }
  }
  process.exit();
}

migrate();

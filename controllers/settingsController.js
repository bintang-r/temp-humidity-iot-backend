const { pool } = require('../config/db');

exports.getSettings = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM sensor_settings LIMIT 1');
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Settings not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const { max_temp, min_temp, max_hum, min_hum } = req.body;
    
    // Validate inputs
    if (max_temp == null || min_temp == null || max_hum == null || min_hum == null) {
      return res.status(400).json({ message: 'All limits must be provided' });
    }

    await pool.query(
      'UPDATE sensor_settings SET max_temp = ?, min_temp = ?, max_hum = ?, min_hum = ?',
      [max_temp, min_temp, max_hum, min_hum]
    );
    
    const [rows] = await pool.query('SELECT * FROM sensor_settings LIMIT 1');
    res.json({ message: 'Settings updated successfully', settings: rows[0] });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

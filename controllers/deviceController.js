const { pool } = require('../config/db');
const crypto = require('crypto');

exports.getAllDevices = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, device_name, api_token, created_at FROM devices ORDER BY id DESC');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.createDevice = async (req, res) => {
  try {
    const { device_name } = req.body;
    if (!device_name) {
      return res.status(400).json({ message: 'device_name is required' });
    }

    // Generate a random 32-character hex token
    const api_token = crypto.randomBytes(16).toString('hex');

    const [result] = await pool.query('INSERT INTO devices (device_name, api_token) VALUES (?, ?)', [device_name, api_token]);
    
    res.status(201).json({
      message: 'Device created successfully',
      device: {
        id: result.insertId,
        device_name,
        api_token
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.deleteDevice = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM devices WHERE id = ?', [id]);
    res.json({ message: 'Device deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

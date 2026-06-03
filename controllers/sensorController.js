const { pool } = require('../config/db');

exports.ingestData = async (req, res) => {
  try {
    const { api_token, temperature, humidity } = req.body;

    if (!api_token || temperature === undefined || humidity === undefined) {
      return res.status(400).json({ message: 'api_token, temperature, and humidity are required' });
    }

    // Validate token and get device
    const [devices] = await pool.query('SELECT id, device_name, is_active FROM devices WHERE api_token = ?', [api_token]);
    
    if (devices.length === 0) {
      return res.status(401).json({ message: 'Invalid API Token' });
    }

    const device = devices[0];
    
    if (!device.is_active) {
      return res.status(403).json({ message: 'Device is blocked/inactive' });
    }

    // Insert log
    const [result] = await pool.query(
      'INSERT INTO sensor_logs (device_id, temperature, humidity) VALUES (?, ?, ?)',
      [device.id, temperature, humidity]
    );

    const newLog = {
      id: result.insertId,
      device_id: device.id,
      device_name: device.device_name,
      temperature,
      humidity,
      created_at: new Date().toISOString()
    };

    // Emit event to socket.io
    const io = req.app.get('socketio');
    if (io) {
      io.emit('new_sensor_data', newLog);
    }

    res.status(201).json({ message: 'Data logged successfully', data: newLog });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const page  = parseInt(req.query.page)  || 1;
    const offset = (page - 1) * limit;
    const deviceId = req.query.device_id ? parseInt(req.query.device_id) : null;

    let dataQuery, countQuery, dataParams, countParams;

    if (deviceId) {
      countQuery  = `SELECT COUNT(*) as total FROM sensor_logs WHERE device_id = ?`;
      countParams = [deviceId];
      dataQuery   = `
        SELECT sl.id, sl.device_id, d.device_name, sl.temperature, sl.humidity, sl.created_at
        FROM sensor_logs sl
        JOIN devices d ON sl.device_id = d.id
        WHERE sl.device_id = ?
        ORDER BY sl.id DESC
        LIMIT ? OFFSET ?
      `;
      dataParams = [deviceId, limit, offset];
    } else {
      countQuery  = `SELECT COUNT(*) as total FROM sensor_logs`;
      countParams = [];
      dataQuery   = `
        SELECT sl.id, sl.device_id, d.device_name, sl.temperature, sl.humidity, sl.created_at
        FROM sensor_logs sl
        JOIN devices d ON sl.device_id = d.id
        ORDER BY sl.id DESC
        LIMIT ? OFFSET ?
      `;
      dataParams = [limit, offset];
    }

    const [[{ total }]] = await pool.query(countQuery, countParams);
    const [rows] = await pool.query(dataQuery, dataParams);

    res.json({
      data: rows,       // Newest first (DESC)
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    // Get latest log for each device
    const [latestLogs] = await pool.query(`
      SELECT sl1.device_id, d.device_name, sl1.temperature, sl1.humidity, sl1.created_at 
      FROM sensor_logs sl1
      JOIN (
          SELECT device_id, MAX(id) as max_id 
          FROM sensor_logs 
          GROUP BY device_id
      ) sl2 ON sl1.device_id = sl2.device_id AND sl1.id = sl2.max_id
      JOIN devices d ON sl1.device_id = d.id
    `);

    // Get active devices count
    const [deviceCount] = await pool.query('SELECT COUNT(*) as total FROM devices');

    res.json({
      latest_readings: latestLogs,
      total_devices: deviceCount[0].total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getLatestByDevice = async (req, res) => {
  try {
    const deviceId = parseInt(req.params.device_id);
    if (!deviceId) return res.status(400).json({ message: 'device_id is required' });

    const [rows] = await pool.query(`
      SELECT sl.id, sl.device_id, d.device_name, sl.temperature, sl.humidity, sl.created_at
      FROM sensor_logs sl
      JOIN devices d ON sl.device_id = d.id
      WHERE sl.device_id = ?
      ORDER BY sl.id DESC
      LIMIT 1
    `, [deviceId]);

    if (rows.length === 0) {
      return res.json(null);
    }
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

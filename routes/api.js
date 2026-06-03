const express = require('express');
const router = express.Router();
const deviceController = require('../controllers/deviceController');
const sensorController = require('../controllers/sensorController');
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// Auth Routes
router.post('/auth/login', authController.login);
router.put('/auth/account', authMiddleware, authController.updateAccount);

// Devices Routes (Protected)
router.get('/devices', authMiddleware, deviceController.getAllDevices);
router.post('/devices', authMiddleware, deviceController.createDevice);
router.delete('/devices/:id', authMiddleware, deviceController.deleteDevice);
router.put('/devices/:id/toggle', authMiddleware, deviceController.toggleDeviceStatus);

// Sensor Data Routes
// Ingest is public but requires API Token in the body
router.post('/sensor/data', sensorController.ingestData);

// Dashboard routes (Protected)
router.get('/sensor/history', authMiddleware, sensorController.getHistory);
router.get('/sensor/dashboard', authMiddleware, sensorController.getDashboardStats);
router.get('/sensor/latest/:device_id', authMiddleware, sensorController.getLatestByDevice);

module.exports = router;

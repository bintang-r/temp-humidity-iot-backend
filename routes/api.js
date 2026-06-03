const express = require('express');
const router = express.Router();
const deviceController = require('../controllers/deviceController');
const sensorController = require('../controllers/sensorController');

// Devices Routes
router.get('/devices', deviceController.getAllDevices);
router.post('/devices', deviceController.createDevice);
router.delete('/devices/:id', deviceController.deleteDevice);

// Sensor Data Routes
router.post('/sensor/data', sensorController.ingestData);
router.get('/sensor/history', sensorController.getHistory);
router.get('/sensor/dashboard', sensorController.getDashboardStats);

module.exports = router;

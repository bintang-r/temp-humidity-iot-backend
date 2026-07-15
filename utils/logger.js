const fs = require('fs');
const path = require('path');

const logFilePath = path.join(__dirname, '../error.log');

const logError = (source, errorInfo) => {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${source}] ${typeof errorInfo === 'string' ? errorInfo : JSON.stringify(errorInfo)}\n`;
    
    fs.appendFile(logFilePath, logMessage, (err) => {
        if (err) {
            console.error('Failed to write to log file:', err);
        }
    });
};

module.exports = {
    logError
};

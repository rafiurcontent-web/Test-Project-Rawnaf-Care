const { createLogger, format, transports } = require('winston');

const { combine, colorize, timestamp, printf } = format;

const customFormat = printf(({ level, message, timestamp }) => {
  return `[${timestamp}] ${level}: ${message}`;
});

const logger = createLogger({
  level: 'info',
  format: combine(
    colorize(),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    customFormat
  ),
  transports: [
    new transports.Console({
      stderrLevels: ['error', 'warn']
    })
  ]
});

module.exports = logger;

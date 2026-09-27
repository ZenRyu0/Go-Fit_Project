import * as winston from 'winston';

const isDev = process.env.NODE_ENV !== 'production';

const customFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let metaStr = '';
    if (Object.keys(meta).length > 0) {
      metaStr = JSON.stringify(meta);
    }
    return `${timestamp} [${level.toUpperCase()}] ${message} ${metaStr}`;
  }),
);

const consoleTransport = new winston.transports.Console({
  format: winston.format.combine(
    winston.format.colorize(),
    customFormat,
  ),
});

export const logger = winston.createLogger({
  level: isDev ? 'debug' : 'info',
  format: customFormat,
  transports: [consoleTransport],
  exceptionHandlers: [consoleTransport],
});
const { createLogger, format, transports } = require('winston');
const { combine, timestamp, colorize, printf, json, errors } = format;

const isDev = process.env.NODE_ENV !== 'production';

/**
 * Production-grade structured logger.
 * - Development: human-readable colorized console output
 * - Production:  JSON lines to stdout (compatible with Render, Railway, GCP logging)
 */
const logger = createLogger({
    level: isDev ? 'debug' : 'info',
    format: isDev
        ? combine(
            colorize({ all: true }),
            timestamp({ format: 'HH:mm:ss' }),
            errors({ stack: true }),
            printf(({ level, message, timestamp, stack }) =>
                `${timestamp} [${level}]: ${stack || message}`
            )
        )
        : combine(
            timestamp(),
            errors({ stack: true }),
            json()
        ),
    transports: [new transports.Console()],
    exitOnError: false,
});

// Convenience wrappers matching console.* signatures
logger.stream = {
    write: (message) => logger.info(message.trim()),
};

module.exports = logger;

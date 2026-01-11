/**
 * API Logger
 */

import pino from 'pino';
import { nanoid } from 'nanoid';

// Generate unique tracking ID for request
export const generateTrackingId = () => nanoid(8);

// Sanitize sensitive data from objects (this is a failsafe, not a replacement for proper security practices)
const sanitizeData = (data) => {
  if (!data || typeof data !== 'object') return data;
  
  const sensitiveKeys = [
    'password', 'token', 'secret', 'key', 'auth', 'authorization',
    'access_token', 'refresh_token', 'client_secret', 'api_key',
    'bearer', 'credential', 'auth_token', 'session_token'
  ];
  
  const sanitized = Array.isArray(data) ? [...data] : { ...data };
  
  const recursiveSanitize = (obj) => {
    if (Array.isArray(obj)) {
      return obj.map(item => recursiveSanitize(item));
    }
    
    if (obj && typeof obj === 'object') {
      const sanitizedObj = {};
      for (const [key, value] of Object.entries(obj)) {
        const keyLower = key.toLowerCase();
        const isSensitive = sensitiveKeys.some(sensitive => keyLower.includes(sensitive));
        
        if (isSensitive) {
          sanitizedObj[key] = '[REDACTED]';
        } else if (typeof value === 'object') {
          sanitizedObj[key] = recursiveSanitize(value);
        } else {
          sanitizedObj[key] = value;
        }
      }
      return sanitizedObj;
    }
    
    return obj;
  };
  
  return recursiveSanitize(sanitized);
};

// Create Pino logger configuration
const createPinoLogger = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const logLevel = process.env.LOG_LEVEL?.toLowerCase() || 'info';

  const baseConfig = {
    level: logLevel,
    base: {
      env: process.env.NODE_ENV,
      ...(process.env.VERCEL_URL && { vercelUrl: process.env.VERCEL_URL }),
      ...(process.env.VERCEL_ENV && { vercelEnv: process.env.VERCEL_ENV })
    },
    timestamp: pino.stdTimeFunctions.isoTime,
    formatters: {
      level: (label) => {
        return { level: label.toUpperCase() };
      }
    },
    serializers: {
      // Custom serializer to sanitize sensitive data
      req: (req) => {
        if (!req) return req;
        return sanitizeData({
          method: req.method,
          url: req.url,
          headers: req.headers,
          remoteAddress: req.remoteAddress,
          remotePort: req.remotePort
        });
      },
      res: (res) => {
        if (!res) return res;
        return {
          statusCode: res.statusCode,
          headers: sanitizeData(res.headers)
        };
      },
      err: pino.stdSerializers.err
    }
  };

  // In development, use pretty printer for better readability
  if (!isProduction) {
    return pino({
      ...baseConfig,
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname'
        }
      }
    });
  }

  // In production, use JSON format for structured logging
  return pino(baseConfig);
};

// Create the base logger instance
const baseLogger = createPinoLogger();

// Logger class for request-scoped logging with tracking IDs
export class Logger {
  constructor(trackingId = null, context = {}) {
    this.trackingId = trackingId || generateTrackingId();
    this.context = sanitizeData(context);
    
    // Create child logger with tracking ID and context
    this.logger = baseLogger.child({
      trackingId: this.trackingId,
      ...this.context
    });
  }
  
  // Create child logger with additional context
  child(additionalContext = {}) {
    return new Logger(this.trackingId, { ...this.context, ...additionalContext });
  }
  
  debug(message, metadata = {}) {
    this.logger.debug(sanitizeData(metadata), message);
    return this;
  }
  
  info(message, metadata = {}) {
    this.logger.info(sanitizeData(metadata), message);
    return this;
  }
  
  warn(message, metadata = {}) {
    this.logger.warn(sanitizeData(metadata), message);
    return this;
  }
  
  error(message, metadata = {}) {
    this.logger.error(sanitizeData(metadata), message);
    return this;
  }
  
  fatal(message, metadata = {}) {
    this.logger.fatal(sanitizeData(metadata), message);
    return this;
  }
}

// Factory function for creating request loggers
export const createLogger = (context = {}) => {
  return new Logger(null, context);
};

// Express/Next.js middleware helper to extract request info
export const getRequestMetadata = (request) => {
  const url = request.url || request.nextUrl?.pathname;
  const method = request.method;
  const userAgent = request.headers?.get?.('user-agent') || request.headers?.['user-agent'];
  const ip = request.headers?.get?.('x-forwarded-for') || 
             request.headers?.get?.('x-real-ip') || 
             request.headers?.['x-forwarded-for'] ||
             request.ip;
  
  return {
    url,
    method,
    userAgent,
    ip: ip?.split(',')[0]?.trim(), // Get first IP if multiple
  };
};

// Default logger instance
export const logger = createLogger();

export default Logger;
import { RequestHandler } from 'express';
import { logger } from './logger';
import { randomUUID } from 'crypto';

export const logRequests: RequestHandler = (req, res, next) => {
  const requestId = req.headers['X-Request-ID'] as string || randomUUID();
  logger.info(`Incoming request: ${requestId} ${req.method} ${req.url} ${['POST', 'PUT'].includes(req.method) ? `\nBody: ${JSON.stringify(req.body)}` : ''}`);
  res.set('X-Request-ID', requestId);
  next();
}
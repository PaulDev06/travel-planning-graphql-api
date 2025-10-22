import express from 'express';
import { logger } from '@/utils/logger.js';
import { randomUUID } from 'crypto';

export function contextMiddleware(req: express.Request, res: express.Response, next: express.NextFunction) {
  req.id = randomUUID();
  res.setHeader('X-Request-ID', req.id);
  
  logger.info('Request received', {
    requestId: req.id,
    method: req.method,
    path: req.path
  });
  
  next();
}
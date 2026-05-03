import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';

export interface AuthPayload {
  athleteId: string;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      athlete?: AuthPayload;
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid authorization header' });
    return;
  }

  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, config.jwt.secret) as AuthPayload;
    req.athlete = payload;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export function signToken(payload: AuthPayload): string {
  const expiresInSeconds = parseExpiresIn(config.jwt.expiresIn);
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: expiresInSeconds,
  });
}

/** Parse duration strings like "7d", "24h", "60m" into seconds */
function parseExpiresIn(value: string): number {
  const match = value.match(/^(\d+)([dhms])$/);
  if (!match) return 604800; // default 7 days
  const num = parseInt(match[1], 10);
  switch (match[2]) {
    case 'd': return num * 86400;
    case 'h': return num * 3600;
    case 'm': return num * 60;
    case 's': return num;
    default: return 604800;
  }
}

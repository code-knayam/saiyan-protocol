import fs from 'fs';
import path from 'path';

type Level = 'debug' | 'info' | 'warn' | 'error';

const LOGS_DIR = path.join(process.cwd(), 'logs');

const COLORS: Record<Level, string> = {
  debug: '\x1b[36m', // cyan
  info:  '\x1b[32m', // green
  warn:  '\x1b[33m', // yellow
  error: '\x1b[31m', // red
};
const RESET = '\x1b[0m';

function ensureLogsDir() {
  if (!fs.existsSync(LOGS_DIR)) fs.mkdirSync(LOGS_DIR, { recursive: true });
}

function datestamp() {
  return new Date().toISOString().slice(0, 10);
}

function format(level: Level, message: string, meta?: Record<string, unknown>): string {
  const ts = new Date().toISOString();
  const metaStr = meta && Object.keys(meta).length > 0 ? ' ' + JSON.stringify(meta) : '';
  return `[${ts}] [${level.toUpperCase().padEnd(5)}] ${message}${metaStr}`;
}

function write(level: Level, message: string, meta?: Record<string, unknown>) {
  const line = format(level, message, meta);

  // Console — coloured
  const color = COLORS[level];
  const consoleFn = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;
  consoleFn(`${color}${line}${RESET}`);

  // File — always write to daily app log
  try {
    ensureLogsDir();
    fs.appendFileSync(path.join(LOGS_DIR, `app-${datestamp()}.log`), line + '\n');

    // Errors and warnings also go to dedicated error log
    if (level === 'error' || level === 'warn') {
      fs.appendFileSync(path.join(LOGS_DIR, `error-${datestamp()}.log`), line + '\n');
    }
  } catch {
    // Never let logging crash the app
  }
}

export const logger = {
  debug: (msg: string, meta?: Record<string, unknown>) => write('debug', msg, meta),
  info:  (msg: string, meta?: Record<string, unknown>) => write('info',  msg, meta),
  warn:  (msg: string, meta?: Record<string, unknown>) => write('warn',  msg, meta),
  error: (msg: string, meta?: Record<string, unknown>) => write('error', msg, meta),
};

// ─── Express request logger middleware ───
import type { Request, Response, NextFunction } from 'express';

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  const { method, path: reqPath, ip } = req;

  res.on('finish', () => {
    const ms = Date.now() - start;
    const level: Level = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';
    logger[level](`${method} ${reqPath}`, { status: res.statusCode, ms, ip });
  });

  next();
}

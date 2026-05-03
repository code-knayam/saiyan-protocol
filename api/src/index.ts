import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import { closePool } from './db/pool.js';
import { logger, requestLogger } from './utils/logger.js';
import authRoutes from './routes/auth.js';
import athleteRoutes from './routes/athlete.js';
import workoutRoutes from './routes/workouts.js';
import logRoutes from './routes/logs.js';

const app = express();

// ═══════════════════════════════════
// Middleware
// ═══════════════════════════════════
app.use(cors());
app.use(express.json());
app.use(requestLogger);

// ═══════════════════════════════════
// Routes
// ═══════════════════════════════════
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/auth', authRoutes);
app.use('/athlete', athleteRoutes);
app.use('/workouts', workoutRoutes);
app.use('/logs', logRoutes);

// ═══════════════════════════════════
// Start
// ═══════════════════════════════════
const server = app.listen(config.port, () => {
  logger.info(`API started on port ${config.port}`, { env: config.nodeEnv, ai: config.ai.provider });
});

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(signal, async () => {
    logger.info(`${signal} received — shutting down`);
    server.close();
    await closePool();
    process.exit(0);
  });
}

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled rejection', { reason: String(reason) });
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught exception', { message: err.message, stack: err.stack });
  process.exit(1);
});

import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import { closePool } from './db/pool.js';
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
  console.log(`⚡ Saiyan Protocol API running on port ${config.port}`);
  console.log(`   Environment: ${config.nodeEnv}`);
  console.log(`   AI Provider: ${config.ai.provider}`);
});

// Graceful shutdown
for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(signal, async () => {
    console.log(`\n🛑 ${signal} received — shutting down...`);
    server.close();
    await closePool();
    process.exit(0);
  });
}

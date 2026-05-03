import { Router, type Router as RouterType } from 'express';
import { z } from 'zod';
import { pool } from '../db/pool.js';
import { authenticate } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';
import { generateAndPersistScheduleForAthlete } from './workouts.js';

const ATHLETE_FIELDS = `id, email, name, picture_url, age, height, weight, power_level,
  current_block, current_week, total_sessions_completed, streak_days, five_km_time,
  fitness_experience, training_goal, selected_goals, onboarded, plan_intro_seen`;

const router: RouterType = Router();
router.use(authenticate);

// ═══════════════════════════════════
// GET /athlete
// ═══════════════════════════════════
router.get('/', async (req, res) => {
  const athleteId = req.athlete!.athleteId;
  logger.debug('GET /athlete', { athleteId });
  const t0 = Date.now();

  try {
    const result = await pool.query(
      `SELECT ${ATHLETE_FIELDS} FROM athletes WHERE id = $1`,
      [athleteId],
    );

    if (result.rows.length === 0) {
      logger.warn('Athlete not found', { athleteId });
      res.status(404).json({ error: 'Athlete not found' });
      return;
    }

    logger.debug('GET /athlete ok', { athleteId, ms: Date.now() - t0 });
    res.json(result.rows[0]);
  } catch (err: any) {
    logger.error('GET /athlete failed', { athleteId, message: err.message, ms: Date.now() - t0 });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ═══════════════════════════════════
// PATCH /athlete
// ═══════════════════════════════════
const updateSchema = z.object({
  name: z.string().min(1).optional(),
  age: z.number().int().min(10).max(100).optional(),
  height: z.string().optional(),
  weight: z.string().optional(),
  fiveKmTime: z.string().optional(),
  fitnessExperience: z.string().max(2000).optional(),
  trainingGoal: z.string().max(1000).optional(),
  selectedGoals: z.array(z.string()).max(3).optional(),
  onboarded: z.boolean().optional(),
  planIntroSeen: z.boolean().optional(),
}).strict();

router.patch('/', async (req, res) => {
  const athleteId = req.athlete!.athleteId;
  const t0 = Date.now();

  try {
    const body = updateSchema.parse(req.body);
    logger.debug('PATCH /athlete', { athleteId, fields: Object.keys(body) });

    const fieldMap: Record<string, string> = {
      name: 'name',
      age: 'age',
      height: 'height',
      weight: 'weight',
      fiveKmTime: 'five_km_time',
      fitnessExperience: 'fitness_experience',
      trainingGoal: 'training_goal',
      selectedGoals: 'selected_goals',
      onboarded: 'onboarded',
      planIntroSeen: 'plan_intro_seen',
    };

    const setClauses: string[] = ['updated_at = NOW()'];
    const values: unknown[] = [];
    let paramIdx = 1;

    for (const [key, col] of Object.entries(fieldMap)) {
      if (key in body) {
        setClauses.push(`${col} = $${paramIdx}`);
        const val = (body as any)[key];
        values.push(key === 'selectedGoals' ? JSON.stringify(val) : val);
        paramIdx++;
      }
    }

    values.push(athleteId);

    const result = await pool.query(
      `UPDATE athletes SET ${setClauses.join(', ')}
       WHERE id = $${paramIdx}
       RETURNING ${ATHLETE_FIELDS}`,
      values,
    );

    // Fire schedule generation in background when onboarding completes — do not block response
    if (body.onboarded === true) {
      const check = await pool.query(
        `SELECT COUNT(*) FROM week_schedules WHERE athlete_id = $1`,
        [athleteId],
      );
      if (parseInt(check.rows[0].count, 10) === 0) {
        logger.info('Onboarding complete — firing background schedule generation', { athleteId });
        generateAndPersistScheduleForAthlete(athleteId).catch((err: any) => {
          logger.error('Background schedule generation failed', { athleteId, message: err.message });
        });
      }
    }

    logger.debug('PATCH /athlete ok', { athleteId, ms: Date.now() - t0 });
    res.json(result.rows[0]);
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      logger.warn('PATCH /athlete validation failed', { athleteId, errors: err.errors });
      res.status(400).json({ error: 'Validation failed', details: err.errors });
      return;
    }
    logger.error('PATCH /athlete failed', { athleteId, message: err.message, ms: Date.now() - t0 });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ═══════════════════════════════════
// POST /athlete/reset-progress
// ═══════════════════════════════════
router.post('/reset-progress', async (req, res) => {
  const athleteId = req.athlete!.athleteId;
  logger.info('Reset progress', { athleteId });

  try {
    const result = await pool.query(
      `UPDATE athletes
       SET power_level = 1000, current_block = 1, current_week = 1,
           total_sessions_completed = 0, streak_days = 0, updated_at = NOW()
       WHERE id = $1
       RETURNING ${ATHLETE_FIELDS}`,
      [athleteId],
    );

    res.json(result.rows[0]);
  } catch (err: any) {
    logger.error('Reset progress failed', { athleteId, message: err.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

import { Router, type Router as RouterType } from 'express';
import { z } from 'zod';
import { pool } from '../db/pool.js';
import { authenticate } from '../middleware/auth.js';
import { generateAndPersistScheduleForAthlete } from './workouts.js';

const ATHLETE_FIELDS = `id, email, name, picture_url, age, height, weight, power_level,
  current_block, current_week, total_sessions_completed, streak_days, five_km_time,
  fitness_experience, training_goal, selected_goals, onboarded, plan_intro_seen`;

const router: RouterType = Router();
router.use(authenticate);

// ═══════════════════════════════════
// GET /athlete — current athlete profile
// ═══════════════════════════════════
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT ${ATHLETE_FIELDS} FROM athletes WHERE id = $1`,
      [req.athlete!.athleteId],
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Athlete not found' });
      return;
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Get athlete error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ═══════════════════════════════════
// PATCH /athlete — update profile
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
  try {
    const body = updateSchema.parse(req.body);

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

    values.push(req.athlete!.athleteId);

    // Check if we need to generate a schedule after saving (new onboarding completion)
    let shouldGenerate = false;
    if (body.onboarded === true) {
      const scheduleCheck = await pool.query(
        `SELECT COUNT(*) FROM week_schedules WHERE athlete_id = $1`,
        [req.athlete!.athleteId],
      );
      shouldGenerate = parseInt(scheduleCheck.rows[0].count, 10) === 0;
    }

    const result = await pool.query(
      `UPDATE athletes SET ${setClauses.join(', ')}
       WHERE id = $${paramIdx}
       RETURNING ${ATHLETE_FIELDS}`,
      values,
    );

    if (shouldGenerate) {
      await generateAndPersistScheduleForAthlete(req.athlete!.athleteId);
    }

    res.json(result.rows[0]);
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation failed', details: err.errors });
      return;
    }
    console.error('Update athlete error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ═══════════════════════════════════
// POST /athlete/reset-progress
// ═══════════════════════════════════
router.post('/reset-progress', async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE athletes
       SET power_level = 1000, current_block = 1, current_week = 1,
           total_sessions_completed = 0, streak_days = 0, updated_at = NOW()
       WHERE id = $1
       RETURNING ${ATHLETE_FIELDS}`,
      [req.athlete!.athleteId],
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Reset progress error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

import { Router, type Router as RouterType } from 'express';
import { z } from 'zod';
import { pool } from '../db/pool.js';
import { authenticate } from '../middleware/auth.js';

const router: RouterType = Router();
router.use(authenticate);

// ═══════════════════════════════════
// GET /logs — list session logs for the athlete
// ═══════════════════════════════════
router.get('/', async (req, res) => {
  try {
    const athleteId = req.athlete!.athleteId;
    const limit = Math.min(parseInt(req.query.limit as string, 10) || 20, 100);
    const offset = parseInt(req.query.offset as string, 10) || 0;

    const result = await pool.query(
      `SELECT sl.*, w.title as workout_title, w.type as workout_type, w.day
       FROM session_logs sl
       JOIN workouts w ON w.id = sl.workout_id
       WHERE sl.athlete_id = $1
       ORDER BY sl.date DESC
       LIMIT $2 OFFSET $3`,
      [athleteId, limit, offset],
    );

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM session_logs WHERE athlete_id = $1`,
      [athleteId],
    );

    res.json({
      logs: result.rows,
      total: parseInt(countResult.rows[0].count, 10),
      limit,
      offset,
    });
  } catch (err) {
    console.error('Get logs error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ═══════════════════════════════════
// POST /logs — create a session log
// ═══════════════════════════════════
const setLogSchema = z.object({
  setNumber: z.number().int().min(1),
  reps: z.number().int().nullable(),
  weight: z.number().nullable(),
  timeSeconds: z.number().int().nullable(),
  completed: z.boolean(),
});

const exerciseLogSchema = z.object({
  exerciseId: z.string().uuid(),
  exerciseName: z.string(),
  notes: z.string().optional().default(''),
  completed: z.boolean(),
  sets: z.array(setLogSchema),
});

const sessionLogSchema = z.object({
  workoutId: z.string().uuid(),
  date: z.string(),
  completed: z.boolean(),
  effortRating: z.number().int().min(1).max(10),
  notes: z.string().optional().default(''),
  duration: z.number().int().min(0),
  powerGained: z.number().int().min(0),
  exerciseLogs: z.array(exerciseLogSchema),
});

router.post('/', async (req, res) => {
  const client = await pool.connect();
  try {
    const body = sessionLogSchema.parse(req.body);
    const athleteId = req.athlete!.athleteId;

    // Verify workout belongs to this athlete
    const workoutCheck = await client.query(
      `SELECT w.id FROM workouts w
       JOIN week_schedules ws ON ws.id = w.schedule_id
       WHERE w.id = $1 AND ws.athlete_id = $2`,
      [body.workoutId, athleteId],
    );
    if (workoutCheck.rows.length === 0) {
      res.status(404).json({ error: 'Workout not found' });
      return;
    }

    await client.query('BEGIN');

    // Insert session log
    const sessionResult = await client.query(
      `INSERT INTO session_logs (athlete_id, workout_id, date, completed, effort_rating, notes, duration, power_gained)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id`,
      [athleteId, body.workoutId, body.date, body.completed, body.effortRating, body.notes, body.duration, body.powerGained],
    );
    const sessionLogId = sessionResult.rows[0].id;

    // Insert exercise logs and set logs
    for (const exLog of body.exerciseLogs) {
      const exResult = await client.query(
        `INSERT INTO exercise_logs (session_log_id, exercise_id, exercise_name, notes, completed)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        [sessionLogId, exLog.exerciseId, exLog.exerciseName, exLog.notes, exLog.completed],
      );
      const exerciseLogId = exResult.rows[0].id;

      for (const setLog of exLog.sets) {
        await client.query(
          `INSERT INTO set_logs (exercise_log_id, set_number, reps, weight, time_seconds, completed)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [exerciseLogId, setLog.setNumber, setLog.reps, setLog.weight, setLog.timeSeconds, setLog.completed],
        );
      }
    }

    // Update athlete stats
    if (body.completed) {
      await client.query(
        `UPDATE athletes
         SET power_level = power_level + $1,
             total_sessions_completed = total_sessions_completed + 1,
             streak_days = streak_days + 1,
             updated_at = NOW()
         WHERE id = $2`,
        [body.powerGained, athleteId],
      );
    }

    await client.query('COMMIT');

    res.status(201).json({ id: sessionLogId, powerGained: body.powerGained });
  } catch (err) {
    await client.query('ROLLBACK');
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation failed', details: err.errors });
      return;
    }
    console.error('Create log error:', err);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

// ═══════════════════════════════════
// GET /logs/:sessionId — get a session log with exercise details
// ═══════════════════════════════════
router.get('/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const athleteId = req.athlete!.athleteId;

    const sessionResult = await pool.query(
      `SELECT sl.*, w.title as workout_title, w.type as workout_type
       FROM session_logs sl
       JOIN workouts w ON w.id = sl.workout_id
       WHERE sl.id = $1 AND sl.athlete_id = $2`,
      [sessionId, athleteId],
    );

    if (sessionResult.rows.length === 0) {
      res.status(404).json({ error: 'Session log not found' });
      return;
    }

    const exerciseLogsResult = await pool.query(
      `SELECT el.*,
         json_agg(
           json_build_object(
             'id', s.id, 'setNumber', s.set_number, 'reps', s.reps,
             'weight', s.weight, 'timeSeconds', s.time_seconds, 'completed', s.completed
           ) ORDER BY s.set_number
         ) AS sets
       FROM exercise_logs el
       LEFT JOIN set_logs s ON s.exercise_log_id = el.id
       WHERE el.session_log_id = $1
       GROUP BY el.id`,
      [sessionId],
    );

    res.json({
      ...sessionResult.rows[0],
      exerciseLogs: exerciseLogsResult.rows.map((el) => ({
        id: el.id,
        exerciseId: el.exercise_id,
        exerciseName: el.exercise_name,
        notes: el.notes,
        completed: el.completed,
        sets: (el.sets || []).filter((s: any) => s.id !== null),
      })),
    });
  } catch (err) {
    console.error('Get session log error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
